import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CalendarDays, FileQuestion, Lightbulb, MessageCircle } from "lucide-react";
import { useGetCurriculumQuery } from "../../redux/features/hub/hubApi";
import { bnNumber, programLabel, yearLabel } from "../../i18n/labels";
import { SITE_URL, usePageMeta } from "../../utils/usePageMeta";

// One course (e.g. /courses/nu-honours-bba-accounting/242501): what it is,
// when it was last examined, and where to find its past questions,
// suggestions and second-hand books on the site.

const WHATSAPP = "8801883350118";

// The last Honours 4th year exam under the 2013-2014 curriculum (the 2024
// exam, NU notice 5451 of 11 March 2026). Each department sat its papers in
// code order, so the paper is identified by the last two digits of its code.
const LAST_4TH_YEAR_EXAM = {
  label: "২০২৪ সালের অনার্স ৪র্থ বর্ষ পরীক্ষা",
  notice: "https://www.nu.ac.bd/uploads/notices/notice_5451_pub_date_11032026.pdf",
  dates: {
    "01": "৩০ এপ্রিল ২০২৬",
    "03": "৩ মে ২০২৬",
    "05": "৬ মে ২০২৬",
    "07": "১০ মে ২০২৬",
    "09": "১৩ মে ২০২৬",
    "11": "১৮ মে ২০২৬",
    "13": "২১ মে ২০২৬",
    "15": "৭ জুন ২০২৬",
    "17": "১০ জুন ২০২৬",
  } as Record<string, string>,
};

const isViva = (title: string) => /viva/i.test(title);
// Book and question searches work best on the subject name alone.
const searchTerm = (title: string) => title.replace(/\s*\((In English|Theory|Practical)\)\s*$/i, "").replace(/\s*…$/, "");

const card = "flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-amber-400";

const CourseDetail = () => {
  const { slug = "", code = "" } = useParams();
  const { data, isLoading, isError } = useGetCurriculumQuery(slug);
  const dept = data?.data;
  const year = dept?.years.find((y) => y.courses.some((c) => c.code === code));
  const course = year?.courses.find((c) => c.code === code);
  const name = dept ? dept.departmentBn || dept.department : "";
  const lastExam =
    year?.year === 4 && year.session === "2013-2014" && course && !isViva(course.title)
      ? LAST_4TH_YEAR_EXAM.dates[code.slice(-2)]
      : undefined;

  usePageMeta(
    dept && course && year
      ? `${course.code} ${course.title} – ${name} ${yearLabel(year.year)}, জাতীয় বিশ্ববিদ্যালয়`
      : undefined,
    dept && course && year
      ? `জাতীয় বিশ্ববিদ্যালয় ${programLabel(dept.program)} ${name} ${yearLabel(year.year)}, কোর্স কোড ${course.code}: ${course.title}। বিগত বছরের প্রশ্ন, সাজেশন, পরীক্ষার তারিখ আর কম দামে পুরনো বই।`
      : undefined,
    undefined,
    {
      jsonLd:
        dept && course
          ? {
              "@context": "https://schema.org",
              "@type": "Course",
              name: course.title,
              courseCode: course.code,
              url: `${SITE_URL}/courses/${dept.slug}/${course.code}`,
              provider: { "@type": "CollegeOrUniversity", name: "National University, Bangladesh", sameAs: "https://www.nu.ac.bd" },
            }
          : null,
    }
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14" aria-busy="true">
        <div className="h-4 w-40 animate-pulse rounded bg-stone-200" />
        <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-stone-200" />
        <div className="mt-8 h-56 animate-pulse rounded-2xl bg-stone-200" />
      </div>
    );
  }

  if (isError || !dept || !course || !year) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-stone-900">কোর্সটি পাওয়া যায়নি</h1>
        <Link to={dept ? `/courses/${dept.slug}` : "/courses"} className="mt-6 inline-flex rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">
          {dept ? `${name} বিভাগের সব কোর্স` : "সব বিভাগ দেখো"}
        </Link>
      </div>
    );
  }

  const q = encodeURIComponent(searchTerm(course.title));
  const others = year.courses.filter((c) => c.code !== course.code && !isViva(c.title));
  const shareText = encodeURIComponent(
    `আমার কাছে ${name} ${yearLabel(year.year)}, কোর্স ${course.code} (${course.title})-এর বিগত বছরের প্রশ্নপত্র আছে, গ্রন্থবিলাসে দিতে চাই।`
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <Link
          to={`/courses/${dept.slug}?year=${year.year}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900"
        >
          <ArrowLeft size={16} aria-hidden="true" /> {name} {yearLabel(year.year)} এর সব কোর্স
        </Link>

        <header className="mt-5">
          <p className="text-sm font-semibold text-amber-600">
            {dept.institutionBn || dept.institution} · {programLabel(dept.program)} · {name} · {yearLabel(year.year)}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">{course.title}</h1>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
            <span className="font-mono">কোর্স কোড {course.code}</span>
            {course.marks != null && <span>{bnNumber(course.marks)} নম্বর</span>}
            {course.credits != null && <span>{bnNumber(course.credits)} ক্রেডিট</span>}
            {year.session && <span>{bnNumber(year.session)} সেশনের সিলেবাস</span>}
          </p>
        </header>

        {lastExam && (
          <section aria-label="পরীক্ষার তারিখ" className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
            <p className="flex items-center gap-2 font-semibold text-stone-900">
              <CalendarDays size={18} className="text-amber-600" aria-hidden="true" /> পরীক্ষা কবে?
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
              {LAST_4TH_YEAR_EXAM.label}য় এই কোর্সের পরীক্ষা হয়েছিল <b>{lastExam}</b>। নতুন পরীক্ষার রুটিন প্রকাশ হলে জাতীয়
              বিশ্ববিদ্যালয়ের{" "}
              <a href="https://www.nu.ac.bd/examination-notice.php" target="_blank" rel="noopener noreferrer" className="font-medium text-amber-800 underline">
                পরীক্ষার নোটিশে
              </a>{" "}
              পাবে। গত বছরের রুটিন:{" "}
              <a href={LAST_4TH_YEAR_EXAM.notice} target="_blank" rel="noopener noreferrer" className="font-medium text-amber-800 underline">
                নোটিশ (PDF)
              </a>
              ।
            </p>
          </section>
        )}

        {!isViva(course.title) && (
          <section aria-label="পড়ার রিসোর্স" className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link to={`/questions?search=${q}`} className={card}>
              <FileQuestion size={20} className="mt-0.5 flex-shrink-0 text-amber-600" aria-hidden="true" />
              <span className="text-sm">
                <b className="block text-stone-900">বিগত বছরের প্রশ্ন</b>
                <span className="text-stone-500">এই কোর্সের আগের প্রশ্নপত্র</span>
              </span>
            </Link>
            <Link to={`/suggestions?search=${q}`} className={card}>
              <Lightbulb size={20} className="mt-0.5 flex-shrink-0 text-amber-600" aria-hidden="true" />
              <span className="text-sm">
                <b className="block text-stone-900">সাজেশন ও নোট</b>
                <span className="text-stone-500">পরীক্ষার আগে কী পড়বে</span>
              </span>
            </Link>
            <Link to={`/books?search=${q}`} className={card}>
              <BookOpen size={20} className="mt-0.5 flex-shrink-0 text-amber-600" aria-hidden="true" />
              <span className="text-sm">
                <b className="block text-stone-900">কম দামে বই</b>
                <span className="text-stone-500">সিনিয়রদের পুরনো বই</span>
              </span>
            </Link>
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
          <p className="font-semibold text-stone-900">তোমার কাছে এই কোর্সের প্রশ্নপত্র আছে?</p>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            বিগত বছরের প্রশ্নপত্রের ছবি পাঠাও। আমরা টাইপ করে এখানে সবার জন্য তুলে দেব, যাতে জুনিয়ররা বুঝতে পারে কোন প্রশ্ন বারবার আসে।
          </p>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            <MessageCircle size={16} aria-hidden="true" /> WhatsApp-এ প্রশ্নপত্র পাঠাও
          </a>
        </section>

        {others.length > 0 && (
          <section className="mt-8" aria-labelledby="other-courses">
            <h2 id="other-courses" className="font-display text-xl font-bold text-stone-900">
              {name} {yearLabel(year.year)} এর অন্য কোর্স
            </h2>
            <ul className="mt-3 divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
              {others.map((c) => (
                <li key={c.code}>
                  <Link to={`/courses/${dept.slug}/${c.code}`} className="flex items-baseline gap-3 px-4 py-3 text-sm transition hover:bg-stone-50">
                    <span className="font-mono text-xs text-stone-500">{c.code}</span>
                    <span className="font-medium text-stone-800">{c.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-8 text-xs leading-relaxed text-stone-500">
          কোর্সের তথ্য জাতীয় বিশ্ববিদ্যালয়ের প্রকাশিত সিলেবাস ও পরীক্ষার রুটিন থেকে সংকলিত। পরীক্ষার আগে অফিসিয়াল নোটিশ মিলিয়ে নাও।
        </p>
      </div>
    </div>
  );
};

export default CourseDetail;
