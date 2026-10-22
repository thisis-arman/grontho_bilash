import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookOpen, ChevronRight, Download, ExternalLink, GraduationCap, Search, X } from "lucide-react";
import { useGetCurriculaQuery, useGetOfficialLinksQuery, useSearchCoursesQuery } from "../../redux/features/hub/hubApi";
import { bnNumber, programLabel, yearLabel } from "../../i18n/labels";
import { usePageMeta } from "../../utils/usePageMeta";

// "সিলেবাস ও কোর্স": every department of the National University Honours
// program, grouped by program, with a search that also finds single courses
// by name or code.

const PROGRAM_ORDER = ["BA", "BSS", "BSc", "BBA"];

const tab = (active: boolean) =>
  `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
    active ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
  }`;

const useDebounced = (value: string, ms = 250) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

const CourseCatalog = () => {
  const [params, setParams] = useSearchParams();
  const program = params.get("program") ?? "";
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query.trim());

  usePageMeta(
    "সিলেবাস ও কোর্স – জাতীয় বিশ্ববিদ্যালয় অনার্স (নতুন কারিকুলাম ২০২৪-২৫)",
    "জাতীয় বিশ্ববিদ্যালয়ের অনার্স (বিএ, বিএসএস, বিএসসি, বিবিএ) সব বিভাগের বর্ষভিত্তিক কোর্স, কোর্স কোড, ক্রেডিট ও অফিসিয়াল সিলেবাস PDF। ২০২৪-২৫ সেশনের নতুন কারিকুলাম।"
  );

  const { data, isLoading, isError, refetch } = useGetCurriculaQuery();
  const { data: linksData } = useGetOfficialLinksQuery();
  const { data: courseData, isFetching: searchingCourses } = useSearchCoursesQuery(debounced, { skip: debounced.length < 2 });

  const departments = data?.data ?? [];
  const programs = PROGRAM_ORDER.filter((p) => departments.some((d) => d.program === p));
  const q = debounced.toLowerCase();
  const visible = departments.filter(
    (d) =>
      (!program || d.program === program) &&
      (!q || d.department.toLowerCase().includes(q) || (d.departmentBn ?? "").includes(debounced))
  );
  const courseHits = (courseData?.data ?? []).filter((c) => !program || c.program === program);
  const extras = linksData?.data.extras ?? [];

  const groups = (program ? [program] : programs).map((p) => ({ program: p, items: visible.filter((d) => d.program === p) }));

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <header className="max-w-3xl">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600">
            <GraduationCap size={16} aria-hidden="true" /> জাতীয় বিশ্ববিদ্যালয় · অনার্স
          </p>
          <h1 className="font-display text-3xl font-bold text-stone-900 sm:text-5xl">সিলেবাস ও কোর্স</h1>
          <p className="mt-3 leading-relaxed text-stone-600">
            তোমার বিভাগ বেছে নাও: প্রতিটি বর্ষের কোর্স, কোর্স কোড, ক্রেডিট আর অফিসিয়াল সিলেবাস এক জায়গায়। প্রতিটি কোর্সের বই,
            বিগত সালের প্রশ্ন আর সাজেশনও এক চাপে খুঁজে পাবে।
          </p>
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
            ২০২৪-২৫ সেশন থেকে চার বছরের অনার্সে <b>নতুন কারিকুলাম</b> চালু হয়েছে। এখানে নতুন কারিকুলামের ১ম ও ২য় বর্ষের কোর্স আছে;
            ৩য় ও ৪র্থ বর্ষের নতুন সিলেবাস প্রকাশ হলে যোগ করা হবে।
          </p>
        </header>

        {/* Search: departments and individual courses */}
        <div className="relative mt-8">
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="বিভাগ, কোর্সের নাম বা কোর্স কোড লেখো (যেমন হিসাববিজ্ঞান, 212501)"
            aria-label="বিভাগ বা কোর্স খুঁজো"
            className="block h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-11 text-base text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 sm:text-sm"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="লেখা মুছে ফেলো" className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-400 hover:text-stone-700">
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Program tabs */}
        <nav aria-label="প্রোগ্রাম" className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          <button type="button" aria-pressed={!program} onClick={() => setParams({}, { replace: true })} className={tab(!program)}>
            সব প্রোগ্রাম
          </button>
          {programs.map((p) => (
            <button key={p} type="button" aria-pressed={program === p} onClick={() => setParams({ program: p }, { replace: true })} className={tab(program === p)}>
              {programLabel(p)}
            </button>
          ))}
        </nav>

        {/* Matching courses */}
        {debounced.length >= 2 && (courseHits.length > 0 || searchingCourses) && (
          <section className="mt-8" aria-labelledby="course-hits">
            <h2 id="course-hits" className="mb-3 font-display text-lg font-bold text-stone-900">
              মিলে যাওয়া কোর্স {courseHits.length > 0 && <span className="text-sm font-normal text-stone-500">({bnNumber(courseHits.length)}টি)</span>}
            </h2>
            <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
              {courseHits.map((c) => (
                <li key={`${c.slug}-${c.code}-${c.title}`}>
                  <Link to={`/courses/${c.slug}?year=${c.year}`} className="flex items-center gap-3 px-4 py-3 transition hover:bg-amber-50">
                    {c.code && <span className="w-20 flex-shrink-0 font-mono text-xs text-stone-500">{c.code}</span>}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-stone-900">{c.title}</span>
                      <span className="block text-xs text-stone-500">
                        {c.departmentBn || c.department} · {programLabel(c.program)} · {yearLabel(c.year)}
                      </span>
                    </span>
                    <ChevronRight size={18} className="flex-shrink-0 text-stone-400" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Departments */}
        {isLoading ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-200" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-center">
            <p className="text-stone-600">এই মুহূর্তে লোড করা গেল না।</p>
            <button type="button" onClick={() => refetch()} className="mt-4 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">
              আবার চেষ্টা করো
            </button>
          </div>
        ) : departments.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-600">সিলেবাস শীঘ্রই যোগ করা হবে।</div>
        ) : (
          groups.map(({ program: p, items }) =>
            items.length ? (
              <section key={p} className="mt-10" aria-labelledby={`program-${p}`}>
                <h2 id={`program-${p}`} className="mb-4 flex items-baseline gap-2 font-display text-2xl font-bold text-stone-900">
                  {programLabel(p)}
                  <span className="text-sm font-normal text-stone-500">{bnNumber(items.length)}টি বিভাগ</span>
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((d) => (
                    <li key={d._id}>
                      <Link
                        to={`/courses/${d.slug}`}
                        className="group flex h-full items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      >
                        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                          <BookOpen size={20} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-lg font-bold leading-snug text-stone-900">{d.departmentBn || d.department}</span>
                          <span className="block truncate text-xs text-stone-500">{d.department}</span>
                          <span className="mt-1.5 flex flex-wrap gap-1">
                            {d.years.map((y) => (
                              <span key={y.year} className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">
                                {yearLabel(y.year)}
                              </span>
                            ))}
                          </span>
                        </span>
                        <ChevronRight size={18} className="flex-shrink-0 text-stone-400 transition group-hover:text-amber-600" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null
          )
        )}

        {/* Official downloads */}
        {extras.length > 0 && (
          <section className="mt-14 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6" aria-labelledby="official-links">
            <h2 id="official-links" className="font-display text-xl font-bold text-stone-900">
              জাতীয় বিশ্ববিদ্যালয়ের অফিসিয়াল ডাউনলোড
            </h2>
            <p className="mt-1 text-sm text-stone-500">নমুনা প্রশ্ন আর সব বিভাগের আবশ্যিক কোর্সের সিলেবাস (২০২৪-২৫ সেশন)।</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {extras.map((x) => (
                <li key={x.url}>
                  <a
                    href={x.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-xl border border-stone-200 p-3 text-sm transition hover:border-amber-400"
                  >
                    <Download size={16} className="mt-0.5 flex-shrink-0 text-amber-600" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block font-semibold text-stone-900">
                        {x.kind === "sample-question" ? `নমুনা প্রশ্ন: ${programLabel(x.program)}` : "আবশ্যিক কোর্সের সিলেবাস"}
                      </span>
                      <span className="block truncate text-xs text-stone-500">{x.title}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={linksData?.data.source}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:underline"
            >
              nu.ac.bd-এ সব সিলেবাস দেখো <ExternalLink size={14} aria-hidden="true" />
            </a>
          </section>
        )}

        <p className="mt-8 text-xs leading-relaxed text-stone-500">
          তথ্যগুলো জাতীয় বিশ্ববিদ্যালয়ের প্রকাশিত সিলেবাস থেকে সংকলিত। পরীক্ষার আগে সবসময় অফিসিয়াল সিলেবাস মিলিয়ে নাও; কোনো ভুল চোখে পড়লে আমাদের
          জানাও।
        </p>
      </div>
    </div>
  );
};

export default CourseCatalog;
