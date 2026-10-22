import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, FileQuestion, FileText, Image as ImageIcon, NotebookPen, Search } from "lucide-react";
import {
  ContentKind,
  Suggestion,
  useGetSuggestionFiltersQuery,
  useGetSuggestionsQuery,
} from "../../redux/features/content/contentApi";
import Pagination from "../../utils/Pagination";
import { usePageMeta } from "../../utils/usePageMeta";
import { bnNumber, examLevelLabel } from "../../i18n/labels";
import WhatsAppButton from "../../components/WhatsAppButton";
import QuestionHub from "./QuestionHub";

// The same list serves two kinds of exam material: suggestions (/suggestions)
// and past question papers (/questions).

const field =
  "block h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200";

const chip = (active: boolean) =>
  `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
    active ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
  }`;

export const KIND_TEXT: Record<
  ContentKind,
  {
    path: string;
    eyebrow: string;
    title: string;
    intro: string;
    metaTitle: string;
    metaDesc: string;
    searchPlaceholder: string;
    noun: string;
    empty: string;
    request: string;
  }
> = {
  suggestion: {
    path: "/suggestions",
    eyebrow: "সব শিক্ষার্থীর জন্য ফ্রি",
    title: "পরীক্ষার সাজেশন",
    intro: "অধ্যায়ভিত্তিক সাজেশন, নোট আর PDF। যেকোনোটা খুলে অনলাইনে পড়ো বা ডাউনলোড করো।",
    metaTitle: "পরীক্ষার সাজেশন – এসএসসি, এইচএসসি, অনার্স ও চাকরির পরীক্ষা",
    metaDesc: "এসএসসি, এইচএসসি, অনার্স, ভর্তি ও চাকরির পরীক্ষার ফ্রি সাজেশন, নোট ও PDF। অনলাইনে পড়ো বা ডাউনলোড করো।",
    searchPlaceholder: "বিষয়, কোর্স কোড, বিভাগ বা প্রতিষ্ঠানের নাম লেখো",
    noun: "সাজেশন",
    empty: "নতুন সাজেশন এখানে প্রকাশ করা হবে।",
    request: "আসসালামু আলাইকুম, আমার এই বিষয়ের সাজেশন দরকার: ",
  },
  question: {
    path: "/questions",
    eyebrow: "প্রশ্ন ব্যাংক · সম্পূর্ণ ফ্রি",
    title: "বিগত সালের প্রশ্ন",
    intro: "বোর্ড, বিশ্ববিদ্যালয়, ভর্তি ও চাকরির পরীক্ষার আগের বছরের প্রশ্ন। খুলে পড়ো বা PDF ডাউনলোড করো।",
    metaTitle: "প্রশ্ন ব্যাংক – বিগত সালের বোর্ড, বিশ্ববিদ্যালয় ও চাকরির পরীক্ষার প্রশ্ন",
    metaDesc: "এসএসসি, এইচএসসি, জাতীয় বিশ্ববিদ্যালয়, ভর্তি পরীক্ষা ও বিসিএসসহ চাকরির পরীক্ষার বিগত সালের প্রশ্ন ফ্রি ডাউনলোড।",
    searchPlaceholder: "বিষয়, বোর্ড, বিশ্ববিদ্যালয় বা সাল লেখো",
    noun: "প্রশ্ন",
    empty: "নতুন প্রশ্ন এখানে প্রকাশ করা হবে।",
    request: "আসসালামু আলাইকুম, আমার এই পরীক্ষার বিগত সালের প্রশ্ন দরকার: ",
  },
};

// "BBA · হিসাববিজ্ঞান · ৪র্থ বর্ষ" from whatever fields are filled in.
export const suggestionContext = (item: Suggestion) =>
  [item.institution, item.program, item.department, item.academicYear].filter(Boolean).join(" · ");

export const SuggestionCard = ({ item }: { item: Suggestion }) => {
  const pdfs = item.attachments.filter((a) => a.kind === "pdf").length;
  const images = item.attachments.filter((a) => a.kind === "image").length;
  const isQuestion = item.kind === "question";

  return (
    <article className="group relative flex flex-col rounded-2xl border border-stone-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">{examLevelLabel(item.level)}</span>
        {item.subjectCode && <span className="font-mono text-stone-500">{item.subjectCode}</span>}
        {item.examYear && <span className="text-stone-500">{isQuestion ? "সাল" : "পরীক্ষা"} {bnNumber(item.examYear)}</span>}
      </div>
      <h2 className="mt-3 font-display text-lg font-bold leading-snug text-stone-900">
        <Link
          to={`${isQuestion ? "/questions" : "/suggestions"}/${item.slug}`}
          className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none group-hover:text-amber-800"
        >
          {item.title}
        </Link>
      </h2>
      {suggestionContext(item) && <p className="mt-1 text-sm text-stone-500">{suggestionContext(item)}</p>}
      {item.summary && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-600">{item.summary}</p>}
      <div className="mt-auto flex items-center gap-4 pt-5 text-xs font-medium text-stone-500">
        {pdfs > 0 && (
          <span className="flex items-center gap-1">
            <FileText size={14} aria-hidden="true" /> {bnNumber(pdfs)}টি PDF
          </span>
        )}
        {images > 0 && (
          <span className="flex items-center gap-1">
            <ImageIcon size={14} aria-hidden="true" /> {bnNumber(images)}টি ছবি
          </span>
        )}
        <span className="ml-auto flex items-center gap-1">
          <Eye size={14} aria-hidden="true" /> {bnNumber(item.views)} বার দেখা
        </span>
      </div>
    </article>
  );
};

const SuggestionList = ({ kind = "suggestion" }: { kind?: ContentKind }) => {
  const text = KIND_TEXT[kind];
  const [params, setParams] = useSearchParams();
  const get = (key: string) => params.get(key) ?? "";
  const search = get("search");
  const page = Math.max(1, Number(get("page")) || 1);
  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => setSearchInput(search), [search]);

  usePageMeta(text.metaTitle, text.metaDesc);

  const { data: filtersData } = useGetSuggestionFiltersQuery(kind);
  const { data, isLoading, isFetching, isError, refetch } = useGetSuggestionsQuery({
    kind,
    page,
    limit: 12,
    search,
    level: get("level"),
    department: get("department"),
    subject: get("subject"),
    institution: get("institution"),
    examYear: get("examYear"),
    academicYear: get("year") || undefined,
    hasFiles: get("files") === "1" ? "true" : undefined,
    sort: get("sort"),
  });

  const update = (changes: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!keepPage) next.delete("page");
    setParams(next, { replace: !keepPage });
  };

  useEffect(() => {
    const term = searchInput.trim();
    if (term === search) return;
    const id = setTimeout(() => update({ search: term || null }), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const filters = filtersData?.data;
  const items = data?.data.data ?? [];
  const meta = data?.data.meta;
  const hasFilters = ["search", "level", "department", "subject", "year", "files", "institution", "examYear"].some((k) =>
    params.get(k)
  );
  // The question bank opens on a category overview; any search or filter
  // (or "all=1") switches to the list.
  const showHub = kind === "question" && !hasFilters && !params.get("all") && !params.get("sort");

  // Questions are found by board/university and year; suggestions by
  // department and academic year.
  const selects =
    kind === "question"
      ? [
          { key: "institution", label: "সব বোর্ড/বিশ্ববিদ্যালয়", options: filters?.institutions },
          { key: "subject", label: "সব বিষয়", options: filters?.subjects },
          { key: "examYear", label: "সব সাল", options: filters?.examYears },
        ]
      : [
          { key: "department", label: "সব বিভাগ", options: filters?.departments },
          { key: "subject", label: "সব বিষয়", options: filters?.subjects },
          { key: "year", label: "সব বর্ষ", options: filters?.academicYears },
        ];

  const EmptyIcon = kind === "question" ? FileQuestion : NotebookPen;

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <header className="mb-8">
          <p className="text-sm font-semibold text-amber-700">{text.eyebrow}</p>
          <h1 className="mt-1 font-display text-4xl font-bold text-stone-900 sm:text-5xl">{text.title}</h1>
          <p className="mt-2 max-w-2xl text-stone-600">{text.intro}</p>
          <p className="mt-3 text-sm">
            {kind === "question" ? (
              <Link to="/suggestions" className="font-semibold text-amber-700 hover:underline">
                পরীক্ষার সাজেশনও দেখো →
              </Link>
            ) : (
              <Link to="/questions" className="font-semibold text-amber-700 hover:underline">
                বিগত সালের প্রশ্নও দেখো →
              </Link>
            )}
          </p>
        </header>

        <div className="relative mb-4">
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={text.searchPlaceholder}
            aria-label={`${text.noun} খুঁজো`}
            enterKeyHint="search"
            className={`${field} h-12 pl-11 text-base sm:text-sm`}
          />
        </div>

        {showHub ? (
          <QuestionHub />
        ) : (
        <>
        {kind === "question" && (
          <Link to="/questions" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:underline">
            ← সব বিভাগ
          </Link>
        )}
        <nav aria-label="পরীক্ষার ধরন" className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          <button type="button" onClick={() => update({ level: null })} aria-pressed={!get("level")} className={chip(!get("level"))}>
            সব
          </button>
          {(filters?.levels ?? []).map((level) => (
            <button
              key={level.name}
              type="button"
              onClick={() => update({ level: level.name })}
              aria-pressed={get("level") === level.name}
              className={chip(get("level") === level.name)}
            >
              {examLevelLabel(level.name)} <span className="ml-1 opacity-60">{bnNumber(level.count)}</span>
            </button>
          ))}
        </nav>

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          {selects.map(({ key, label, options }) => (
            <select
              key={key}
              value={get(key)}
              onChange={(e) => update({ [key]: e.target.value || null })}
              aria-label={label}
              className={`${field} cursor-pointer`}
            >
              <option value="">{label}</option>
              {(options ?? []).map((o) => (
                <option key={o.name} value={o.name}>
                  {o.name} ({bnNumber(o.count)})
                </option>
              ))}
            </select>
          ))}
          <select value={get("sort")} onChange={(e) => update({ sort: e.target.value || null })} aria-label="সাজাও" className={`${field} cursor-pointer`}>
            <option value="">নতুন আগে</option>
            <option value="popular">সবচেয়ে বেশি দেখা</option>
          </select>
          <label className="col-span-2 flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-700 md:col-span-1">
            <input
              type="checkbox"
              checked={get("files") === "1"}
              onChange={(e) => update({ files: e.target.checked ? "1" : null })}
              className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
            />
            শুধু PDF / ছবি আছে এমন
          </label>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-stone-200/70" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
            <p className="mb-4 text-stone-600">এই মুহূর্তে লোড করা গেল না।</p>
            <button type="button" onClick={() => refetch()} className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">
              আবার চেষ্টা করো
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
              <EmptyIcon size={26} aria-hidden="true" />
            </span>
            <p className="font-display text-lg font-bold text-stone-900">
              {hasFilters ? `মিলে এমন কোনো ${text.noun} নেই` : `এখনো কোনো ${text.noun} প্রকাশ হয়নি`}
            </p>
            <p className="mt-1 text-sm text-stone-500">{hasFilters ? "অন্যভাবে খুঁজে দেখো বা ফিল্টার কমাও।" : text.empty}</p>
            <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setParams(new URLSearchParams(), { replace: true });
                  }}
                  className="h-12 rounded-xl bg-stone-900 px-5 text-sm font-semibold text-white"
                >
                  ফিল্টার মুছে ফেলো
                </button>
              )}
              <WhatsAppButton message={`${text.request}${search}`}>WhatsApp-এ চাও</WhatsAppButton>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-stone-500">
              {bnNumber(meta?.total ?? 0)}টি {text.noun}
            </p>
            <div className={`grid gap-4 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
              {items.map((item) => (
                <SuggestionCard key={item._id} item={{ ...item, kind: item.kind ?? kind }} />
              ))}
            </div>
            {meta && (
              <div className="mt-12">
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={(next) => {
                    update({ page: String(next) }, true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default SuggestionList;
