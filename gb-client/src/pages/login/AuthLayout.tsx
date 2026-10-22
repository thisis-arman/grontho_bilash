import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ShieldCheck, Truck } from "lucide-react";
import ThemeToggle from "../../theme/ThemeToggle";

const LOGO = "/logo-96.png";

const points = [
  { icon: BookOpen, text: "কম দামে পুরনো বই আর নোট কেনো" },
  { icon: Truck, text: "ডেলিভারি আর পেমেন্টের ঝামেলা আমাদের" },
  { icon: ShieldCheck, text: "লিস্টিং ফ্রি, কোনো লুকানো খরচ নেই" },
];

export const authInput =
  "block w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-900 placeholder:text-stone-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:bg-stone-50 disabled:text-stone-500";

export const authLabel = "mb-1.5 block text-sm font-semibold text-stone-700";

export const authButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-800 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

export const authLink = "font-semibold text-amber-700 underline-offset-4 hover:underline";

export const FormError = ({ message }: { message?: string }) =>
  message ? (
    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {message}
    </p>
  ) : null;

// Shared frame for login, sign-up and password reset: a dark brand panel on
// large screens and a single focused form everywhere else.
const AuthLayout = ({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) => (
  <div className="flex min-h-screen bg-stone-50 font-sans">
    <aside className="scheme-fixed relative hidden w-[44%] max-w-xl flex-col justify-between overflow-hidden bg-stone-950 p-12 text-white lg:flex">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl"
      />
      <Link to="/" className="relative flex items-center gap-2.5">
        <img src={LOGO} alt="" className="h-9 w-9 object-contain" />
        <span className="font-display text-xl font-bold">
          Grontho<span className="text-amber-400">Bilash</span>
        </span>
      </Link>

      <div className="relative">
        <p className="font-display text-4xl font-extrabold leading-tight">
          বই হাত বদলায়।
          <br />
          <span className="text-amber-400">জ্ঞান থেকে যায়।</span>
        </p>
        <ul className="mt-10 space-y-4">
          {points.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-stone-300">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-400">
                <Icon size={18} aria-hidden="true" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-sm text-stone-500">© {new Date().getFullYear()} Grontho Bilash</p>
    </aside>

    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:justify-end">
        <Link to="/" className="flex items-center gap-2 lg:hidden">
          <img src={LOGO} alt="" className="h-8 w-8 object-contain" />
          <span className="font-display text-lg font-bold text-stone-900">
            Grontho<span className="text-amber-500">Bilash</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle className="text-stone-500 hover:bg-stone-200 hover:text-stone-900" />
          <Link to="/" className="text-sm font-medium text-stone-500 hover:text-stone-900">
            ← সাইটে ফিরে যাও
          </Link>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-5 pb-12 pt-4 sm:items-center sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-bold text-stone-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-stone-600">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-stone-600">{footer}</div>}
        </div>
      </div>
    </main>
  </div>
);

export default AuthLayout;
