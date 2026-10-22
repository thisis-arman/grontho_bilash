import { useMemo, useState } from "react";
import { GraduationCap, Minus, Plus, RotateCcw } from "lucide-react";
import ToolHeader from "./ToolHeader";
import { card, label, secondaryButton } from "./toolStyles";
import { bnNumber } from "../../i18n/labels";

// SSC / HSC GPA from grade counts. Board rules:
// - GPA = (sum of compulsory subjects' GP + 4th subject bonus) / number of
//   compulsory subjects, never above 5.00.
// - 4th (optional) subject: only the GP above 2 is added.
// - An F in any compulsory subject means fail (GPA 0.00). An F in the 4th
//   subject does not.
const GRADES = [
  { grade: "A+", gp: 5 },
  { grade: "A", gp: 4 },
  { grade: "A-", gp: 3.5 },
  { grade: "B", gp: 3 },
  { grade: "C", gp: 2 },
  { grade: "D", gp: 1 },
  { grade: "F", gp: 0 },
] as const;

type Grade = (typeof GRADES)[number]["grade"];

const letterFor = (gpa: number) =>
  gpa >= 5 ? "A+" : gpa >= 4 ? "A" : gpa >= 3.5 ? "A-" : gpa >= 3 ? "B" : gpa >= 2 ? "C" : gpa >= 1 ? "D" : "F";

const emptyCounts = () => Object.fromEntries(GRADES.map((g) => [g.grade, 0])) as Record<Grade, number>;

const GpaCalculator = () => {
  const [counts, setCounts] = useState<Record<Grade, number>>(emptyCounts);
  const [fourth, setFourth] = useState<Grade | "">("");

  const change = (grade: Grade, delta: number) =>
    setCounts((c) => ({ ...c, [grade]: Math.max(0, Math.min(20, c[grade] + delta)) }));

  const result = useMemo(() => {
    const subjects = GRADES.reduce((n, g) => n + counts[g.grade], 0);
    if (!subjects) return null;
    if (counts.F > 0) return { subjects, gpa: 0, failed: true, bonus: 0, withoutBonus: 0 };
    const total = GRADES.reduce((sum, g) => sum + counts[g.grade] * g.gp, 0);
    const fourthGp = fourth ? GRADES.find((g) => g.grade === fourth)!.gp : 0;
    const bonus = Math.max(0, fourthGp - 2);
    const withoutBonus = total / subjects;
    const gpa = Math.min(5, (total + bonus) / subjects);
    return { subjects, gpa, failed: false, bonus, withoutBonus };
  }, [counts, fourth]);

  return (
    <>
      <ToolHeader
        icon={GraduationCap}
        title="SSC / HSC GPA ক্যালকুলেটর"
        desc="কোন গ্রেড কয়টা বিষয়ে পেয়েছ, শুধু সেটা বসাও। ৪র্থ বিষয়সহ বোর্ডের নিয়মে GPA হিসাব করে দেবে।"
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className={card}>
          <p className={label}>আবশ্যিক বিষয়ে কোন গ্রেড কয়টা?</p>
          <ul className="mt-2 divide-y divide-stone-100">
            {GRADES.map(({ grade, gp }) => (
              <li key={grade} className="flex items-center justify-between gap-3 py-2.5">
                <span>
                  <span className="font-display text-lg font-bold text-stone-900">{grade}</span>
                  <span className="ml-2 text-xs text-stone-500">GP {gp.toFixed(2)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => change(grade, -1)}
                    disabled={!counts[grade]}
                    aria-label={`${grade} একটি কমাও`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition hover:border-stone-400 disabled:opacity-30"
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <span className="w-8 text-center font-display text-xl font-bold text-stone-900" aria-live="polite" aria-label={`${grade}: ${counts[grade]}টি বিষয়`}>
                    {bnNumber(counts[grade])}
                  </span>
                  <button
                    type="button"
                    onClick={() => change(grade, 1)}
                    aria-label={`${grade} একটি বাড়াও`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white transition hover:bg-stone-700"
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                </span>
              </li>
            ))}
          </ul>

          <label className="mt-5 block">
            <span className={label}>৪র্থ বিষয় (ঐচ্ছিক) এর গ্রেড</span>
            <select
              value={fourth}
              onChange={(e) => setFourth(e.target.value as Grade | "")}
              className="block h-12 w-full cursor-pointer rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <option value="">৪র্থ বিষয় নেই</option>
              {GRADES.map((g) => (
                <option key={g.grade} value={g.grade}>
                  {g.grade} (GP {g.gp.toFixed(2)})
                </option>
              ))}
            </select>
            <span className="mt-1.5 block text-xs leading-relaxed text-stone-500">
              ৪র্থ বিষয়ের GP থেকে ২ বাদ দিয়ে বাকিটা যোগ হয়। ৪র্থ বিষয়ে ফেল করলে সমস্যা নেই।
            </span>
          </label>

          <button type="button" onClick={() => { setCounts(emptyCounts()); setFourth(""); }} className={`${secondaryButton} mt-5 w-full`}>
            <RotateCcw size={15} aria-hidden="true" /> আবার শুরু করো
          </button>
        </div>

        <div className={`${card} lg:sticky lg:top-24`} aria-live="polite">
          {!result ? (
            <p className="py-12 text-center leading-relaxed text-stone-500">
              বাম পাশে + চেপে প্রতিটি গ্রেডে কয়টা বিষয়, তা বসাও।
              <br />
              এখানে সাথে সাথে GPA দেখাবে।
            </p>
          ) : result.failed ? (
            <div className="py-8 text-center">
              <p className="text-sm font-semibold text-stone-500">ফলাফল</p>
              <p className="mt-2 font-display text-5xl font-bold text-red-600">F</p>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-stone-600">
                আবশ্যিক কোনো বিষয়ে F থাকলে বোর্ডের নিয়মে পুরো ফলাফল ফেল (GPA 0.00) ধরা হয়।
              </p>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm font-semibold text-stone-500">তোমার GPA</p>
              <p className="mt-2 font-display text-6xl font-bold text-stone-900">{result.gpa.toFixed(2)}</p>
              <p className="mt-2 inline-flex rounded-full bg-amber-100 px-4 py-1 font-semibold text-amber-800">
                গ্রেড {letterFor(result.gpa)}
              </p>
              <dl className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3 text-left text-sm">
                <div className="rounded-xl bg-stone-50 p-3">
                  <dt className="text-xs text-stone-500">আবশ্যিক বিষয়</dt>
                  <dd className="font-semibold text-stone-900">{bnNumber(result.subjects)}টি</dd>
                </div>
                <div className="rounded-xl bg-stone-50 p-3">
                  <dt className="text-xs text-stone-500">৪র্থ বিষয় ছাড়া</dt>
                  <dd className="font-semibold text-stone-900">{result.withoutBonus.toFixed(2)}</dd>
                </div>
              </dl>
              {result.bonus > 0 && (
                <p className="mt-4 text-xs text-stone-500">৪র্থ বিষয় থেকে {result.bonus.toFixed(2)} পয়েন্ট যোগ হয়েছে।</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GpaCalculator;
