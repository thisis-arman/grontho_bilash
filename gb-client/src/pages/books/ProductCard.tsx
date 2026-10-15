import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { BookOpen, Check, MapPin, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectCurrentUser, TUser } from '../../redux/features/auth/authSlice';
import { addToCart, getProductsFromCart } from '../../redux/features/cart/cartSlice';
import { IProduct } from '../../types/interface';

const PRICE = new Intl.NumberFormat('en-BD');
const formatPrice = (price: number) => `৳${PRICE.format(price)}`;

// Serves Cloudinary images at the size the card actually needs.
const sized = (url: string, width: number) =>
  url?.includes('res.cloudinary.com') && url.includes('/image/upload/')
    ? url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width},c_limit/`)
    : url;

type ShopProduct = Omit<IProduct, 'seller'> & { seller?: { _id?: string; name?: string } | string | null };

const ProductCard = ({ product }: { product: ShopProduct }) => {
  const user = useAppSelector(selectCurrentUser) as TUser | null;
  const cart = useAppSelector(getProductsFromCart);
  const dispatch = useAppDispatch();
  const [imageFailed, setImageFailed] = useState(false);

  const sellerId = typeof product.seller === 'object' ? product.seller?._id : product.seller;
  const isDigital = product.productType === 'Digital';
  const isOut = product.stockStatus === 'Out of Stock';
  const inCart = cart.find((item) => item.book === product._id);
  const stock = product.inventory?.quantity ?? 0;
  // basePrice is what the buyer pays; discountPrice is the older, higher
  // price shown crossed out.
  const original = product.price?.discountPrice > product.price?.basePrice ? product.price.discountPrice : null;
  const image = product.images?.[0];

  const handleAdd = () => {
    if (user?.id && user.id === sellerId) {
      toast.info('This is your own listing');
      return;
    }
    if (isOut) return;
    if (inCart && (isDigital || inCart.quantity >= stock)) {
      toast.info(isDigital ? 'Already in your bag' : 'You already have every available copy in your bag');
      return;
    }
    dispatch(
      addToCart({
        book: product._id,
        seller: sellerId,
        quantity: 1,
        bookTitle: product.title,
        price: product.price.basePrice,
        productImage: image ?? '',
        deliveryOption: product.fulfillmentOptions?.allowShipping ? 'Shipping' : 'Pickup',
        isNegotiable: product.price.isNegotiable,
        shippingCost: 0,
      })
    );
    toast.success('Added to your bag', { description: product.title });
  };

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-100">
        <Link
          to={`/products/${product.slug}`}
          className="block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400"
          aria-label={product.title}
        >
          {image && !imageFailed ? (
            <img
              src={sized(image, 400)}
              srcSet={image.includes('res.cloudinary.com') ? `${sized(image, 300)} 300w, ${sized(image, 450)} 450w, ${sized(image, 600)} 600w` : undefined}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
              className={`h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04] ${isOut ? 'opacity-50 grayscale' : ''}`}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-stone-300">
              <BookOpen size={36} aria-hidden="true" />
            </span>
          )}
        </Link>

        <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-stone-700 shadow-sm backdrop-blur">
          {isOut ? 'Sold out' : isDigital ? 'Digital' : product.condition}
        </span>

        {!isOut && (
          <button
            type="button"
            onClick={handleAdd}
            aria-label={inCart ? `${product.title} is in your bag` : `Add ${product.title} to bag`}
            className={`absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${
              inCart ? 'bg-emerald-500 text-white' : 'bg-white text-stone-900 hover:bg-amber-400'
            }`}
          >
            {inCart ? <Check size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col px-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-stone-900">
          <Link to={`/products/${product.slug}`} className="transition-colors hover:text-amber-700">
            {product.title}
          </Link>
        </h3>
        {product.bookMetadata?.author && (
          <p className="mt-0.5 truncate text-xs text-stone-500">{product.bookMetadata.author}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="flex items-baseline gap-1.5">
            <span className="font-display text-base font-bold text-stone-900">{formatPrice(product.price.basePrice)}</span>
            {original && <span className="text-xs text-stone-400 line-through">{formatPrice(original)}</span>}
          </p>
          {product.price.isNegotiable && (
            <span className="flex-shrink-0 text-[11px] font-medium text-emerald-700">Negotiable</span>
          )}
        </div>
        {product.location && !isDigital && (
          <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-stone-400">
            <MapPin size={11} aria-hidden="true" className="flex-shrink-0" />
            <span className="truncate">{product.location}</span>
          </p>
        )}
      </div>
    </article>
  );
};

export default memo(ProductCard);

export const ProductCardSkeleton = () => (
  <div aria-hidden="true">
    <div className="aspect-[3/4] animate-pulse rounded-2xl bg-stone-200/70" />
    <div className="mt-3 h-3.5 w-4/5 animate-pulse rounded bg-stone-200/70" />
    <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-stone-200/70" />
    <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-stone-200/70" />
  </div>
);
