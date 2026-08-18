'use client'
import { useState } from 'react';
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
  Eye, Download, Shield,
  Phone, ChevronLeft, ChevronRight
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
  `৳${new Intl.NumberFormat("en-BD").format(price)}`;

// Keys here MUST match the backend's condition values exactly (used for lookup).
const conditionColors: Record<string, string> = {
  "New": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Like New": "bg-sky-100 text-sky-700 border-sky-200",
  "Good": "bg-amber-100 text-amber-700 border-amber-200",
  "Acceptable": "bg-stone-100 text-stone-600 border-stone-200",
};

// Display-only Bangla labels for the same backend condition values.
const conditionLabels: Record<string, string> = {
  "New": "নতুন",
  "Like New": "প্রায় নতুন",
  "Good": "ভালো",
  "Acceptable": "ব্যবহারযোগ্য",
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
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-wide text-stone-400">{label}</p>
        <p className="text-sm font-medium text-stone-800 mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
};

const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-stone-100 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

// ── Image Gallery ─────────────────────────────────────────────────────────────

const ImageGallery = ({
  images, title, isDigital, isOutOfStock, condition, viewCount,
}: {
  images: string[];
  title: string;
  isDigital: boolean;
  isOutOfStock: boolean;
  condition?: string;
  viewCount?: number;
}) => {
  const gallery = images?.length ? images : ["/placeholder.png"];
  const [active, setActive] = useState(0);

  const goPrev = () => setActive((i) => (i - 1 + gallery.length) % gallery.length);
  const goNext = () => setActive((i) => (i + 1) % gallery.length);

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="relative bg-stone-100 rounded-2xl overflow-hidden aspect-[4/5] md:aspect-auto md:h-[480px]">
        <img
          alt={title}
          src={gallery[active]}
          className="w-full h-full object-cover"
        />

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="আগের ছবি"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center text-stone-600 hover:bg-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="পরের ছবি"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center text-stone-600 hover:bg-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        <span className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md shadow ${isDigital ? "bg-violet-500/90 text-white" : "bg-white/90 text-stone-700"
          }`}>
          {isDigital ? <Zap size={12} /> : <Package size={12} />}
          {isDigital ? "ডিজিটাল" : "ফিজিক্যাল"}
        </span>

        {!isDigital && condition && (
          <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-xs font-bold border ${conditionColors[condition] ?? "bg-stone-100 text-stone-600"}`}>
            {conditionLabels[condition] ?? condition}
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="px-4 py-2 bg-stone-800 text-white text-sm font-bold rounded-xl">
              স্টক শেষ
            </span>
          </div>
        )}

        <span className="absolute bottom-4 left-4 flex items-center gap-1 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-stone-600 shadow">
          <Eye size={12} /> {viewCount ?? 0} বার দেখা হয়েছে
        </span>
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gallery.map((src, idx) => (
            <button
              type="button"
              key={src + idx}
              onClick={() => setActive(idx)}
              aria-label={`ছবি ${idx + 1} দেখো`}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${idx === active ? "border-yellow-600" : "border-transparent hover:border-stone-200"
                }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const ProductDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const currentUser = useAppSelector(selectCurrentUser) as TUser;
  const { data: response, isLoading } = useGetProductBySlugQuery(slug!);
  const dispatch = useAppDispatch();

  const product = response?.data;

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-stone-50">
        <img className="h-32 w-auto" src={bookLoading} alt="লোড হচ্ছে..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center bg-stone-50 gap-3">
        <BookOpen className="w-12 h-12 text-stone-300" />
        <p className="text-stone-500 font-medium">পণ্যটি খুঁজে পাওয়া যায়নি</p>
      </div>
    );
  }

  const isDigital = product.productType === "Digital";
  const isOutOfStock = product.stockStatus === "Out of Stock";

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();

    const cartInfo = {
      quantity: 1,
      bookTitle: product?.title,
      book: product?._id,
      buyer: currentUser?.id,
      seller: product?.seller?._id,
      price: product?.price?.basePrice,
      shippingCost: 0,                           // platform-controlled
      deliveryOption: product?.fulfillmentOptions?.allowShipping ? "Shipping" : "Pickup",
      isNegotiable: product.price.isNegotiable,
      productImage: product.images?.[0] ?? "/placeholder.png",
    };

    try {
      dispatch(addToCart(cartInfo));
      toast.success(`"${product.title}" ব্যাগে যোগ করা হয়েছে!`);
    } catch {
      toast.error("ব্যাগে যোগ করা যায়নি");
    }
  };

  const ctaLabel = isDigital ? "ডিজিটাল কপি নাও" : "কার্টে যোগ করো";
  const CtaIcon = isDigital ? Zap : ShoppingBag;

  return (
    <div className="min-h-screen bg-stone-50 md:py-10 px-4 sm:px-6 lg:px-8 mt-12 pb-28 md:pb-10">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Main Card ── */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Left: Gallery */}
            <ImageGallery
              images={product.images ?? []}
              title={product.title}
              isDigital={isDigital}
              isOutOfStock={isOutOfStock}
              condition={product.condition}
              viewCount={product.viewCount}
            />

            {/* Right: Purchase panel — title, price, key facts, seller, CTA only */}
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
                      দরদাম চলবে
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
                    লেখক:{" "}
                    <span className="font-semibold text-stone-700">
                      {product.bookMetadata?.author}
                    </span>
                    {product.bookMetadata?.edition && (
                      <span className="text-stone-400"> · {product?.bookMetadata?.edition}</span>
                    )}
                  </p>
                )}

                {/* Price block */}
                <div className="flex items-baseline gap-3 mb-6 flex-wrap">
                  <span className="text-4xl font-bold text-stone-900">
                    {formatPrice(product?.price?.basePrice)}
                  </span>
                  {(product?.price?.discountPrice ?? 0) > 0 && (
                    <span className="text-lg text-stone-400 line-through font-normal">
                      {formatPrice(product?.price?.discountPrice!)}
                    </span>
                  )}
                  {!isDigital && (
                    <span className="text-sm text-emerald-600 font-medium">
                      + প্ল্যাটফর্ম শিপিং
                    </span>
                  )}
                </div>

                <div className="border-t border-stone-100 mb-6" />

                {/* Key facts only — full spec lives below the fold */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {!isDigital && (
                    <>
                      <MetaItem icon={MapPin} label="অবস্থান" value={product?.location} />
                      <MetaItem icon={Truck} label="ডেলিভারি"
                        value={
                          product?.fulfillmentOptions?.allowShipping && product?.fulfillmentOptions?.allowPickup
                            ? "শিপিং ও পিকআপ"
                            : product?.fulfillmentOptions?.allowShipping
                              ? "শিপিং"
                              : "শুধু পিকআপ"
                        }
                      />
                    </>
                  )}
                  {isDigital && (
                    <MetaItem icon={Download} label="ফাইল সাইজ" value={product?.digitalDetails?.fileSize ? `${product?.digitalDetails?.fileSize} MB` : undefined} />
                  )}
                  <MetaItem icon={Calendar} label="প্রকাশকাল" value={product?.bookMetadata?.publicationYear} />
                  <MetaItem icon={BookOpen} label="প্রকাশক" value={product?.bookMetadata?.publisher} />
                </div>

                {/* Seller */}
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 mb-6">
                  <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-stone-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-wide text-stone-400">বিক্রেতা</p>
                    <p className="text-sm font-semibold text-stone-700 truncate">
                      {product.seller?.name ?? "—"}
                    </p>
                  </div>
                  {!product.isContactHidden && (
                    <span className="ml-auto flex-shrink-0 text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <Phone size={14} className="text-emerald-600" /> {product.seller?.contactNo ?? "—"}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA — hidden on mobile, replaced by sticky bar below */}
              <div className="hidden md:block">
                {isOutOfStock ? (
                  <button disabled className="w-full py-4 rounded-2xl text-sm font-bold bg-stone-100 text-stone-400 cursor-not-allowed">
                    অনুপলব্ধ
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-yellow-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <CtaIcon className="w-5 h-5" />
                    {ctaLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Description ── full width, below the fold (reading content, not decision content) ── */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
              <BookOpen size={14} className="text-stone-500" />
            </div>
            <h2 className="text-sm font-bold text-stone-800">বিবরণ</h2>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
            {product?.description}
          </p>
        </SectionCard>

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Specifications (merged book + academic metadata) */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Tag size={14} className="text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-stone-800">স্পেসিফিকেশন</h2>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: "ভাষা", value: product?.bookMetadata?.language },
                { label: "ISBN", value: product?.bookMetadata?.isbn },
                { label: "লেভেল", value: product?.academicMetadata?.level },
                { label: "অনুষদ", value: product?.academicMetadata?.faculty },
                { label: "বিভাগ", value: product?.academicMetadata?.department },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-stone-50 last:border-0">
                  <span className="text-stone-400 text-xs font-medium">{label}</span>
                  <span className="text-stone-700 font-semibold text-xs text-right">{String(value)}</span>
                </div>
              ) : null)}
            </div>
          </SectionCard>

          {/* Seller notes */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
                <User size={14} className="text-stone-500" />
              </div>
              <h2 className="text-sm font-bold text-stone-800">বিক্রেতার নোট</h2>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              এই লিস্টিংটি বর্তমানে{" "}
              <span className={`font-semibold ${product.isPublished ? "text-emerald-600" : "text-amber-600"}`}>
                {product.isPublished ? "সক্রিয়" : "স্থগিত"}
              </span>।
              {" "}যোগাযোগের তথ্য{" "}
              <span className="font-semibold text-stone-700">
                {product.isContactHidden ? "গোপন" : "কেনার পর দেখা যাবে"}
              </span>।
              {product.price.isNegotiable && (
                <span className="block mt-2 text-amber-600 font-medium">
                  বিক্রেতা দরদামে রাজি।
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
              <h2 className="text-sm font-bold text-amber-900">নিরাপত্তা টিপস</h2>
            </div>
            <ul className="space-y-2.5 text-xs text-amber-800">
              {[
                isDigital
                  ? "কেনার পর প্রদত্ত নিরাপদ লিংক থেকেই ডাউনলোড করো।"
                  : "লেনদেন সম্পন্ন করার আগে বইয়ের অবস্থা যাচাই করো।",
                "সবসময় প্ল্যাটফর্মের চ্যাটের মাধ্যমে যোগাযোগ করো।",
                isDigital
                  ? "ডাউনলোডের পর ডিজিটাল পণ্য ফেরতযোগ্য নয়।"
                  : "প্রকাশকাল তোমার কারিকুলামের সাথে মিলছে কিনা যাচাই করো।",
                "সন্দেহজনক আচরণ আমাদের সাপোর্ট টিমকে জানাও।",
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

      {/* ── Sticky mobile CTA bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-20">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-wide text-stone-400">মূল্য</p>
          <p className="text-lg font-bold text-stone-900 truncate">{formatPrice(product?.price?.basePrice)}</p>
        </div>
        {isOutOfStock ? (
          <button disabled className="ml-auto py-3 px-6 rounded-xl text-sm font-bold bg-stone-100 text-stone-400 cursor-not-allowed">
            অনুপলব্ধ
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="ml-auto py-3 px-6 bg-yellow-600 active:bg-yellow-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
          >
            <CtaIcon className="w-4 h-4" />
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;