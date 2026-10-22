import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, FileQuestion, FileText, Lightbulb, ListChecks, PlusCircle } from "lucide-react";
import { Course, useGetCurriculumQuery } from "../../redux/features/hub/hubApi";
import { bnNumber, programLabel, yearLabel } from "../../i18n/labels";
import { SITE_URL, usePageMeta } from "../../utils/usePageMeta";

// One department: year tabs, and each year's courses with links to books,
// past questions and suggestions for that course.

const YEARS = [1, 2, 3, 4];

const groupLabel = (group?: string) =>
  (group ?? "")
    .replace(/Group[- ]?([A-Z])/i, "গ্রুপ-$1")
    .replace(/\(\s*Any Two\s*\)/i, "(যেকোনো দুটি)")
    .replace(/\(\s*Any Three\s*\)/i, "(যেকোনো তিনটি)")
    .replace(/\(\s*Any One\s*\)/i, "(যেকোনো একটি)");

const action = "inline-flex h-8 items-center gap-1 rounded-lg border border-stone-200 px-2.5 text-xs font-semibold text-stone-700 transition hover:border-amber-400 hover:text-amber-800";

const CourseRow = ({ course }: { course: Course }) => {
  const q = encodeURIComponent(course.title.replace(/\s*\((Theory|Practical)\)$/i, ""));
  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug text-stone-900">{course.title}</p>
        <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-stone-500">
          {course.code && <span className="font-mono">কোড {course.code}</span>}
          {course.credits != null && <span>{bnNumber(course.credits)} ক্রেডিট</span>}
          {course.marks != null && <span>{bnNumber(course.marks)} নম্বর</span>}
        </p>
      </div>
      <div className="flex flex-shrink-0 flex-wrap gap-1.5">
        <Link to={`/books?search=${q}`} className={action}>
          <BookOpen size={13} aria-hidden="true" /> বই
        </Link>
        <Link to={`/questions?search=${q}`} className={action}>
          <FileQuestion size={13} aria-hidden="true" /> প্রশ্ন
        </Link>
        <Link to={`/suggestions?search=${q}`} className={action}>
          <Lightbulb size={13} aria-hidden="true" /> সাজেশন
        </Link>
      </div>
    </li>
  );
};

const DepartmentCourses = () => {
  const { slug = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const { data, isLoading, isError, error } = useGetCurriculumQuery(slug);
  const dept = data?.data;

  const available = dept?.years.map((y) => y.year) ?? [];
  const requested = Number(params.get("year"));
  const year = available.includes(requested) ? requested : available[0] ?? 1;
  const current = dept?.years.find((y) => y.year === year);
  const name = dept ? dept.departmentBn || dept.department : "";

  usePageMeta(
    dept ? `${name} ${yearLabel(year)} সিলেবাস ও কোর্স – ${programLabel(dept.program)}, জাতীয় বিশ্ববিদ্যালয়` : undefined,
    dept
      ? `জাতীয় বিশ্ববিদ্যালয় ${programLabel(dept.program)} ${name} (${dept.department}) ${yearLabel(year)}: সব কোর্সের কোড, ক্রেডিট ও অফিসিয়াল সিলেবাস। প্রতিটি কোর্সের পুরনো বই, প্রশ্ন ও সাজেশন।`
      : undefined,
    undefined,
    {
      jsonLd:
        dept && current
          ? {
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `${dept.department} ${year} year courses (${dept.program}, National University)`,
              url: `${SITE_URL}/courses/${dept.slug}?year=${year}`,
              itemListElement: current.courses.map((c, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "Course",
                  name: c.title,
                  ...(c.code ? { courseCode: c.code } : {}),
                  provider: { "@type": "CollegeOrUniversity", name: "National University, Bangladesh", sameAs: "https://www.nu.ac.bd" },
                },
              })),
            }
          : null,
    }
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14" aria-busy="true">
        <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
        <div className="mt-4 h-10 w-2/3 animate-pulse rounded bg-stone-200" />
        <div className="mt-8 h-72 animate-pulse rounded-2xl bg-stone-200" />
      </div>
    );
  }

  if (isError || !dept) {
    const notFound = (error as { status?: number })?.status === 404;
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-stone-900">{notFound ? "বিভাগটি পাওয়া যায়নি" : "কিছু একটা সমস্যা হয়েছে"}</h1>
        <Link to="/courses" className="mt-6 inline-flex rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">
          সব বিভাগ দেখো
        </Link>
      </div>
    );
  }

  // Core courses first, then each elective group under its own heading.
  const groups: { label: string; courses: Course[] }[] = [];
  for (const c of current?.courses ?? []) {
    const label = c.group ?? "";
    const g = groups.find((x) => x.label === label);
    if (g) g.courses.push(c);
    else groups.push({ label, courses: [c] });
  }
  const totalCredits = (current?.courses ?? []).filter((c) => !c.group).reduce((n, c) => n + (c.credits ?? 0), 0);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <Link to={`/courses?program=${dept.program}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900">
          <ArrowLeft size={16} aria-hidden="true" /> {programLabel(dept.program)} এর সব বিভাগ
        </Link>

        <header className="mt-5">
          <p className="text-sm font-semibold text-amber-600">
            {dept.institutionBn || dept.institution} · {programLabel(dept.program)}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-stone-900 sm:text-4xl">{name}</h1>
          {dept.departmentBn && <p className="mt-0.5 text-stone-500">{dept.department}</p>}
        </header>

        {/* Year tabs */}
        <nav aria-label="বর্ষ" className="mt-6 grid grid-cols-4 gap-1 rounded-2xl bg-stone-100 p-1">
          {YEARS.map((y) => {
            const has = available.includes(y);
            return (
              <button
                key={y}
                type="button"
                aria-pressed={y === year}
                disabled={!has}
                onClick={() => setParams({ year: String(y) }, { replace: true })}
                className={`rounded-xl px-2 py-2.5 text-sm font-semibold transition ${
                  y === year ? "bg-white text-stone-900 shadow-sm" : has ? "text-stone-600 hover:text-stone-900" : "cursor-not-allowed text-stone-400"
                }`}
              >
                {yearLabel(y)}
                {!has && <span className="block text-[10px] font-normal">শীঘ্রই</span>}
              </button>
            );
          })}
        </nav>

        {current ? (
          <>
            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-stone-600">
                {yearLabel(year)} · {bnNumber(current.courses.length)}টি কোর্স
                {totalCredits > 0 && ` · মূল কোর্সে ${bnNumber(totalCredits)} ক্রেডিট`}
                {current.session && ` · ${bnNumber(current.session)} সেশন থেকে`}
              </p>
              {current.syllabusUrl && (
                <a
                  href={current.syllabusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-800"
                >
                  <FileText size={15} aria-hidden="true" /> অফিসিয়াল সিলেবাস (PDF)
                </a>
              )}
            </div>

            {groups.map((g) => (
              <section key={g.label || "core"} className="mt-6" aria-label={g.label ? groupLabel(g.label) : "কোর্সসমূহ"}>
                {g.label && (
                  <h2 className="mb-2 text-sm font-semibold text-stone-500">
                    ঐচ্ছিক কোর্স: {groupLabel(g.label)}
                  </h2>
                )}
                <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                  {g.courses.map((c) => (
                    <CourseRow key={`${c.code}-${c.title}`} course={c} />
                  ))}
                </ul>
              </section>
            ))}
          </>
        ) : (
          <p className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 text-center text-stone-600">
            এই বর্ষের নতুন সিলেবাস এখনো প্রকাশ হয়নি।
          </p>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link to="/booklists" className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-amber-400">
            <ListChecks size={20} className="text-amber-600" aria-hidden="true" />
            <span className="text-sm">
              <b className="block text-stone-900">বইয়ের তালিকা দেখো</b>
              <span className="text-stone-500">কোন বই লাগবে, কত দামে পাওয়া যাচ্ছে</span>
            </span>
          </Link>
          <Link to="/user/add-product" className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-amber-400">
            <PlusCircle size={20} className="text-amber-600" aria-hidden="true" />
            <span className="text-sm">
              <b className="block text-stone-900">এই বর্ষের বই বিক্রি করো</b>
              <span className="text-stone-500">জুনিয়ররা ঠিক এগুলোই খুঁজছে</span>
            </span>
          </Link>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-stone-500">
          কোর্সের তথ্য জাতীয় বিশ্ববিদ্যালয়ের প্রকাশিত সিলেবাস থেকে সংকলিত। পরীক্ষার আগে অফিসিয়াল সিলেবাস মিলিয়ে নাও।
        </p>
      </div>
    </div>
  );
};

export default DepartmentCourses;
