'use client'

import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectCurrentUser, TUser } from '../../redux/features/auth/authSlice';
import { toast } from 'sonner';
import { addToCart } from '../../redux/features/cart/cartSlice';
// import { TProduct } from '../../redux/features/product/productApi';
import { ShoppingCart, Eye, MapPin, Zap, Package, BookOpen } from 'lucide-react';


const conditionColors: Record<string, string> = {
  "New":        "bg-emerald-100 text-emerald-700",
  "Like New":   "bg-sky-100 text-sky-700",
  "Good":       "bg-amber-100 text-amber-700",
  "Acceptable": "bg-stone-100 text-stone-600",
};

const formatPrice = (price: number) =>
  `৳${new Intl.NumberFormat("en-BD").format(price)}`;


const TypeBadge = ({ type }: { type: "Physical" | "Digital" }) => (
  <span className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
    type === "Digital" ? "bg-yellow-500/90 text-white" : "bg-white/90 text-stone-700"
  }`}>
    {type === "Digital" ? <Zap size={10} /> : <Package size={10} />}
    {type}
  </span>
);

const ConditionBadge = ({ condition }: { condition?: string }) => {
  if (!condition || condition === "Digital Content") return null;
  return (
    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${conditionColors[condition] ?? "bg-stone-100 text-stone-600"}`}>
      {condition}
    </span>
  );
};


const ProductCard = ({ products }) => {
  const user     = useAppSelector(selectCurrentUser) as TUser;
  const dispatch = useAppDispatch();

  const handleAddToCart = (product) => {
    if (product.productType === "Digital") {
      toast.info("Proceed to checkout for digital products");
      return;
    }

    const cartInfo = {
      quantity:       1,
      bookTitle:      product.title,
      book:           product._id,
      buyer:          user?.id,
      seller:         product.seller._id,
      price:          product.price.basePrice,
      shippingCost:   0,                         // platform-controlled
      deliveryOption: product.fulfillmentOptions?.allowShipping ? "Shipping" : "Pickup",
      isNegotiable:   product.price.isNegotiable,
      productImage:   product.images[0] ?? "/placeholder.png",
    };

    try {
      dispatch(addToCart(cartInfo));
      toast.success(`"${product.title}" added to bag`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <>
      {products?.map((product) => (
        <article
          key={product._id}
          className="group relative flex flex-col bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
        >
          {/* ── Image ── */}
          <div className="relative aspect-square overflow-hidden bg-stone-100">
            {product.images?.[0] ? (
              <img
                alt={product.title}
                src={product.images[0]}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-stone-300">
                <BookOpen size={32} />
                <span className="text-xs">No image</span>
              </div>
            )}

            {/* Hover overlay with View button */}
            <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Link
                to={`/products/${product.slug}`}
                className="p-3 bg-white rounded-full text-stone-900 hover:bg-amber-500 hover:text-white transition-colors shadow-lg"
                title="View Details"
              >
                <Eye size={18} />
              </Link>
            </div>

            <ConditionBadge condition={product.condition} />
            <TypeBadge type={product.productType} />

            {/* Out of Stock overlay */}
            {product.stockStatus === "Out of Stock" && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="px-3 py-1.5 bg-stone-800 text-white text-xs font-bold rounded-lg tracking-widest uppercase">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* ── Content ── */}
          <div className="p-4 flex flex-col flex-1 gap-2.5">

            {/* Title + Price */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-stone-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors flex-1">
                <Link to={`/products/${product.slug}`}>{product.title}</Link>
              </h3>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-stone-900">
                  {formatPrice(product.price.basePrice)}
                </p>
                {(product.price.discountPrice ?? 0) > 0 && (
                  <p className="text-xs text-stone-400 line-through">
                    {formatPrice(product.price.discountPrice!)}
                  </p>
                )}
              </div>
            </div>

            {/* Author / edition */}
            {product.bookMetadata?.author && (
              <p className="text-xs text-stone-400 line-clamp-1">
                by{" "}
                <span className="text-stone-600 font-medium">
                  {product.bookMetadata.author}
                </span>
                {product.bookMetadata.edition && (
                  <span> · {product.bookMetadata.edition}</span>
                )}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {product.price.isNegotiable && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-semibold border border-amber-100">
                  Negotiable
                </span>
              )}
              {product.category && (
                <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[10px] font-semibold">
                  {product.category}
                </span>
              )}
              {product.productType === "Digital" && product.digitalDetails?.fileType && (
                <span className="px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-500 text-[10px] font-semibold border border-yellow-100">
                  {product.digitalDetails.fileType}
                </span>
              )}
            </div>

            {/* Location — physical only */}
            {product.productType === "Physical" && product.location && (
              <div className="flex items-center gap-1 text-stone-400 text-xs">
                <MapPin size={11} className="flex-shrink-0" />
                <span className="line-clamp-1">{product.location}</span>
              </div>
            )}

            {/* ── CTA ── */}
            <div className="mt-auto pt-1">
              {product.stockStatus === "Out of Stock" ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-stone-100 text-stone-400 cursor-not-allowed"
                >
                  Unavailable
                </button>
              ) : product.productType === "Digital" ? (
                <Link
                  to={`/products/${product.slug}`}
                  className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Zap size={15} />
                  Get Digital Copy
                </Link>
              ) : (
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full py-2.5 bg-yellow-50 hover:bg-yellow-600 text-stone-800 hover:text-white  hover:border-stone-900 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={15} />
                  Add to Bag
                </button>
              )}
            </div>

          </div>
        </article>
      ))}
    </>
  );
};

export default ProductCard;