import { Link, Navigate, useLocation } from "react-router-dom";
import { CheckCircle2, Mail, PackageCheck, ShieldCheck } from "lucide-react";
import { usePageMeta } from "../../utils/usePageMeta";

interface PlacedOrder {
  _id: string;
  orderId: string;
  totalAmount: number;
  shippingCost: number;
  books: { bookTitle: string; quantity: number }[];
}

interface SuccessState {
  orders: PlacedOrder[];
  paymentMethod: "cod" | "bkash";
  payLater: number;
  email: string;
}

const PRICE = new Intl.NumberFormat("en-BD");
const taka = (n = 0) => `৳${PRICE.format(n)}`;

// Shown right after checkout. Reached only from the bag (the order details
// come in the navigation state); anyone landing here directly is sent to
// their orders.
const OrderSuccess = () => {
  usePageMeta("Order placed", undefined, undefined, { noindex: true });
  const state = useLocation().state as SuccessState | null;
  if (!state?.orders?.length) return <Navigate to="/user/my-orders" replace />;

  const { orders, paymentMethod, payLater, email } = state;
  const total = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const itemCount = orders.reduce((sum, o) => sum + o.books.reduce((s, b) => s + b.quantity, 0), 0);

  const steps = [
    { icon: ShieldCheck, text: "We check your bKash payment and confirm the order, usually within a few hours." },
    { icon: PackageCheck, text: orders.length > 1 ? "Each seller's books ship as a separate parcel." : "Your books are packed and sent to you." },
    {
      icon: Mail,
      text: payLater > 0 ? `Pay ${taka(payLater)} in cash when the order arrives.` : "Nothing more to pay. You paid in full by bKash.",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-14 font-sans sm:py-20">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={34} aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold text-stone-900 sm:text-4xl">Order placed</h1>
        <p className="mt-2 text-stone-600">
          Thank you! We sent a receipt to <strong className="text-stone-900">{email}</strong>.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl space-y-5">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-stone-900">
              {orders.length > 1 ? `${orders.length} orders` : "Your order"} · {itemCount} item{itemCount === 1 ? "" : "s"}
            </h2>
            <p className="font-display text-2xl font-bold text-stone-900">{taka(total)}</p>
          </div>
          <ul className="mt-4 divide-y divide-stone-100 text-sm">
            {orders.map((order) => (
              <li key={order._id} className="py-3">
                <p className="font-mono text-xs font-semibold text-stone-500">{order.orderId}</p>
                <p className="mt-1 text-stone-800">
                  {order.books.map((b) => `${b.bookTitle}${b.quantity > 1 ? ` × ${b.quantity}` : ""}`).join(", ")}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-stone-500">
            {paymentMethod === "bkash" ? "Paid by bKash (awaiting verification)." : "Cash on delivery, delivery charge paid by bKash."}
          </p>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 font-semibold text-stone-900">What happens next</h2>
          <ol className="space-y-4">
            {steps.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3 text-sm text-stone-700">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <span className="pt-1.5">{text}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/user/my-orders"
            className="flex-1 rounded-xl bg-amber-400 px-5 py-3 text-center text-sm font-bold text-stone-950 hover:bg-amber-300"
          >
            Track my orders
          </Link>
          <Link
            to="/books"
            className="flex-1 rounded-xl border border-stone-200 bg-white px-5 py-3 text-center text-sm font-semibold text-stone-700 hover:border-stone-400"
          >
            Keep browsing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
