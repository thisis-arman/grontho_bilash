import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, CalendarDays, GraduationCap, School, ShieldCheck, type LucideIcon } from "lucide-react";
import { useGetContentHubQuery } from "../../redux/features/content/contentApi";
import { bnNumber, examLevelLabel } from "../../i18n/labels";
import WhatsAppButton from "../../components/WhatsAppButton";
import { SuggestionCard } from "./SuggestionList";

// Landing view of the question bank: pick a category (academic, admission,
// job), a popular board/university/exam, or a year. Shown at /questions when
// no search or filter is active; the list view takes over once one is.

type Category = {
  key: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  levels: string[];
  chipsFrom: string[]; // levels whose boards/universities/exams are shown as chips
};

const CATEGORIES: Category[] = [
  {
    key: "academic",
    title: "একাডেমিক পরীক্ষা",
    desc: "এসএসসি ও এইচএসসি বোর্ড পরীক্ষা, জাতীয় বিশ্ববিদ্যালয়ের অনার্স, ডিগ্রি ও মাস্টার্স।",
    icon: School,
    levels: ["SSC", "HSC", "Honours", "Degree", "Masters"],
    chipsFrom: ["SSC", "HSC", "Honours", "Degree", "Masters"],
  },
  {
    key: "admission",
    title: "ভর্তি পরীক্ষা",
    desc: "বিশ্ববিদ্যালয়, মেডিকেল ও ইঞ্জিনিয়ারিং ভর্তি পরীক্ষার বিগত সালের প্রশ্ন।",
    icon: GraduationCap,
    levels: ["Admission Test"],
    chipsFrom: ["Admission Test"],
  },
  {
    key: "job",
    title: "চাকরির পরীক্ষা",
    desc: "বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগসহ সরকারি-বেসরকারি চাকরির পরীক্ষা।",
    icon: Briefcase,
    levels: ["Job Exam"],
    chipsFrom: ["Job Exam"],
  },
];

const levelLink = (level: string) => `/questions?level=${encodeURIComponent(level)}`;
const chipLink = (level: string, institution: string) =>
  `/questions?level=${encodeURIComponent(level)}&institution=${encodeURIComponent(institution)}`;

const QuestionHub = () => {
  const { data, isLoading } = useGetContentHubQuery("question");
  const hub = data?.data;
  const count = (level: string) => hub?.levels.find((l) => l.name === level)?.count ?? 0;

  return (
    <div className="space-y-12">
      {/* Categories */}
      <section aria-labelledby="hub-categories">
        <h2 id="hub-categories" className="mb-5 font-display text-2xl font-bold text-stone-900">
          কোন পরীক্ষার প্রশ্ন খুঁজছ?
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {CATEGORIES.map(({ key, title, desc, icon: Icon, levels, chipsFrom }) => {
            const total = levels.reduce((n, l) => n + count(l), 0);
            const chips = (hub?.institutions ?? []).filter((i) => chipsFrom.includes(i.level)).slice(0, 8);
            return (
              <article key={key} className="flex flex-col rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-bold text-stone-900">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">{desc}</p>
                  </div>
                </div>

                {/* One button per level, e.g. এসএসসি · ১২টি */}
                <ul className="mt-5 grid grid-cols-2 gap-2">
                  {levels.map((level) => {
                    const n = count(level);
                    return (
                      <li key={level} className={levels.length === 1 ? "col-span-2" : ""}>
                        <Link
                          to={levelLink(level)}
                          className="flex h-full min-h-[3.25rem] items-center justify-between gap-2 rounded-xl border border-stone-200 px-3.5 py-2.5 transition hover:border-amber-400 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        >
                          <span className="font-semibold text-stone-900">{levels.length === 1 ? "সব প্রশ্ন দেখো" : examLevelLabel(level)}</span>
                          <span className={`text-xs ${n ? "text-stone-500" : "text-stone-400"}`}>{isLoading ? "…" : n ? `${bnNumber(n)}টি` : "শীঘ্রই"}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {chips.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold text-stone-500">{key === "academic" ? "বোর্ড ও বিশ্ববিদ্যালয়" : key === "job" ? "জনপ্রিয় পরীক্ষা" : "প্রতিষ্ঠান"}</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {chips.map((c) => (
                        <li key={`${c.level}-${c.name}`}>
                          <Link
                            to={chipLink(c.level, c.name)}
                            className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-amber-100 hover:text-amber-900"
                          >
                            {key === "academic" ? `${examLevelLabel(c.level)} · ${c.name}` : c.name}
                            <span className="text-stone-400">{bnNumber(c.count)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {key === "job" && (
                  <Link
                    to={`/suggestions?level=${encodeURIComponent("Job Exam")}`}
                    className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    বিসিএস প্রিলি অনুশীলনী (উত্তর ও ব্যাখ্যাসহ)
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                )}

                <p className="mt-auto pt-4 text-xs text-stone-500">{isLoading ? "" : total ? `মোট ${bnNumber(total)}টি প্রশ্নপত্র` : "এই বিভাগে প্রশ্ন যোগ হচ্ছে"}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* By year */}
      {(hub?.years.length ?? 0) > 0 && (
        <section aria-labelledby="hub-years">
          <h2 id="hub-years" className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-stone-900">
            <CalendarDays size={20} className="text-amber-600" aria-hidden="true" /> সাল অনুযায়ী
          </h2>
          <ul className="flex flex-wrap gap-2">
            {hub!.years.map((y) => (
              <li key={y.name}>
                <Link
                  to={`/questions?examYear=${encodeURIComponent(y.name)}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-amber-400"
                >
                  {bnNumber(y.name)}
                  <span className="text-xs font-normal text-stone-400">{bnNumber(y.count)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Newest */}
      {(hub?.recent.length ?? 0) > 0 && (
        <section aria-labelledby="hub-recent">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="hub-recent" className="font-display text-xl font-bold text-stone-900">
              নতুন যোগ হয়েছে
            </h2>
            <Link to="/questions?all=1" className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:underline">
              সব দেখো <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hub!.recent.map((item) => (
              <SuggestionCard key={item._id} item={{ ...item, kind: "question" }} />
            ))}
          </div>
        </section>
      )}

      {/* How papers are checked (trust) */}
      <section className="grid gap-4 rounded-3xl border border-stone-200 bg-white p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-center" aria-labelledby="hub-trust">
        <div>
          <h2 id="hub-trust" className="flex items-center gap-2 font-display text-xl font-bold text-stone-900">
            <ShieldCheck size={20} className="text-emerald-600" aria-hidden="true" /> প্রশ্নপত্র কীভাবে যাচাই করা হয়
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-stone-600">
            <li>• প্রতিটি প্রশ্নপত্রে উৎস (বোর্ড, বিশ্ববিদ্যালয় বা পরীক্ষার নাম) ও সাল উল্লেখ থাকে।</li>
            <li>• প্রকাশের আগে আমাদের টিম মূল প্রশ্নপত্রের সাথে মিলিয়ে দেখে।</li>
            <li>• কোনো ভুল চোখে পড়লে জানাও, দ্রুত ঠিক করে দেওয়া হয়।</li>
          </ul>
        </div>
        <WhatsAppButton message="আসসালামু আলাইকুম, প্রশ্ন ব্যাংকের একটা প্রশ্নপত্র নিয়ে জানাতে চাই: ">ভুল জানাও বা প্রশ্ন চাও</WhatsAppButton>
      </section>
    </div>
  );
};

export default QuestionHub;
