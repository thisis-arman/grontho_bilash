import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectCurrentUser, TUser } from "../../redux/features/auth/authSlice";
import { addToCart, getProductsFromCart } from "../../redux/features/cart/cartSlice";
import { IProduct } from "../../types/interface";

type CartableProduct = Omit<IProduct, "seller"> & { seller?: { _id?: string; name?: string } | string | null };

// The one place that decides whether a product can go in the bag, used by
// both the product cards and the product page so they behave the same.
export const useAddToCart = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser) as TUser | null;
  const cart = useAppSelector(getProductsFromCart);

  const inCart = (productId: string) => cart.find((item) => item.book === productId);

  const add = (product: CartableProduct) => {
    const sellerId = typeof product.seller === "object" ? product.seller?._id : product.seller ?? undefined;
    const isDigital = product.productType === "Digital";
    const stock = product.inventory?.quantity ?? 0;
    const existing = inCart(product._id);

    if (user?.id && user.id === sellerId) {
      toast.info("This is your own listing");
      return false;
    }
    if (!isDigital && (product.stockStatus === "Out of Stock" || stock <= 0)) {
      toast.error("Sorry, this one is sold out");
      return false;
    }
    if (existing && (isDigital || existing.quantity >= stock)) {
      toast.info(isDigital ? "Already in your bag" : "You already have every available copy in your bag");
      return false;
    }

    dispatch(
      addToCart({
        book: product._id,
        seller: sellerId,
        bookTitle: product.title,
        price: product.price.basePrice,
        productImage: product.images?.[0] ?? "",
        productType: product.productType,
        slug: product.slug,
        ...(isDigital ? {} : { maxQuantity: stock }),
      })
    );
    toast.success("Added to your bag", {
      description: product.title,
      action: { label: "View bag", onClick: () => window.location.assign("/cart") },
    });
    return true;
  };

  return { add, inCart };
};
