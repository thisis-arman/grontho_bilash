import { Link, Navigate, useLocation } from "react-router-dom";
import { CheckCircle2, Library, Mail, PackageCheck, ShieldCheck } from "lucide-react";
import { usePageMeta } from "../../utils/usePageMeta";
import WhatsAppButton from "../../components/WhatsAppButton";

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
  usePageMeta("অর্ডার হয়েছে", undefined, undefined, { noindex: true });
  const state = useLocation().state as SuccessState | null;
  if (!state?.orders?.length) return <Navigate to="/user/my-orders" replace />;

  const { orders, paymentMethod, payLater, email } = state;
  const total = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const itemCount = orders.reduce((sum, o) => sum + o.books.reduce((s, b) => s + b.quantity, 0), 0);

  // Orders with nothing to ship (delivery 0) hold only digital books.
  const digitalOnly = orders.every((o) => o.shippingCost === 0);
  const hasDigital = orders.some((o) => o.shippingCost === 0);

  const steps = digitalOnly ? [
    { icon: ShieldCheck, text: "আমরা তোমার বিকাশ পেমেন্ট যাচাই করব, সাধারণত কয়েক ঘণ্টার মধ্যে।" },
    { icon: Library, text: "যাচাই হলেই বইটি “আমার লাইব্রেরি”-তে খুলে যাবে। ফোন বা কম্পিউটার, যেকোনো জায়গা থেকে পড়তে পারবে।" },
    { icon: Mail, text: "বই খুলে গেলে ইমেইলে জানিয়ে দেব। কোনো ডেলিভারি চার্জ নেই।" },
  ] : [
    { icon: ShieldCheck, text: "আমরা তোমার বিকাশ পেমেন্ট যাচাই করে অর্ডার নিশ্চিত করব, সাধারণত কয়েক ঘণ্টার মধ্যে।" },
    { icon: PackageCheck, text: orders.length > 1 ? "প্রত্যেক বিক্রেতার বই আলাদা পার্সেলে যাবে।" : "তোমার বই প্যাক করে তোমার কাছে পাঠানো হবে।" },
    {
      icon: Mail,
      text: payLater > 0 ? `অর্ডার হাতে পেলে ${taka(payLater)} ক্যাশ দেবে।` : "আর কিছু দিতে হবে না। তুমি বিকাশে পুরো টাকা দিয়েছ।",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-14 font-sans sm:py-20">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={34} aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold text-stone-900 sm:text-4xl">অর্ডার হয়েছে</h1>
        <p className="mt-2 text-stone-600">
          ধন্যবাদ! <strong className="text-stone-900">{email}</strong> ঠিকানায় রসিদ পাঠিয়েছি।
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl space-y-5">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-stone-900">
              {orders.length > 1 ? `${orders.length}টি অর্ডার` : "তোমার অর্ডার"} · {itemCount}টি বই
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
            {paymentMethod === "bkash" ? "বিকাশে দেওয়া হয়েছে (যাচাই বাকি)।" : "ক্যাশ অন ডেলিভারি, ডেলিভারি চার্জ বিকাশে দেওয়া হয়েছে।"}
          </p>
          {hasDigital && !digitalOnly && (
            <p className="mt-2 text-xs text-emerald-700">ডিজিটাল বইগুলো পেমেন্ট যাচাই হলেই “আমার লাইব্রেরি”-তে পাবে।</p>
          )}
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 font-semibold text-stone-900">এরপর কী হবে</h2>
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
            to={hasDigital ? "/user/library" : "/user/my-orders"}
            className="flex-1 rounded-xl bg-amber-400 px-5 py-3 text-center text-sm font-bold text-stone-950 hover:bg-amber-300"
          >
            {hasDigital ? "আমার লাইব্রেরি" : "আমার অর্ডার দেখো"}
          </Link>
          <Link
            to="/books"
            className="flex-1 rounded-xl border border-stone-200 bg-white px-5 py-3 text-center text-sm font-semibold text-stone-700 hover:border-stone-400"
          >
            আরও বই দেখো
          </Link>
        </div>
        <WhatsAppButton
          message={`আসসালামু আলাইকুম, আমি একটা অর্ডার করেছি। অর্ডার আইডি: ${orders.map((o) => o.orderId).join(", ")}। অর্ডারের আপডেট WhatsApp-এ জানাবেন।`}
          className="w-full"
        >
          WhatsApp-এ অর্ডারের আপডেট নাও
        </WhatsAppButton>
      </div>
    </div>
  );
};

export default OrderSuccess;
