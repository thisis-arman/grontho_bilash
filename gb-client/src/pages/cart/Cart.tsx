import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, BookOpen, Lock, Minus, Plus, ShoppingBag, Trash2, Truck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectCurrentUser, TUser } from "../../redux/features/auth/authSlice";
import {
  CartItem,
  clearCart,
  getProductsFromCart,
  removeFromCart,
  syncCartItems,
  updateQuantity,
} from "../../redux/features/cart/cartSlice";
import { useCreateOrderMutation, useGetCartQuoteQuery } from "../../redux/features/order/orderApi";
import { usePageMeta } from "../../utils/usePageMeta";

// Keep in sync with gb-server/src/app/modules/orders/order.quote.ts.
const SHIPPING_RATES = { inside: 70, outside: 130 } as const;
const REQUIRE_ADVANCE_DELIVERY_CHARGE = true;
const BKASH_NUMBER = "01883-350118";

// Delivery details are remembered on this device for next time.
const DETAILS_KEY = "gb-checkout-details";

type Area = "inside" | "outside";
type Method = "cod" | "bkash";

interface QuoteLine {
  book: string;
  quantity: number;
  status: "ok" | "limited" | "soldOut" | "unavailable" | "own";
  title?: string;
  slug?: string;
  image?: string;
  unitPrice?: number;
  productType?: "Physical" | "Digital";
  maxQuantity?: number;
  seller?: { _id: string; name?: string };
}

interface Quote {
  lines: QuoteLine[];
  parcels: { seller: string; sellerName?: string; itemsTotal: number; shipping: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  hasPhysical: boolean;
  canCheckout: boolean;
}

const PRICE = new Intl.NumberFormat("en-BD");
const taka = (n = 0) => `৳${PRICE.format(n)}`;

const PHONE_RE = /^01[3-9]\d{8}$/;
const TRX_RE = /^[A-Z0-9]{8,12}$/;
const normalisePhone = (v: string) => v.replace(/[\s-]/g, "").replace(/^\+?88/, "");

const STATUS_NOTE: Record<QuoteLine["status"], string | null> = {
  ok: null,
  limited: "Fewer copies are available, so the quantity was lowered.",
  soldOut: "Sold out. Remove it to continue.",
  unavailable: "No longer available. Remove it to continue.",
  own: "This is your own listing. Remove it to continue.",
};

const field =
  "block w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200";
const labelClass = "mb-1.5 block text-sm font-semibold text-stone-700";
const card = "rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6";

const loadDetails = () => {
  try {
    return JSON.parse(localStorage.getItem(DETAILS_KEY) ?? "{}") as Partial<{
      recipientName: string;
      phone: string;
      address: string;
      area: Area;
    }>;
  } catch {
    return {};
  }
};

// Waits for the bag to stop changing before asking the server again, so
// tapping + five times sends one request, not five.
const useDebounced = <T,>(value: T, ms = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
};

const Cart = () => {
  usePageMeta("Your bag", undefined, undefined, { noindex: true });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser) as TUser | null;
  const items = useAppSelector(getProductsFromCart);
  const [createOrder, { isLoading: isPlacing }] = useCreateOrderMutation();

  const saved = useMemo(loadDetails, []);
  const [area, setArea] = useState<Area>(saved.area ?? "inside");
  const [method, setMethod] = useState<Method>("cod");
  const [form, setForm] = useState({
    recipientName: saved.recipientName ?? user?.name ?? "",
    phone: saved.phone ?? "",
    email: user?.email ?? "",
    address: saved.address ?? "",
    note: "",
    trxId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  const liveArgs = useMemo(
    () => ({ books: items.map(({ book, quantity }) => ({ book, quantity })), shippingArea: area }),
    [items, area]
  );
  const quoteArgs = useDebounced(liveArgs);
  const { data, isFetching, isError, refetch } = useGetCartQuoteQuery(quoteArgs, { skip: items.length === 0 });
  const quote: Quote | undefined = data?.data;
  // True from the moment the bag or area changes until the new totals
  // arrive, so an order can never be placed against an out-of-date total.
  const totalsPending = isFetching || JSON.stringify(liveArgs) !== JSON.stringify(quoteArgs);
  const lineFor = (book: string) => quote?.lines.find((l) => l.book === book);

  // Bring the bag in line with the server: current price, title, image and
  // available copies. Tell the buyer if a price changed.
  const announcedPriceChange = useRef(false);
  useEffect(() => {
    if (!quote) return;
    let priceChanged = false;
    const updates = quote.lines
      .filter((line) => line.title)
      .map((line) => {
        const item = items.find((i) => i.book === line.book);
        if (!item) return null;
        const changes: Partial<CartItem> = {};
        if (line.unitPrice !== undefined && line.unitPrice !== item.price) {
          changes.price = line.unitPrice;
          priceChanged = true;
        }
        if (line.title !== item.bookTitle) changes.bookTitle = line.title!;
        if (line.image && line.image !== item.productImage) changes.productImage = line.image;
        if (line.productType && line.productType !== item.productType) changes.productType = line.productType;
        if (line.slug && line.slug !== item.slug) changes.slug = line.slug;
        if (line.seller && line.seller._id !== item.seller) changes.seller = line.seller._id;
        if (line.maxQuantity !== item.maxQuantity) changes.maxQuantity = line.maxQuantity;
        if (line.status === "limited" && line.quantity !== item.quantity) changes.quantity = line.quantity;
        return Object.keys(changes).length ? { book: line.book, changes } : null;
      })
      .filter(Boolean) as { book: string; changes: Partial<CartItem> }[];

    if (updates.length) dispatch(syncCartItems(updates));
    if (priceChanged && !announcedPriceChange.current) {
      announcedPriceChange.current = true;
      toast.info("Some prices changed since you added them. Your bag shows the current prices.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote]);

  const digitalOnly = quote ? !quote.hasPhysical : items.every((i) => i.productType === "Digital");
  const effectiveMethod: Method = digitalOnly ? "bkash" : method;
  const needsTrx = effectiveMethod === "bkash" || (REQUIRE_ADVANCE_DELIVERY_CHARGE && !digitalOnly);
  const payNow = quote ? (effectiveMethod === "bkash" ? quote.total : REQUIRE_ADVANCE_DELIVERY_CHARGE ? quote.shipping : 0) : 0;
  const payLater = quote ? quote.total - payNow : 0;
  const parcels = quote?.parcels.length ?? 0;

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.recipientName.trim().length < 2) next.recipientName = "Enter the recipient's name.";
    if (!PHONE_RE.test(normalisePhone(form.phone))) next.phone = "Enter a valid mobile number, e.g. 01712345678.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email.";
    if (form.address.trim().length < 10) next.address = "Write the full address: house, road, area, district.";
    if (needsTrx && !TRX_RE.test(form.trxId.trim().toUpperCase())) {
      next.trxId = "Enter the transaction ID from your bKash confirmation SMS.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const placeOrder = async (event: FormEvent) => {
    event.preventDefault();
    setServerError("");
    if (!quote?.canCheckout || totalsPending) return;
    if (!validate()) {
      toast.error("Please check the highlighted fields.");
      return;
    }

    try {
      const result = await createOrder({
        books: items.map(({ book, quantity }) => ({ book, quantity })),
        recipientName: form.recipientName.trim(),
        phoneNumber: normalisePhone(form.phone),
        email: form.email.trim(),
        deliveryAddress: form.address.trim(),
        shippingArea: area,
        paymentMethod: effectiveMethod,
        ...(needsTrx ? { transactionId: form.trxId.trim().toUpperCase() } : {}),
        ...(form.note.trim() ? { comment: form.note.trim() } : {}),
      }).unwrap();

      try {
        localStorage.setItem(
          DETAILS_KEY,
          JSON.stringify({ recipientName: form.recipientName.trim(), phone: form.phone, address: form.address.trim(), area })
        );
      } catch {
        // Not remembering details is fine.
      }
      dispatch(clearCart());
      navigate("/checkout/success", {
        replace: true,
        state: { orders: result.data, paymentMethod: effectiveMethod, payLater, email: form.email.trim() },
      });
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message;
      setServerError(message || "Could not place the order. Please try again.");
      refetch();
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-stone-50 px-4 text-center font-sans">
        <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-stone-100 text-stone-400">
          <ShoppingBag size={36} aria-hidden="true" />
        </span>
        <h1 className="font-display text-3xl font-bold text-stone-900">Your bag is empty</h1>
        <p className="mt-2 text-stone-600">Find a book you need and add it here.</p>
        <Link to="/books" className="mt-6 rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-stone-950 hover:bg-amber-300">
          Browse books
        </Link>
      </div>
    );
  }

  const summary = (
    <div className={`${card} space-y-3`}>
      <h2 className="font-display text-lg font-bold text-stone-900">Order summary</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone-600">Items</dt>
          <dd className="font-semibold text-stone-900">{quote ? taka(quote.subtotal) : "…"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-stone-600">
            Delivery
            {parcels > 1 && <span className="block text-xs text-stone-500">{parcels} sellers ship separately</span>}
          </dt>
          <dd className="font-semibold text-stone-900">{quote ? (quote.shipping ? taka(quote.shipping) : "Free") : "…"}</dd>
        </div>
        <div className="flex justify-between border-t border-stone-200 pt-3 text-base">
          <dt className="font-bold text-stone-900">Total</dt>
          <dd
            className={`font-display text-2xl font-bold text-stone-900 transition-opacity ${totalsPending ? "opacity-40" : ""}`}
            aria-live="polite"
          >
            {quote ? taka(quote.total) : "…"}
          </dd>
        </div>
      </dl>

      {user && quote && (
        <dl className="space-y-1.5 rounded-xl bg-stone-50 p-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-600">Pay now by bKash</dt>
            <dd className="font-semibold text-stone-900">{taka(payNow)}</dd>
          </div>
          {payLater > 0 && (
            <div className="flex justify-between">
              <dt className="text-stone-600">Pay on delivery</dt>
              <dd className="font-semibold text-stone-900">{taka(payLater)}</dd>
            </div>
          )}
        </dl>
      )}

      {serverError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {serverError}
        </p>
      )}

      {user ? (
        <button
          type="submit"
          form="checkout-form"
          disabled={!quote?.canCheckout || totalsPending || isPlacing}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3.5 text-sm font-bold text-stone-950 transition hover:bg-amber-300 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
        >
          <Lock size={16} aria-hidden="true" />
          {isPlacing ? "Placing order…" : totalsPending || !quote ? "Updating totals…" : `Place order · ${taka(quote.total)}`}
        </button>
      ) : (
        <Link
          to="/login"
          state={{ from: "/cart" }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3.5 text-sm font-bold text-stone-950 hover:bg-amber-300"
        >
          Log in to check out
        </Link>
      )}
      {quote && !quote.canCheckout && (
        <p className="text-center text-xs font-medium text-red-600">Fix the items marked in your bag to continue.</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <div className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-12">
        <h1 className="font-display text-3xl font-bold text-stone-900 sm:text-4xl">Your bag</h1>
        <p className="mt-1 text-sm text-stone-500">
          {items.reduce((s, i) => s + i.quantity, 0)} item{items.length === 1 && items[0].quantity === 1 ? "" : "s"}
          {isError && (
            <button type="button" onClick={() => refetch()} className="ml-2 font-semibold text-red-600 underline">
              Prices could not be checked. Retry
            </button>
          )}
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="min-w-0 space-y-6">
            {/* Items */}
            <ul className={`${card} divide-y divide-stone-100 !py-2`}>
              {items.map((item) => {
                const line = lineFor(item.book);
                const note = line ? STATUS_NOTE[line.status] : null;
                const blocked = line && ["soldOut", "unavailable", "own"].includes(line.status);
                const max = item.productType === "Digital" ? 1 : item.maxQuantity ?? 100;
                return (
                  <li key={item.book} className="flex gap-4 py-4">
                    <Link to={item.slug ? `/products/${item.slug}` : "#"} className="flex-shrink-0">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt=""
                          className={`h-24 w-[4.5rem] rounded-lg bg-stone-100 object-cover ${blocked ? "opacity-40 grayscale" : ""}`}
                        />
                      ) : (
                        <span className="flex h-24 w-[4.5rem] items-center justify-center rounded-lg bg-stone-100 text-stone-400">
                          <BookOpen size={24} aria-hidden="true" />
                        </span>
                      )}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            to={item.slug ? `/products/${item.slug}` : "#"}
                            className="line-clamp-2 text-sm font-semibold text-stone-900 hover:text-amber-700"
                          >
                            {item.bookTitle}
                          </Link>
                          <p className="mt-0.5 text-xs text-stone-500">
                            {item.productType === "Digital" ? "Digital copy" : "Book"}
                            {line?.seller?.name ? ` · Sold by ${line.seller.name}` : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCart(item.book))}
                          aria-label={`Remove ${item.bookTitle}`}
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>

                      {note && (
                        <p className={`mt-2 flex items-start gap-1.5 text-xs font-medium ${blocked ? "text-red-600" : "text-amber-700"}`}>
                          <AlertTriangle size={14} aria-hidden="true" className="mt-px flex-shrink-0" />
                          {note}
                        </p>
                      )}

                      <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                        {item.productType === "Digital" ? (
                          <span className="text-xs text-stone-500">1 copy</span>
                        ) : (
                          <div className="flex items-center rounded-xl border border-stone-200" role="group" aria-label="Quantity">
                            <button
                              type="button"
                              onClick={() => dispatch(updateQuantity({ productId: item.book, quantity: item.quantity - 1 }))}
                              disabled={item.quantity <= 1 || !!blocked}
                              aria-label="One fewer"
                              className="flex h-9 w-9 items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30"
                            >
                              <Minus size={14} aria-hidden="true" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-stone-900" aria-live="polite">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => dispatch(updateQuantity({ productId: item.book, quantity: item.quantity + 1 }))}
                              disabled={item.quantity >= max || !!blocked}
                              aria-label="One more"
                              className="flex h-9 w-9 items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30"
                            >
                              <Plus size={14} aria-hidden="true" />
                            </button>
                          </div>
                        )}
                        <p className="text-right">
                          <span className="block font-display text-base font-bold text-stone-900">
                            {taka(item.price * item.quantity)}
                          </span>
                          {item.quantity > 1 && <span className="text-xs text-stone-500">{taka(item.price)} each</span>}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {user ? (
              <form id="checkout-form" onSubmit={placeOrder} noValidate className="space-y-6">
                {/* Delivery */}
                <section className={card} aria-labelledby="delivery-heading">
                  <h2 id="delivery-heading" className="mb-5 flex items-center gap-2 font-display text-lg font-bold text-stone-900">
                    <Truck size={20} aria-hidden="true" className="text-amber-500" /> Delivery details
                  </h2>

                  {!digitalOnly && (
                    <fieldset className="mb-5">
                      <legend className={labelClass}>Delivery area</legend>
                      <div className="grid grid-cols-2 gap-3">
                        {(["inside", "outside"] as const).map((value) => (
                          <label
                            key={value}
                            className={`flex cursor-pointer flex-col rounded-xl border p-3.5 transition ${
                              area === value ? "border-amber-400 bg-amber-50 ring-1 ring-amber-400" : "border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="area"
                              value={value}
                              checked={area === value}
                              onChange={() => setArea(value)}
                              className="sr-only"
                            />
                            <span className="text-sm font-semibold text-stone-900">
                              {value === "inside" ? "Inside Chattogram" : "Outside Chattogram"}
                            </span>
                            <span className="text-xs text-stone-500">{taka(SHIPPING_RATES[value])} per seller</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="recipientName" className={labelClass}>Recipient's name</label>
                      <input
                        id="recipientName"
                        value={form.recipientName}
                        onChange={(e) => set("recipientName", e.target.value)}
                        autoComplete="name"
                        maxLength={80}
                        aria-invalid={!!errors.recipientName}
                        className={`${field} ${errors.recipientName ? "border-red-400" : ""}`}
                      />
                      {errors.recipientName && <p className="mt-1 text-xs text-red-600">{errors.recipientName}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelClass}>Mobile number</label>
                      <input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        autoComplete="tel-national"
                        placeholder="01712345678"
                        aria-invalid={!!errors.phone}
                        className={`${field} ${errors.phone ? "border-red-400" : ""}`}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="email" className={labelClass}>Email for the receipt</label>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                        className={`${field} ${errors.email ? "border-red-400" : ""}`}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="address" className={labelClass}>
                        {digitalOnly ? "Address" : "Full delivery address"}
                      </label>
                      <textarea
                        id="address"
                        rows={2}
                        value={form.address}
                        onChange={(e) => set("address", e.target.value)}
                        autoComplete="street-address"
                        maxLength={300}
                        placeholder="House, road, area, thana, district"
                        aria-invalid={!!errors.address}
                        className={`${field} ${errors.address ? "border-red-400" : ""}`}
                      />
                      {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="note" className={labelClass}>
                        Note for us <span className="font-normal text-stone-500">(optional)</span>
                      </label>
                      <input
                        id="note"
                        value={form.note}
                        onChange={(e) => set("note", e.target.value)}
                        maxLength={500}
                        placeholder="e.g. call before delivery"
                        className={field}
                      />
                    </div>
                  </div>
                </section>

                {/* Payment */}
                <section className={card} aria-labelledby="payment-heading">
                  <h2 id="payment-heading" className="mb-5 flex items-center gap-2 font-display text-lg font-bold text-stone-900">
                    <Wallet size={20} aria-hidden="true" className="text-amber-500" /> Payment
                  </h2>

                  <fieldset className="space-y-3">
                    <legend className="sr-only">Payment method</legend>
                    {(
                      [
                        {
                          value: "cod",
                          title: "Cash on delivery",
                          desc: REQUIRE_ADVANCE_DELIVERY_CHARGE
                            ? "Send the delivery charge by bKash now, pay for the books when they arrive."
                            : "Pay everything when your order arrives.",
                        },
                        { value: "bkash", title: "Pay in full by bKash", desc: "Send the whole amount now." },
                      ] as const
                    ).map((option) => {
                      const disabled = option.value === "cod" && digitalOnly;
                      const active = effectiveMethod === option.value;
                      return (
                        <label
                          key={option.value}
                          className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                          } ${active ? "border-amber-400 bg-amber-50 ring-1 ring-amber-400" : "border-stone-200 hover:border-stone-300"}`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={option.value}
                            checked={active}
                            disabled={disabled}
                            onChange={() => setMethod(option.value)}
                            className="mt-0.5 h-4 w-4 border-stone-300 text-amber-500 focus:ring-amber-400"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-stone-900">{option.title}</span>
                            <span className="block text-xs text-stone-500">
                              {disabled ? "Not available for digital items." : option.desc}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </fieldset>

                  {needsTrx && (
                    <div className="mt-5 rounded-xl border border-pink-200 bg-pink-50 p-4">
                      <ol className="list-decimal space-y-1 pl-5 text-sm text-stone-700">
                        <li>
                          Open bKash and <strong>Send Money</strong> to <strong className="whitespace-nowrap">{BKASH_NUMBER}</strong>.
                        </li>
                        <li>
                          Send exactly <strong>{quote ? taka(payNow) : "…"}</strong>
                          {effectiveMethod === "cod" ? " (the delivery charge)." : " (your order total)."}
                        </li>
                        <li>Enter the transaction ID from the confirmation SMS below.</li>
                      </ol>
                      <label htmlFor="trxId" className={`${labelClass} mt-4`}>bKash transaction ID</label>
                      <input
                        id="trxId"
                        value={form.trxId}
                        onChange={(e) => set("trxId", e.target.value.toUpperCase().replace(/\s/g, ""))}
                        placeholder="e.g. 8N7X654WQA"
                        maxLength={12}
                        autoComplete="off"
                        aria-invalid={!!errors.trxId}
                        className={`${field} font-mono uppercase tracking-wider ${errors.trxId ? "border-red-400" : ""}`}
                      />
                      {errors.trxId && <p className="mt-1 text-xs text-red-600">{errors.trxId}</p>}
                      <p className="mt-2 text-xs text-stone-500">
                        We check every payment before confirming the order. Each transaction ID can be used once.
                      </p>
                    </div>
                  )}
                </section>
              </form>
            ) : (
              <div className={`${card} text-center`}>
                <p className="font-semibold text-stone-900">Log in to check out</p>
                <p className="mt-1 text-sm text-stone-600">Your bag is saved on this device and will be here after you log in.</p>
              </div>
            )}
          </div>

          <aside className="hidden lg:sticky lg:top-24 lg:block">{summary}</aside>
          <div className="lg:hidden">{summary}</div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
