import { Types } from "mongoose";
import { ProductModel } from "../book/product.model";
import { ShippingArea } from "./order.interface";

// Delivery charge per parcel. Each seller ships their own parcel, so a cart
// with books from two sellers pays it twice. Parcels with only digital items
// are free.
export const SHIPPING_RATES: Record<ShippingArea, number> = {
  inside: 70,
  outside: 130,
};

// Business rule shown at checkout: the delivery charge is paid up front by
// bKash even for cash-on-delivery orders, so the order carries a bKash
// transaction ID either way. Set to false to allow pure cash on delivery.
export const REQUIRE_ADVANCE_DELIVERY_CHARGE = true;

export type QuoteLineStatus = "ok" | "limited" | "soldOut" | "unavailable" | "own";

export interface QuoteLine {
  book: string;
  quantity: number;
  status: QuoteLineStatus;
  // Present when the product still exists.
  title?: string;
  slug?: string;
  image?: string;
  unitPrice?: number;
  productType?: "Physical" | "Digital";
  maxQuantity?: number;
  seller?: { _id: string; name?: string };
}

export interface CartQuote {
  lines: QuoteLine[];
  parcels: { seller: string; sellerName?: string; itemsTotal: number; shipping: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  hasPhysical: boolean;
  // False while any line needs the buyer's attention.
  canCheckout: boolean;
}

// Prices a cart from the database, exactly the way an order would be
// charged. The bag page uses it to show real totals and flag problems
// before the buyer submits; createOrder applies the same rules.
export const quoteCart = async (
  items: { book: string; quantity: number }[],
  shippingArea: ShippingArea,
  buyerId?: string
): Promise<CartQuote> => {
  const merged = new Map<string, number>();
  for (const item of items) {
    merged.set(item.book, (merged.get(item.book) ?? 0) + item.quantity);
  }

  const ids = [...merged.keys()].filter((id) => Types.ObjectId.isValid(id));
  const products = await ProductModel.find({ _id: { $in: ids } }).populate<{
    seller: { _id: Types.ObjectId; name?: string };
  }>("seller", "name");
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const lines: QuoteLine[] = [...merged.entries()].map(([book, quantity]) => {
    const product = byId.get(book);
    if (!product || product.isDeleted || !product.isPublished) {
      return { book, quantity, status: "unavailable" };
    }

    const isDigital = product.productType === "Digital";
    const stock = isDigital ? Infinity : product.inventory?.quantity ?? 0;
    const sellerId = String(product.seller?._id ?? product.seller);

    const base: QuoteLine = {
      book,
      quantity,
      status: "ok",
      title: product.title,
      slug: product.slug,
      image: product.images?.[0],
      unitPrice: product.price.basePrice,
      productType: product.productType,
      seller: { _id: sellerId, name: product.seller?.name },
      ...(isDigital ? {} : { maxQuantity: stock }),
    };

    if (buyerId && sellerId === String(buyerId)) return { ...base, status: "own" };
    if (!isDigital && (product.stockStatus === "Out of Stock" || stock <= 0)) {
      return { ...base, status: "soldOut" };
    }
    // A digital copy is one per buyer.
    if (isDigital && quantity > 1) return { ...base, quantity: 1, status: "limited", maxQuantity: 1 };
    if (quantity > stock) return { ...base, quantity: stock, status: "limited" };
    return base;
  });

  const priced = lines.filter((l) => l.status === "ok" || l.status === "limited");
  const groups = new Map<string, QuoteLine[]>();
  for (const line of priced) {
    const key = line.seller!._id;
    groups.set(key, [...(groups.get(key) ?? []), line]);
  }

  const parcels = [...groups.entries()].map(([seller, group]) => ({
    seller,
    sellerName: group[0].seller?.name,
    itemsTotal: group.reduce((sum, l) => sum + l.unitPrice! * l.quantity, 0),
    shipping: group.every((l) => l.productType === "Digital") ? 0 : SHIPPING_RATES[shippingArea],
  }));

  const subtotal = parcels.reduce((sum, p) => sum + p.itemsTotal, 0);
  const shipping = parcels.reduce((sum, p) => sum + p.shipping, 0);

  return {
    lines,
    parcels,
    subtotal,
    shipping,
    total: subtotal + shipping,
    hasPhysical: priced.some((l) => l.productType === "Physical"),
    canCheckout: lines.length > 0 && lines.every((l) => l.status === "ok"),
  };
};
