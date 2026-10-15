import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, FileText, Image as ImageIcon, NotebookPen, Search } from "lucide-react";
import { Suggestion, useGetSuggestionFiltersQuery, useGetSuggestionsQuery } from "../../redux/features/content/contentApi";
import Pagination from "../../utils/Pagination";
import { usePageMeta } from "../../utils/usePageMeta";

const field =
  "block h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200";

const chip = (active: boolean) =>
  `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
    active ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
  }`;

// "BBA · Accounting · 4th Year" from whatever fields are filled in.
export const suggestionContext = (item: Suggestion) =>
  [item.program, item.department, item.academicYear].filter(Boolean).join(" · ");

export const SuggestionCard = ({ item }: { item: Suggestion }) => {
  const pdfs = item.attachments.filter((a) => a.kind === "pdf").length;
  const images = item.attachments.filter((a) => a.kind === "image").length;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-stone-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">{item.level}</span>
        {item.subjectCode && <span className="font-mono text-stone-500">{item.subjectCode}</span>}
        {item.examYear && <span className="text-stone-500">Exam {item.examYear}</span>}
      </div>
      <h2 className="mt-3 font-display text-lg font-bold leading-snug text-stone-900">
        <Link
          to={`/suggestions/${item.slug}`}
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
            <FileText size={14} aria-hidden="true" /> {pdfs} PDF
          </span>
        )}
        {images > 0 && (
          <span className="flex items-center gap-1">
            <ImageIcon size={14} aria-hidden="true" /> {images} image{images === 1 ? "" : "s"}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1">
          <Eye size={14} aria-hidden="true" /> {item.views.toLocaleString()}
        </span>
      </div>
    </article>
  );
};

const SuggestionList = () => {
  const [params, setParams] = useSearchParams();
  const get = (key: string) => params.get(key) ?? "";
  const search = get("search");
  const page = Math.max(1, Number(get("page")) || 1);
  const [searchInput, setSearchInput] = useState(search);

  usePageMeta("Exam suggestions", "Free exam suggestions, notes and PDFs for SSC, HSC, honours and job exams.");

  const { data: filtersData } = useGetSuggestionFiltersQuery();
  const { data, isLoading, isFetching, isError, refetch } = useGetSuggestionsQuery({
    page,
    limit: 12,
    search,
    level: get("level"),
    department: get("department"),
    subject: get("subject"),
    academicYear: get("year") ? get("year") : undefined,
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
  const hasFilters = ["search", "level", "department", "subject", "year", "files"].some((k) => params.get(k));

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <header className="mb-8">
          <p className="text-sm font-semibold text-amber-700">Free for every student</p>
          <h1 className="mt-1 font-display text-4xl font-bold text-stone-900 sm:text-5xl">Exam suggestions</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Chapter-wise suggestions, notes and PDFs. Open any of them to read online or download.
          </p>
        </header>

        <div className="relative mb-4">
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by subject, course code, department or institution"
            aria-label="Search suggestions"
            className={`${field} h-12 pl-11 text-base sm:text-sm`}
          />
        </div>

        <nav aria-label="Exam level" className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          <button type="button" onClick={() => update({ level: null })} aria-pressed={!get("level")} className={chip(!get("level"))}>
            All levels
          </button>
          {(filters?.levels ?? []).map((level) => (
            <button
              key={level.name}
              type="button"
              onClick={() => update({ level: level.name })}
              aria-pressed={get("level") === level.name}
              className={chip(get("level") === level.name)}
            >
              {level.name} <span className="ml-1 opacity-60">{level.count}</span>
            </button>
          ))}
        </nav>

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            { key: "department", label: "All departments", options: filters?.departments },
            { key: "subject", label: "All subjects", options: filters?.subjects },
            { key: "year", label: "All years", options: filters?.academicYears },
          ].map(({ key, label, options }) => (
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
                  {o.name} ({o.count})
                </option>
              ))}
            </select>
          ))}
          <select
            value={get("sort")}
            onChange={(e) => update({ sort: e.target.value || null })}
            aria-label="Sort"
            className={`${field} cursor-pointer`}
          >
            <option value="">Newest first</option>
            <option value="popular">Most viewed</option>
          </select>
          <label className="col-span-2 flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-700 md:col-span-1">
            <input
              type="checkbox"
              checked={get("files") === "1"}
              onChange={(e) => update({ files: e.target.checked ? "1" : null })}
              className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
            />
            Has PDF / images
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
            <p className="mb-4 text-stone-600">We could not load suggestions right now.</p>
            <button type="button" onClick={() => refetch()} className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
              <NotebookPen size={26} aria-hidden="true" />
            </span>
            <p className="font-display text-lg font-bold text-stone-900">{hasFilters ? "No suggestions match" : "No suggestions yet"}</p>
            <p className="mt-1 text-sm text-stone-500">
              {hasFilters ? "Try another search or fewer filters." : "New suggestions will be published here."}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setParams(new URLSearchParams(), { replace: true });
                }}
                className="mt-5 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-stone-500">{meta?.total} suggestion{meta?.total === 1 ? "" : "s"}</p>
            <div className={`grid gap-4 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
              {items.map((item) => (
                <SuggestionCard key={item._id} item={item} />
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
      </div>
    </div>
  );
};

export default SuggestionList;
