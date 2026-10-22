import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight, BookOpen, ChevronRight, ListChecks, RotateCcw } from "lucide-react";
import { useGetBookListFiltersQuery, useGetBookListsQuery } from "../../redux/features/hub/hubApi";
import { bnNumber, examLevelLabel } from "../../i18n/labels";
import { usePageMeta } from "../../utils/usePageMeta";
import WhatsAppButton from "../../components/WhatsAppButton";

// "Which books do I need?" A step-by-step picker: level → department → year.
// Big tap targets and one question at a time, for people who don't use
// websites much. Choices live in the URL so the back button works.

const STEPS = ["level", "department", "academicYear"] as const;

const choiceClass = (active: boolean) =>
  `flex min-h-[3.25rem] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
    active ? "border-amber-400 bg-amber-50 text-amber-900" : "border-stone-200 bg-white text-stone-800 hover:border-amber-300"
  }`;

const BookListFinder = () => {
  const [params, setParams] = useSearchParams();
  const level = params.get("level") ?? "";
  const department = params.get("department") ?? "";
  const academicYear = params.get("academicYear") ?? "";

  usePageMeta(
    "কোন বই লাগবে? – ক্লাস ও বর্ষভিত্তিক বইয়ের তালিকা",
    "এসএসসি, এইচএসসি, অনার্স ও ভর্তি পরীক্ষার জন্য কোন কোন বই লাগবে তার তালিকা। প্রতিটি বইয়ের পুরনো কপি কত দামে পাওয়া যাচ্ছে দেখো।"
  );

  const set = (key: (typeof STEPS)[number], value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    // Changing an earlier answer clears the later ones.
    STEPS.slice(STEPS.indexOf(key) + 1).forEach((k) => next.delete(k));
    setParams(next);
  };

  const filterArgs = { level: level || undefined, department: department || undefined };
  const { data: filtersData, isLoading: filtersLoading } = useGetBookListFiltersQuery(filterArgs);
  const filters = filtersData?.data;
  const { data: listsData, isFetching } = useGetBookListsQuery({
    level: level || undefined,
    department: department || undefined,
    academicYear: academicYear || undefined,
    limit: 60,
  });
  const lists = listsData?.data.data ?? [];

  const levels = filters?.levels ?? [];
  const departments = level ? filters?.departments ?? [] : [];
  const years = level ? filters?.academicYears ?? [] : [];
  const nothingPublished = !filtersLoading && !level && levels.length === 0;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <header>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600">
            <ListChecks size={16} aria-hidden="true" /> বইয়ের তালিকা
          </p>
          <h1 className="font-display text-3xl font-bold text-stone-900 sm:text-4xl">কোন বই লাগবে?</h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-stone-600">
            তোমার ক্লাস বা বর্ষ বেছে নাও। কোন কোন বই লাগবে, আর গ্রন্থবিলাসে সেগুলোর পুরনো কপি কত দামে পাওয়া যাচ্ছে, সব
            এক জায়গায় দেখবে।
          </p>
        </header>

        {nothingPublished ? (
          <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-8 text-center">
            <BookOpen size={32} className="mx-auto text-stone-300" aria-hidden="true" />
            <p className="mt-3 font-display text-xl font-bold text-stone-900">তালিকা শীঘ্রই আসছে</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
              আমরা বিভাগ ও বর্ষভিত্তিক বইয়ের তালিকা তৈরি করছি। তোমার বিভাগের তালিকা আগে চাইলে WhatsApp-এ জানাও।
            </p>
            <WhatsAppButton className="mt-5" message="আসসালামু আলাইকুম, আমার বিভাগ/ক্লাসের বইয়ের তালিকা চাই: ">
              আমার বিভাগের তালিকা চাই
            </WhatsAppButton>
          </div>
        ) : (
          <>
            {/* Step 1 */}
            <section className="mt-10" aria-labelledby="step-level">
              <h2 id="step-level" className="mb-3 text-sm font-semibold text-stone-500">
                ১. তুমি কিসের জন্য পড়ছ?
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {filtersLoading && !levels.length
                  ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[3.25rem] animate-pulse rounded-xl bg-stone-200" />)
                  : levels.map((l) => (
                      <button key={l.name} type="button" aria-pressed={level === l.name} onClick={() => set("level", level === l.name ? "" : l.name)} className={choiceClass(level === l.name)}>
                        {examLevelLabel(l.name)}
                        <span className="text-xs font-normal text-stone-500">{bnNumber(l.count)}টি</span>
                      </button>
                    ))}
              </div>
            </section>

            {/* Step 2 */}
            {level && departments.length > 0 && (
              <section className="mt-8" aria-labelledby="step-dept">
                <h2 id="step-dept" className="mb-3 text-sm font-semibold text-stone-500">
                  ২. বিভাগ বা বিষয়
                </h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {departments.map((d) => (
                    <button key={d.name} type="button" aria-pressed={department === d.name} onClick={() => set("department", department === d.name ? "" : d.name)} className={choiceClass(department === d.name)}>
                      {d.name}
                      <span className="text-xs font-normal text-stone-500">{bnNumber(d.count)}টি</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Step 3 */}
            {level && years.length > 1 && (
              <section className="mt-8" aria-labelledby="step-year">
                <h2 id="step-year" className="mb-3 text-sm font-semibold text-stone-500">
                  ৩. বর্ষ বা শ্রেণি
                </h2>
                <div className="flex flex-wrap gap-2">
                  {years.map((y) => (
                    <button key={y.name} type="button" aria-pressed={academicYear === y.name} onClick={() => set("academicYear", academicYear === y.name ? "" : y.name)} className={`${choiceClass(academicYear === y.name)} min-h-0 px-5`}>
                      {y.name}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Results */}
            <section className="mt-10" aria-labelledby="lists-heading" aria-busy={isFetching}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 id="lists-heading" className="font-display text-xl font-bold text-stone-900">
                  {level ? "তোমার জন্য তালিকা" : "সব তালিকা"}
                </h2>
                {level && (
                  <button type="button" onClick={() => setParams(new URLSearchParams())} className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-900">
                    <RotateCcw size={14} aria-hidden="true" /> আবার শুরু করো
                  </button>
                )}
              </div>
              {lists.length === 0 && !isFetching ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-600">
                  এই বাছাইয়ে এখনো কোনো তালিকা নেই।
                  <WhatsAppButton className="mx-auto mt-4 flex w-fit" message={`আসসালামু আলাইকুম, এই ক্লাস/বিভাগের বইয়ের তালিকা চাই: ${[examLevelLabel(level), department, academicYear].filter(Boolean).join(", ")}`}>
                    এই তালিকা চাই
                  </WhatsAppButton>
                </div>
              ) : (
                <ul className={`space-y-3 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
                  {lists.map((list) => (
                    <li key={list._id}>
                      <Link
                        to={`/booklists/${list.slug}`}
                        className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:p-5"
                      >
                        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                          <ListChecks size={22} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-lg font-bold text-stone-900">{list.title}</span>
                          <span className="mt-0.5 block text-sm text-stone-500">
                            {[list.institution, list.department, list.academicYear].filter(Boolean).join(" · ")}
                            {list.bookCount ? ` · ${bnNumber(list.bookCount)}টি বই` : ""}
                          </span>
                        </span>
                        <ChevronRight size={20} className="flex-shrink-0 text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-amber-600" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <p className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-500">
              তালিকায় তোমার বিভাগ নেই?
              <Link to="/contact" className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:underline">
                জানাও, আমরা যোগ করে দেবো <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default BookListFinder;
