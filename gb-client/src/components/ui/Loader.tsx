import { useEffect, useState } from "react";

// The site's one loading indicator: the Grontho Bilash logo inside a turning
// amber ring. Used for whole pages and lazy-loaded screens; lists keep their
// skeleton rows.

type LoaderProps = {
  label?: string;
  // "page": fills a screen-height block. "section": smaller, for panels.
  size?: "page" | "section";
  // Shows nothing for this long, so fast loads don't flash a spinner.
  delay?: number;
};

const Loader = ({ label = "লোড হচ্ছে…", size = "page", delay = 0 }: LoaderProps) => {
  const [visible, setVisible] = useState(delay === 0);
  useEffect(() => {
    if (delay === 0) return;
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  const box = size === "page" ? "min-h-[60vh]" : "py-16";
  const ring = size === "page" ? "h-20 w-20" : "h-14 w-14";
  const logo = size === "page" ? "h-10 w-10" : "h-7 w-7";

  return (
    <div className={`flex ${box} flex-col items-center justify-center gap-4`} role="status" aria-live="polite" aria-busy="true">
      {visible && (
        <>
          <span className={`relative flex ${ring} items-center justify-center`}>
            <span className="absolute inset-0 rounded-full border-[3px] border-amber-100" />
            <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-amber-500 border-r-amber-400 [animation-duration:900ms]" />
            <img src="/logo-96.png" alt="" width={40} height={40} className={`${logo} animate-pulse object-contain [animation-duration:1.6s]`} />
          </span>
          <span className="text-sm font-medium text-stone-500">{label}</span>
        </>
      )}
      {!visible && <span className="sr-only">{label}</span>}
    </div>
  );
};

export default Loader;
