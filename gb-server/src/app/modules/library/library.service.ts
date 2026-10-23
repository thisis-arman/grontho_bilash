import httpStatus from "http-status";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { isAdminRole } from "../../middlewares/auth";
import { readerFor } from "../../utils/digitalFile";
import { ProductModel } from "../book/product.model";
import { OrderModel } from "../orders/order.model";

// A buyer's digital books. A copy opens once an admin has confirmed the
// bKash payment (paymentStatus "paid") and the order is not cancelled.

type TRequester = { id?: string; role?: string };

export type LibraryStatus = "ready" | "awaiting" | "failed";

const statusOf = (paymentStatus: string): LibraryStatus =>
  paymentStatus === "paid" ? "ready" : paymentStatus === "failed" ? "failed" : "awaiting";

// Every digital item the user has ordered, newest first, one row per book
// (the best status wins when the same book appears in several orders).
const getLibrary = async (userId: string) => {
  const orders = await OrderModel.find(
    { buyer: userId, isDeleted: false, orderStatus: { $ne: "cancelled" } },
    { orderId: 1, books: 1, paymentStatus: 1, createdAt: 1 }
  )
    .sort({ createdAt: -1 })
    .lean<{ _id: Types.ObjectId; orderId: string; books: { book: Types.ObjectId }[]; paymentStatus: string; createdAt: Date }[]>();

  const bookIds = [...new Set(orders.flatMap((o) => o.books.map((b) => String(b.book))))];
  const products = await ProductModel.find(
    { _id: { $in: bookIds }, productType: "Digital" },
    { title: 1, slug: 1, images: 1, "digitalDetails.fileType": 1, "digitalDetails.fileSize": 1, "digitalDetails.pages": 1, bookMetadata: 1 }
  ).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const rank: Record<LibraryStatus, number> = { ready: 3, awaiting: 2, failed: 1 };
  const rows = new Map<string, Record<string, unknown> & { status: LibraryStatus }>();
  for (const order of orders) {
    for (const item of order.books) {
      const product = byId.get(String(item.book));
      if (!product) continue;
      const status = statusOf(order.paymentStatus);
      const current = rows.get(String(product._id));
      if (current && rank[current.status] >= rank[status]) continue;
      rows.set(String(product._id), {
        product: String(product._id),
        title: product.title,
        slug: product.slug,
        image: product.images?.[0],
        author: product.bookMetadata?.author,
        fileType: product.digitalDetails?.fileType,
        fileSize: product.digitalDetails?.fileSize,
        pages: product.digitalDetails?.pages,
        orderId: order.orderId,
        order: String(order._id),
        orderedAt: order.createdAt,
        status,
      });
    }
  }
  return [...rows.values()];
};

// Ids of digital books the user already has (or is waiting for), so the
// product page can show "পড়ো" instead of "ব্যাগে যোগ করো".
const getOwnedStatus = async (userId: string) => {
  const library = await getLibrary(userId);
  return Object.fromEntries(library.map((row) => [row.product as string, row.status]));
};

// Opens one digital book: the buyer who paid, the seller, or an admin.
const openBook = async (productId: string, requester: TRequester) => {
  if (!Types.ObjectId.isValid(productId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "বইটি খুঁজে পাওয়া যায়নি");
  }
  const product = await ProductModel.findOne({ _id: productId, productType: "Digital" }).select(
    "+digitalDetails.file +digitalDetails.downloadUrl"
  );
  if (!product) throw new AppError(httpStatus.NOT_FOUND, "বইটি খুঁজে পাওয়া যায়নি");

  const isSeller = String(product.seller) === String(requester.id);
  if (!isSeller && !isAdminRole(requester.role)) {
    const paid = await OrderModel.exists({
      buyer: requester.id,
      "books.book": product._id,
      paymentStatus: "paid",
      orderStatus: { $ne: "cancelled" },
      isDeleted: false,
    });
    if (!paid) {
      const pending = await OrderModel.exists({
        buyer: requester.id,
        "books.book": product._id,
        orderStatus: { $ne: "cancelled" },
        isDeleted: false,
      });
      throw new AppError(
        httpStatus.FORBIDDEN,
        pending
          ? "তোমার পেমেন্ট যাচাই করা হচ্ছে। যাচাই শেষ হলেই বইটি পড়তে পারবে।"
          : "বইটি পড়তে আগে কিনে নাও।"
      );
    }
  }

  return {
    product: String(product._id),
    title: product.title,
    slug: product.slug,
    image: product.images?.[0],
    author: product.bookMetadata?.author,
    pages: product.digitalDetails?.pages,
    ...readerFor(product.digitalDetails),
  };
};

export const libraryService = { getLibrary, getOwnedStatus, openBook };
