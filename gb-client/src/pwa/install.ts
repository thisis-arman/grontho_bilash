import { useEffect, useState } from "react";

// Installing Grontho Bilash as an app (PWA).
//
// Chrome, Edge and Samsung Internet fire `beforeinstallprompt` when the site
// can be installed; we keep that event and show our own button instead of
// the browser's mini bar. iPhone Safari has no such event, so there we show
// "Share → Add to Home Screen" instructions.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

export const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

export const isIosSafari = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  // Other iOS browsers (Chrome, Firefox, in-app browsers) can't add to the home screen the same way.
  return ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|FBAN|FBAV|Instagram/.test(ua);
};

// Called once from main.tsx, before React renders, so the event isn't missed.
export const initInstall = () => {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });

  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    // After load, so it never competes with the first paint. On the
    // pre-rendered home page this bundle itself starts after load.
    const register = () =>
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Not fatal: the site works the same without it.
      });
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }
};

// Opens the browser's install dialog. Resolves to true if the user installed.
export const promptInstall = async () => {
  if (!deferred) return false;
  const event = deferred;
  deferred = null;
  notify();
  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === "accepted";
};

export type InstallMode = "prompt" | "ios" | null;

// "prompt": we can open the install dialog. "ios": show Add to Home Screen
// steps. null: already installed or not installable in this browser.
export const useInstallMode = (): InstallMode => {
  const [canPrompt, setCanPrompt] = useState(() => deferred !== null);
  useEffect(() => {
    const update = () => setCanPrompt(deferred !== null);
    listeners.add(update);
    update();
    return () => {
      listeners.delete(update);
    };
  }, []);

  if (isStandalone()) return null;
  if (canPrompt) return "prompt";
  if (isIosSafari()) return "ios";
  return null;
};
