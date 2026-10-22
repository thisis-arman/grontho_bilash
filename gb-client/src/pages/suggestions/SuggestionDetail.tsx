import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, Eye, FileText, X } from "lucide-react";
import Markdown from "../../components/content/Markdown";
import { formatBytes } from "../../components/content/useUpload";
import {
  Attachment,
  ContentKind,
  useGetSuggestionQuery,
  useRecordSuggestionDownloadMutation,
} from "../../redux/features/content/contentApi";
import { usePageMeta } from "../../utils/usePageMeta";
import { articleJsonLd } from "../../utils/structuredData";
import { KIND_TEXT, SuggestionCard } from "./SuggestionList";
import { bnNumber, examLevelLabel } from "../../i18n/labels";
import WhatsAppButton from "../../components/WhatsAppButton";

// Cloudinary's fl_attachment makes the browser save the file instead of
// opening it.
const downloadUrl = (url: string) =>
  url.includes("/upload/") ? url.replace("/upload/", "/upload/fl_attachment/") : url;

const actionClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";

const SuggestionDetail = ({ kind = "suggestion" }: { kind?: ContentKind }) => {
  const text = KIND_TEXT[kind];
  const { slug = "" } = useParams();
  const { data, isLoading, isError, error } = useGetSuggestionQuery({ slug, kind });
  const [recordDownload] = useRecordSuggestionDownloadMutation();
  const [lightbox, setLightbox] = useState<Attachment | null>(null);

  const item = data?.data.suggestion;
  const related = data?.data.related ?? [];
  usePageMeta(item ? `${item.title}${kind === "question" ? " – বিগত সালের প্রশ্ন" : " – সাজেশন"}` : undefined, item?.summary || (item ? `${item.subject} ${text.noun}, ফ্রি PDF ডাউনলোড।` : undefined), undefined, {
    type: "article",
    jsonLd: item
      ? articleJsonLd({
          title: item.title,
          path: `${text.path}/${item.slug}`,
          description: item.summary,
          authorName: item.preparedBy,
          publishedAt: item.publishedAt,
          updatedAt: item.updatedAt,
        })
      : null,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16" aria-busy="true">
        <div className="h-4 w-40 animate-pulse rounded bg-stone-200" />
        <div className="mt-4 h-10 w-full animate-pulse rounded bg-stone-200" />
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-stone-200" />
      </div>
    );
  }

  if (isError || !item) {
    const notFound = (error as { status?: number })?.status === 404;
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-stone-900">{notFound ? `${text.noun}টি পাওয়া যায়নি` : "কিছু একটা সমস্যা হয়েছে"}</h1>
        <p className="mt-2 text-stone-600">
          {notFound ? "এটি সরিয়ে নেওয়া হয়েছে বা লিংকটি ভুল।" : "লোড করা গেল না। একটু পরে আবার চেষ্টা করো।"}
        </p>
        <Link to={text.path} className="mt-6 inline-flex rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">
          সব {text.noun} দেখো
        </Link>
      </div>
    );
  }

  const pdfs = item.attachments.filter((a) => a.kind === "pdf");
  const images = item.attachments.filter((a) => a.kind === "image");

  const facts = [
    ["পরীক্ষা", examLevelLabel(item.level)],
    ["বিষয়", item.subjectCode ? `${item.subject} (${item.subjectCode})` : item.subject],
    ["প্রোগ্রাম", item.program],
    ["বিভাগ", item.department],
    ["বর্ষ", item.academicYear],
    [kind === "question" ? "সাল" : "পরীক্ষার সাল", item.examYear],
    [kind === "question" ? "বোর্ড / প্রতিষ্ঠান" : "প্রতিষ্ঠান", item.institution],
    ["তৈরি করেছেন", item.preparedBy],
  ].filter(([, value]) => value);

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 lg:pt-14">
        <Link to={text.path} className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900">
          <ArrowLeft size={16} aria-hidden="true" /> সব {text.noun}
        </Link>

        <header className="mt-6">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">{examLevelLabel(item.level)}</span>
            <span className="flex items-center gap-1 text-stone-500">
              <Eye size={14} aria-hidden="true" /> {bnNumber(item.views)} বার দেখা
            </span>
            {item.downloads > 0 && (
              <span className="flex items-center gap-1 text-stone-500">
                <Download size={14} aria-hidden="true" /> {bnNumber(item.downloads)} বার ডাউনলোড
              </span>
            )}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">{item.title}</h1>
          {item.summary && <p className="mt-3 text-lg leading-relaxed text-stone-600">{item.summary}</p>}
        </header>

        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 sm:grid-cols-4">
          {facts.map(([label, value]) => (
            <div key={label} className="bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-stone-900">{value}</dd>
            </div>
          ))}
        </dl>

        {pdfs.length > 0 && (
          <section className="mt-10" aria-labelledby="files-heading">
            <h2 id="files-heading" className="mb-4 font-display text-xl font-bold text-stone-900">
              ফাইল
            </h2>
            <ul className="space-y-3">
              {pdfs.map((file) => (
                <li
                  key={file.url}
                  className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <FileText size={22} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-stone-900">{file.name}</p>
                      <p className="text-xs text-stone-500">PDF{file.size ? ` · ${formatBytes(file.size)}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${actionClass} flex-1 border border-stone-200 bg-white text-stone-700 hover:border-stone-400 sm:flex-none`}
                    >
                      <ExternalLink size={15} aria-hidden="true" /> খুলে দেখো
                    </a>
                    <a
                      href={downloadUrl(file.url)}
                      onClick={() => recordDownload(item.slug)}
                      className={`${actionClass} flex-1 bg-stone-900 text-white hover:bg-stone-800 sm:flex-none`}
                    >
                      <Download size={15} aria-hidden="true" /> ডাউনলোড
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {images.length > 0 && (
          <section className="mt-10" aria-labelledby="images-heading">
            <h2 id="images-heading" className="mb-4 font-display text-xl font-bold text-stone-900">
              ছবি
            </h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image) => (
                <li key={image.url}>
                  <button
                    type="button"
                    onClick={() => setLightbox(image)}
                    className="group block w-full overflow-hidden rounded-xl border border-stone-200 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {item.body && (
          <section className="mt-10 rounded-2xl border border-stone-200 bg-white px-5 py-2 sm:px-8">
            <Markdown>{item.body}</Markdown>
          </section>
        )}

        <p className="mt-8 text-xs leading-relaxed text-stone-500">
          {kind === "question"
            ? "প্রশ্নগুলো আগের পরীক্ষা থেকে সংগ্রহ করা, শুধু অনুশীলনের জন্য। কোনো ভুল চোখে পড়লে আমাদের জানাও।"
            : "সাজেশন হলো আগের প্রশ্ন আর শিক্ষকদের পরামর্শ থেকে তৈরি পড়ার সহায়িকা। পরীক্ষায় ঠিক এগুলোই আসবে এমন নিশ্চয়তা নেই, তাই পুরো সিলেবাসও পড়ো।"}
        </p>
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-stone-600">অন্য কোনো বিষয় বা সালের {text.noun} দরকার? জানাও, আমরা যোগ করার চেষ্টা করবো।</p>
          <WhatsAppButton className="flex-shrink-0" message={`${text.request}`}>WhatsApp-এ চাও</WhatsAppButton>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="mb-6 font-display text-2xl font-bold text-stone-900">একই রকম আরও {text.noun}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <SuggestionCard key={r._id} item={{ ...r, kind: r.kind ?? kind }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.name}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            autoFocus
            aria-label="বন্ধ করো"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={22} aria-hidden="true" />
          </button>
          <img
            src={lightbox.url}
            alt={lightbox.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
          />
          <a
            href={downloadUrl(lightbox.url)}
            onClick={(e) => {
              e.stopPropagation();
              recordDownload(item.slug);
            }}
            className={`${actionClass} absolute bottom-6 bg-white text-stone-900`}
          >
            <Download size={15} aria-hidden="true" /> ডাউনলোড
          </a>
        </div>
      )}
    </div>
  );
};

export default SuggestionDetail;
