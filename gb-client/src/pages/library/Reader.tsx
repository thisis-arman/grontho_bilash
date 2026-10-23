import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, FileText, Lock, Minus, Plus } from "lucide-react";
import Loader from "../../components/ui/Loader";
import { errorMessage } from "../../components/dashboard/ui";
import { whatsappLink } from "../../components/WhatsAppButton";
import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUser, type TUser } from "../../redux/features/auth/authSlice";
import { useOpenBookQuery } from "../../redux/features/library/libraryApi";
import { bnNumber } from "../../i18n/labels";
import { PageMeta } from "../../utils/usePageMeta";

// Full-screen reader for a bought digital book. PDFs arrive as one image
// per page, so reading works in every phone browser without a PDF app.
// The reader remembers the last page per book on this device.

const WIDTHS = ["max-w-2xl", "max-w-3xl", "max-w-4xl", "max-w-6xl"];
const positionKey = (id: string) => `gb_read_${id}`;

const readSaved = (key: string, fallback: number) => {
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  } catch {
    return fallback;
  }
};

const Reader = () => {
  const { productId = "" } = useParams();
  const user = useAppSelector(selectCurrentUser) as TUser | null;
  const { data, isLoading, isError, error, refetch, fulfilledTimeStamp } = useOpenBookQuery(productId);
  const book = data?.data;

  const [zoom, setZoom] = useState(() => readSaved("gb_read_zoom", 1));
  const [current, setCurrent] = useState(1);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const restored = useRef(false);

  // Track the page in view and remember it.
  useEffect(() => {
    if (book?.mode !== "pages") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const page = Number((entry.target as HTMLElement).dataset.page);
          setCurrent(page);
          try {
            localStorage.setItem(positionKey(productId), String(page));
          } catch {
            // Not remembering the page is fine.
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [book, productId]);

  // Jump back to where the reader left off.
  useEffect(() => {
    if (book?.mode !== "pages" || restored.current) return;
    restored.current = true;
    const page = readSaved(positionKey(productId), 1);
    if (page > 1) requestAnimationFrame(() => pageRefs.current[page - 1]?.scrollIntoView({ block: "start" }));
  }, [book, productId]);

  const changeZoom = (step: number) => {
    const next = Math.min(WIDTHS.length - 1, Math.max(0, zoom + step));
    setZoom(next);
    try {
      localStorage.setItem("gb_read_zoom", String(next));
    } catch {
      // ignore
    }
  };

  // Download links expire after a few minutes: fetch a fresh one if needed.
  const download = async () => {
    const ageMinutes = (Date.now() - (fulfilledTimeStamp ?? 0)) / 60000;
    let url = book?.downloadUrl;
    if (ageMinutes > (book?.expiresInMinutes ?? 15) - 1) url = (await refetch()).data?.data.downloadUrl;
    if (url) window.location.assign(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Loader label="বইটি খোলা হচ্ছে…" />
      </div>
    );
  }

  if (isError || !book) {
    const status = (error as { status?: number })?.status;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6 text-center">
        <PageMeta title="বইটি খোলা যায়নি" noindex />
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Lock size={26} aria-hidden="true" />
        </span>
        <h1 className="font-display text-2xl font-bold text-stone-900">বইটি খোলা যায়নি</h1>
        <p className="mt-2 max-w-sm text-stone-600">{errorMessage(error, "একটু পরে আবার চেষ্টা করো।")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/user/library" className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-300">
            আমার লাইব্রেরি
          </Link>
          {status !== 403 && (
            <button type="button" onClick={() => refetch()} className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700">
              আবার চেষ্টা করো
            </button>
          )}
        </div>
      </div>
    );
  }

  const total = book.pageUrls?.length ?? 0;
  const watermark = user?.email ? `${user.email} · gronthobilash.com` : "gronthobilash.com";

  return (
    <div className="min-h-screen bg-stone-200/70" onContextMenu={(e) => e.preventDefault()}>
      <PageMeta title={book.title} noindex />

      {/* Top bar */}
      <header className="scheme-fixed sticky top-0 z-20 border-b border-stone-800 bg-stone-950/95 text-stone-100 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:px-5">
          <Link to="/user/library" className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg hover:bg-white/10" aria-label="লাইব্রেরিতে ফিরে যাও">
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{book.title}</p>
            {book.mode === "pages" && (
              <p className="text-xs text-stone-400">
                পৃষ্ঠা {bnNumber(current)} / {bnNumber(total)}
              </p>
            )}
          </div>
          {book.mode === "pages" && (
            <div className="hidden items-center gap-1 sm:flex">
              <button type="button" onClick={() => changeZoom(-1)} disabled={zoom === 0} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-40" aria-label="ছোট করো">
                <Minus size={18} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => changeZoom(1)} disabled={zoom === WIDTHS.length - 1} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-40" aria-label="বড় করো">
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>
          )}
          {book.downloadUrl && (
            <button type="button" onClick={download} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-amber-400 px-3 text-sm font-bold text-stone-950 hover:bg-amber-300">
              <Download size={16} aria-hidden="true" /> <span className="hidden sm:inline">ডাউনলোড</span>
            </button>
          )}
        </div>
      </header>

      {book.mode === "pages" && (
        <main className={`mx-auto ${WIDTHS[zoom]} space-y-3 px-2 py-4 sm:space-y-5 sm:px-4 sm:py-8`}>
          {book.pageUrls!.map((src, i) => (
            <div
              key={i}
              ref={(el) => (pageRefs.current[i] = el)}
              data-page={i + 1}
              className="relative overflow-hidden rounded-md bg-white shadow-sm"
              style={{ minHeight: i === 0 ? undefined : "40vh" }}
            >
              <img
                src={src}
                alt={`পৃষ্ঠা ${i + 1}`}
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                className="block w-full select-none"
              />
              <span className="pointer-events-none absolute bottom-2 right-3 select-none text-[10px] font-medium text-stone-400/70">
                {watermark}
              </span>
            </div>
          ))}
          <p className="py-6 text-center text-sm text-stone-500">বইয়ের শেষ। ভালো লাগলে বন্ধুদের গ্রন্থবিলাসের কথা বলো।</p>
        </main>
      )}

      {book.mode === "image" && (
        <main className="mx-auto max-w-4xl px-2 py-4 sm:py-8">
          <div className="relative overflow-hidden rounded-md bg-white shadow-sm">
            <img src={book.imageUrl} alt={book.title} draggable={false} className="block w-full select-none" />
            <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-stone-400/70">{watermark}</span>
          </div>
        </main>
      )}

      {(book.mode === "download" || book.mode === "link") && (
        <main className="mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center">
          {book.image ? (
            <img src={book.image} alt="" className="h-48 w-auto rounded-xl shadow-lg" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-amber-600 shadow">
              <FileText size={36} aria-hidden="true" />
            </span>
          )}
          <h1 className="mt-6 font-display text-2xl font-bold text-stone-900">{book.title}</h1>
          <p className="mt-2 text-sm text-stone-600">
            {book.mode === "download"
              ? `${book.fileType ?? "ফাইল"}${book.fileSize ? ` · ${book.fileSize}` : ""}। ডাউনলোড করে ফোনের যেকোনো রিডার অ্যাপে (যেমন Google Play Books) খোলো।`
              : "বিক্রেতার দেওয়া লিংক থেকে ফাইলটি খোলো।"}
          </p>
          {book.mode === "download" ? (
            <button type="button" onClick={download} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-bold text-stone-950 hover:bg-amber-300">
              <Download size={18} aria-hidden="true" /> ডাউনলোড করো
            </button>
          ) : (
            <a href={book.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-bold text-stone-950 hover:bg-amber-300">
              <ExternalLink size={18} aria-hidden="true" /> ফাইল খোলো
            </a>
          )}
          <a
            href={whatsappLink(`আসসালামু আলাইকুম, "${book.title}" খুলতে সমস্যা হচ্ছে।`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-sm font-medium text-stone-500 underline underline-offset-4 hover:text-stone-800"
          >
            খুলতে সমস্যা? WhatsApp-এ জানাও
          </a>
        </main>
      )}
    </div>
  );
};

export default Reader;
