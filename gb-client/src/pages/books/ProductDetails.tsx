'use client'
import { useParams } from 'react-router-dom';
import { useGetProductBySlugQuery } from '../../redux/features/book/bookApi';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addToCart } from '../../redux/features/cart/cartSlice';
import bookLoading from "../../assets/book-loading.gif";
import { selectCurrentUser, TUser } from '../../redux/features/auth/authSlice';
import { toast } from 'sonner';
import {
  ShoppingBag, MapPin, Calendar, BookOpen, CheckCircle,
  Truck, Zap, Package, User, Globe, Hash, Tag,
  Eye, Heart, Download, Shield
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
  `৳${new Intl.NumberFormat("en-BD").format(price)}`;

const conditionColors: Record<string, string> = {
  "New":        "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Like New":   "bg-sky-100 text-sky-700 border-sky-200",
  "Good":       "bg-amber-100 text-amber-700 border-amber-200",
  "Acceptable": "bg-stone-100 text-stone-600 border-stone-200",
};

// ── Sub-components ────────────────────────────────────────────────────────────

const MetaItem = ({
  icon: Icon, label, value
}: { icon: React.ElementType; label: string; value?: string | number }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-stone-500" />
      </div>
      <div>
        <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-400">{label}</p>
        <p className="text-sm font-medium text-stone-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
};

const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-stone-100 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const ProductDetails = () => {
  const { slug }  = useParams<{ slug: string }>();
  const { id: userId } = useAppSelector(selectCurrentUser) as TUser;
  const { data: response, isLoading } = useGetProductBySlugQuery(slug!);
  const dispatch = useAppDispatch();

  const product = response?.data;

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-stone-50">
        <img className="h-32 w-auto" src={bookLoading} alt="Loading..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center bg-stone-50 gap-3">
        <BookOpen className="w-12 h-12 text-stone-300" />
        <p className="text-stone-500 font-medium">Product not found</p>
      </div>
    );
  }

  const isDigital  = product.productType === "Digital";
  const isOutOfStock = product.stockStatus === "Out of Stock";

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();

    if (isDigital) {
      toast.info("Proceed to checkout for digital products");
      return;
    }

    const cartInfo = {
      quantity:       1,
      bookTitle:      product.title,
      book:           product._id,
      buyer:          userId,
      seller:         product.seller._id,
      price:          product.price.basePrice,
      shippingCost:   0,                           // platform-controlled
      deliveryOption: product.fulfillmentOptions?.allowShipping ? "Shipping" : "Pickup",
      isNegotiable:   product.price.isNegotiable,
      productImage:   product.images?.[0] ?? "/placeholder.png",
    };

    try {
      dispatch(addToCart(cartInfo));
      toast.success(`"${product.title}" added to bag!`);
    } catch {
      toast.error("Failed to add to bag");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Main Card ── */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Left: Image */}
            <div className="relative bg-stone-100 flex items-center justify-center min-h-[420px] md:min-h-[560px]  p-4">
              <img
                alt={product.title}
                src={product.images?.[0] ?? "/placeholder.png"}
                className="w-full h-full object-cover rounded-2xl"
              />

              {/* Product type badge */}
              <span className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow ${
                isDigital ? "bg-violet-500/90 text-white" : "bg-white/90 text-stone-700"
              }`}>
                {isDigital ? <Zap size={12} /> : <Package size={12} />}
                {product.productType}
              </span>

              {/* Condition badge (physical) */}
              {!isDigital && product.condition && (
                <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${conditionColors[product.condition] ?? "bg-stone-100 text-stone-600"}`}>
                  {product.condition}
                </span>
              )}

              {/* Out of stock overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
                  <span className="px-4 py-2 bg-stone-800 text-white text-sm font-bold rounded-xl tracking-widest uppercase">
                    Sold Out
                  </span>
                </div>
              )}

              {/* Stats row */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-stone-600 shadow">
                  <Eye size={12} /> {product.viewCount ?? 0} views
                </span>
              </div>
            </div>

            {/* Right: Info */}
            <div className="flex flex-col p-8 lg:p-10">
              <div className="flex-1">

                {/* Top meta row */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {product.category && (
                    <span className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs font-semibold rounded-lg">
                      {product.category}
                    </span>
                  )}
                  {product.price.isNegotiable && (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-lg border border-amber-100">
                      Negotiable
                    </span>
                  )}
                  {isDigital && product.digitalDetails?.fileType && (
                    <span className="px-2.5 py-1 bg-violet-50 text-violet-600 text-xs font-semibold rounded-lg border border-violet-100">
                      {product.digitalDetails.fileType}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl lg:text-3xl font-bold text-stone-900 leading-tight mb-2">
                  {product.title}
                </h1>

                {/* Author */}
                {product.bookMetadata?.author && (
                  <p className="text-sm text-stone-500 mb-5">
                    by{" "}
                    <span className="font-semibold text-stone-700">
                      {product.bookMetadata.author}
                    </span>
                    {product.bookMetadata.edition && (
                      <span className="text-stone-400"> · {product.bookMetadata.edition}</span>
                    )}
                  </p>
                )}

                {/* Price block */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-stone-900">
                    {formatPrice(product.price.basePrice)}
                  </span>
                  {(product.price.discountPrice ?? 0) > 0 && (
                    <span className="text-lg text-stone-400 line-through font-normal">
                      {formatPrice(product.price.discountPrice!)}
                    </span>
                  )}
                  {/* Shipping note — only for physical */}
                  {!isDigital && (
                    <span className="text-sm text-emerald-600 font-medium">
                      + Platform shipping
                    </span>
                  )}
                </div>

                <div className="border-t border-stone-100 mb-6" />

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {!isDigital && (
                    <>
                      <MetaItem icon={MapPin}    label="Location"   value={product.location} />
                      <MetaItem icon={Truck}     label="Delivery"
                        value={
                          product.fulfillmentOptions?.allowShipping && product.fulfillmentOptions?.allowPickup
                            ? "Shipping & Pickup"
                            : product.fulfillmentOptions?.allowShipping
                            ? "Shipping"
                            : "Pickup Only"
                        }
                      />
                    </>
                  )}
                  <MetaItem icon={Calendar}   label="Published"  value={product.bookMetadata?.publicationYear} />
                  <MetaItem icon={Globe}      label="Language"   value={product.bookMetadata?.language} />
                  <MetaItem icon={Hash}       label="ISBN"       value={product.bookMetadata?.isbn} />
                  <MetaItem icon={BookOpen}   label="Publisher"  value={product.bookMetadata?.publisher} />
                  {isDigital && (
                    <MetaItem icon={Download} label="File Size"  value={product.digitalDetails?.fileSize ? `${product.digitalDetails.fileSize} MB` : undefined} />
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-400 mb-2">Description</p>
                  <p className="text-sm text-stone-600 leading-relaxed">{product.description}</p>
                </div>

                {/* Seller */}
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 mb-6">
                  <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center">
                    <User size={16} className="text-stone-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-400">Seller</p>
                    <p className="text-sm font-semibold text-stone-700">
                      {product.seller?.name ?? "—"}
                    </p>
                  </div>
                  {!product.isContactHidden && (
                    <span className="ml-auto text-xs text-emerald-600 font-medium">Contact visible</span>
                  )}
                </div>
              </div>

              {/* CTA */}
              {isOutOfStock ? (
                <button disabled className="w-full py-4 rounded-2xl text-sm font-bold bg-stone-100 text-stone-400 cursor-not-allowed">
                  Unavailable
                </button>
              ) : isDigital ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-yellow-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Zap className="w-5 h-5" />
                  Get Digital Copy
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-amber-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to cart
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Academic metadata */}
          {product.academicMetadata?.level && (
            <SectionCard>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Tag size={14} className="text-amber-600" />
                </div>
                <h2 className="text-sm font-bold text-stone-800">Academic Info</h2>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Level",      value: product.academicMetadata?.level },
                  { label: "Faculty",    value: product.academicMetadata?.faculty },
                  { label: "Department", value: product.academicMetadata?.department },
                ].map(({ label, value }) => value ? (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-stone-50">
                    <span className="text-stone-400 text-xs font-medium">{label}</span>
                    <span className="text-stone-700 font-semibold text-xs">{String(value)}</span>
                  </div>
                ) : null)}
              </div>
            </SectionCard>
          )}

          {/* Seller notes */}
          <SectionCard className={product.academicMetadata?.level ? "" : "md:col-span-2"}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
                <User size={14} className="text-stone-500" />
              </div>
              <h2 className="text-sm font-bold text-stone-800">Seller Notes</h2>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              This listing is currently{" "}
              <span className={`font-semibold ${product.isPublished ? "text-emerald-600" : "text-amber-600"}`}>
                {product.isPublished ? "active" : "on hold"}
              </span>.
              {" "}Contact information is{" "}
              <span className="font-semibold text-stone-700">
                {product.isContactHidden ? "private" : "visible upon purchase"}
              </span>.
              {product.price.isNegotiable && (
                <span className="block mt-2 text-amber-600 font-medium">
                  💬 The seller is open to price negotiation.
                </span>
              )}
            </p>
          </SectionCard>

          {/* Safety tips */}
          <SectionCard className="bg-amber-50 border-amber-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                <Shield size={14} className="text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-amber-900">Safety Tips</h2>
            </div>
            <ul className="space-y-2.5 text-xs text-amber-800">
              {[
                isDigital
                  ? "Only download from the secure link provided after purchase."
                  : "Inspect book condition before completing the exchange.",
                "Always communicate through the platform chat.",
                isDigital
                  ? "Digital products are non-refundable after download."
                  : "Verify the publication year matches your curriculum.",
                "Report suspicious behaviour to our support team.",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                  {tip}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;