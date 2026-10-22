import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BellRing, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { useCreateBookAlertMutation } from "../../redux/features/hub/hubApi";
import WhatsAppButton from "../WhatsAppButton";
import { bnNumber } from "../../i18n/labels";

const PENDING_KEY = "gb-pending-alert";

// "Tell me when this book is listed." Guests are sent to log in and
// brought straight back to the same page, where the alert is then saved
// without a second tap.
export const useNotifyMe = (query: string) => {
  const user = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();
  const location = useLocation();
  const [createAlert, { isLoading }] = useCreateBookAlertMutation();
  const [saved, setSaved] = useState(false);

  const subscribe = async () => {
    if (!user) {
      try {
        sessionStorage.setItem(PENDING_KEY, query);
      } catch {
        // Private mode: they just tap once more after logging in.
      }
      navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
      toast.info("লগইন করো, তারপর এক চাপে খোঁজ সেভ হবে।");
      return;
    }
    try {
      const { data } = await createAlert(query).unwrap();
      if (data.alreadyAvailable) {
        toast.success(`ভালো খবর! এখনই ${bnNumber(data.available)}টি কপি পাওয়া যাচ্ছে।`);
        navigate(`/books?search=${encodeURIComponent(query)}`);
        return;
      }
      setSaved(true);
      toast.success("খোঁজ সেভ হয়েছে। বইটি পাওয়া গেলে ইমেইলে জানাবো।");
    } catch (error) {
      toast.error((error as { data?: { message?: string } })?.data?.message ?? "সেভ করা গেল না। আবার চেষ্টা করো।");
    }
  };

  // Back from logging in: finish what the guest asked for.
  const resumed = useRef(false);
  useEffect(() => {
    if (!user || resumed.current) return;
    let pending: string | null = null;
    try {
      pending = sessionStorage.getItem(PENDING_KEY);
    } catch {
      return;
    }
    if (pending && pending === query) {
      resumed.current = true;
      sessionStorage.removeItem(PENDING_KEY);
      subscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, query]);

  return { subscribe, saved, isLoading };
};

// Small button for lists (e.g. one missing book in a book list).
export const NotifyButton = ({ query }: { query: string }) => {
  const { subscribe, saved, isLoading } = useNotifyMe(query);
  if (saved) {
    return (
      <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={14} aria-hidden="true" /> জানানো হবে
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={subscribe}
      disabled={isLoading}
      aria-label={`${query} পাওয়া গেলে আমাকে জানাও`}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
    >
      {isLoading ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <BellRing size={14} aria-hidden="true" />}
      পেলে জানাও
    </button>
  );
};

// Shown when a search finds nothing: notify me, or ask on WhatsApp.
const NotifyMe = ({ query }: { query: string }) => {
  const { subscribe, saved, isLoading } = useNotifyMe(query);

  if (saved) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left" role="status">
        <p className="flex items-center gap-2 font-semibold text-emerald-800">
          <CheckCircle2 size={18} aria-hidden="true" /> ঠিক আছে! খোঁজ সেভ হয়েছে।
        </p>
        <p className="mt-1 text-sm leading-relaxed text-emerald-800/80">
          “{query}” কেউ লিস্ট করলেই তোমাকে ইমেইল করবো। সব খোঁজ দেখতে পাবে{" "}
          <Link to="/user/my-alerts" className="font-semibold underline">
            ড্যাশবোর্ডের ‘আমার খোঁজ’
          </Link>{" "}
          পাতায়।
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left sm:p-6">
      <p className="flex items-center gap-2 font-display text-lg font-bold text-stone-900">
        <BellRing size={20} className="text-amber-600" aria-hidden="true" /> বইটি পাওয়া গেলে জানতে চাও?
      </p>
      <p className="mt-1 text-sm leading-relaxed text-stone-600">
        “{query}” এখন কারও কাছে নেই। কেউ লিস্ট করলেই আমরা তোমাকে জানিয়ে দেবো।
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={subscribe}
          disabled={isLoading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:opacity-60"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <BellRing size={16} aria-hidden="true" />}
          পাওয়া গেলে আমাকে জানাও
        </button>
        <WhatsAppButton message={`আসসালামু আলাইকুম, আমি এই বইটি খুঁজছি: ${query}। পাওয়া গেলে জানাবেন?`}>
          WhatsApp-এ চাও
        </WhatsAppButton>
      </div>
    </div>
  );
};

export default NotifyMe;
