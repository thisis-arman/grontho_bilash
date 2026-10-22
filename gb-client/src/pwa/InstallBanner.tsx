import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { promptInstall, useInstallMode } from "./install";

const DISMISS_KEY = "gb-install-dismissed";
const DISMISS_DAYS = 14;
// Wait a little so the banner never greets a visitor before the page does.
const SHOW_AFTER_MS = 6000;
// Pages with their own bottom bar or a checkout in progress.
const HIDDEN_ON = ["/products/", "/cart", "/checkout"];

const recentlyDismissed = () => {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at > 0 && Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

const InstallBanner = () => {
  const mode = useInstallMode();
  const { pathname } = useLocation();
  const [ready, setReady] = useState(false);
  const [closed, setClosed] = useState(recentlyDismissed);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(t);
  }, []);

  if (!mode || !ready || closed || HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const dismiss = () => {
    setClosed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Private mode: it just shows again next visit.
    }
  };

  const install = async () => {
    if (await promptInstall()) setClosed(true);
  };

  return (
    <div
      role="dialog"
      aria-label="গ্রন্থবিলাস অ্যাপ ইনস্টল করো"
      className="scheme-fixed fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-2xl border border-white/10 bg-stone-900 p-4 text-white shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-start gap-3">
        <img src="/icon-192.png" alt="" width={44} height={44} className="h-11 w-11 flex-shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold">গ্রন্থবিলাস অ্যাপ ইনস্টল করো</p>
          {mode === "prompt" ? (
            <p className="mt-0.5 text-sm leading-snug text-stone-300">
              হোম স্ক্রিন থেকে এক চাপে খোলো, ব্রাউজার ছাড়াই। কোনো প্লে স্টোর লাগবে না।
            </p>
          ) : (
            <p className="mt-0.5 text-sm leading-snug text-stone-300">
              নিচের <Share size={14} className="inline align-[-2px]" aria-label="Share" /> বাটনে চাপ দাও, তারপর{" "}
              <span className="whitespace-nowrap font-semibold text-white">
                <SquarePlus size={14} className="inline align-[-2px]" aria-hidden="true" /> Add to Home Screen
              </span>{" "}
              বেছে নাও।
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="বন্ধ করো"
          className="-m-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      {mode === "prompt" && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={install}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 text-sm font-semibold text-stone-900 transition hover:bg-amber-300"
          >
            <Download size={16} aria-hidden="true" /> ইনস্টল করো
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="h-10 rounded-xl px-4 text-sm font-semibold text-stone-300 transition hover:bg-white/10"
          >
            এখন না
          </button>
        </div>
      )}
    </div>
  );
};

export default InstallBanner;
