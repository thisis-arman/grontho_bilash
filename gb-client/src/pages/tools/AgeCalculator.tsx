import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import ToolHeader from "./ToolHeader";
import { card, input, label } from "./toolStyles";
import { bnNumber } from "../../i18n/labels";

// Age on a given date (e.g. the date a job circular counts age from), and
// whether it is within the circular's age limit. Job circulars in Bangladesh
// state the limit and the reference date; both are entered here, so no rule
// is assumed.

const today = () => new Date().toISOString().slice(0, 10);

const parse = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  return y && m && d ? new Date(Date.UTC(y, m - 1, d)) : null;
};

// Calendar difference in years, months and days.
const ageOn = (birth: Date, on: Date) => {
  let years = on.getUTCFullYear() - birth.getUTCFullYear();
  let months = on.getUTCMonth() - birth.getUTCMonth();
  let days = on.getUTCDate() - birth.getUTCDate();
  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(on.getUTCFullYear(), on.getUTCMonth(), 0)).getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const AgeCalculator = () => {
  const [birth, setBirth] = useState("");
  const [onDate, setOnDate] = useState(today);
  const [limit, setLimit] = useState("");

  const result = useMemo(() => {
    const b = parse(birth);
    const o = parse(onDate);
    if (!b || !o) return null;
    if (b > o) return { error: "জন্ম তারিখ হিসাবের তারিখের পরে হতে পারে না।" };
    const age = ageOn(b, o);
    const max = Number(limit);
    let eligibility: null | { ok: boolean; turns: Date; reached: boolean } = null;
    if (limit !== "" && max > 0) {
      const turns = new Date(Date.UTC(b.getUTCFullYear() + max, b.getUTCMonth(), b.getUTCDate()));
      // Within the limit up to and including the day the age limit is reached.
      eligibility = { ok: o <= turns, turns, reached: o >= turns };
    }
    return { age, eligibility };
  }, [birth, onDate, limit]);

  return (
    <>
      <ToolHeader
        icon={CalendarClock}
        title="চাকরির বয়স ক্যালকুলেটর"
        desc="জন্ম তারিখ আর সার্কুলারের তারিখ দাও। সেই দিনে তোমার বয়স কত, আর বয়সসীমার মধ্যে আছ কিনা দেখে নাও।"
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className={`${card} space-y-4`}>
          <label className="block">
            <span className={label}>তোমার জন্ম তারিখ</span>
            <input type="date" value={birth} max={today()} onChange={(e) => setBirth(e.target.value)} className={`${input} h-12 text-base`} />
          </label>
          <label className="block">
            <span className={label}>কোন তারিখে বয়স হিসাব হবে</span>
            <input type="date" value={onDate} onChange={(e) => setOnDate(e.target.value)} className={`${input} h-12 text-base`} />
            <span className="mt-1.5 block text-xs text-stone-500">সার্কুলারে যে তারিখ ধরে বয়স গোনা হয় (সাধারণত আবেদন শুরু বা বিজ্ঞপ্তির তারিখ)।</span>
          </label>
          <label className="block">
            <span className={label}>সার্কুলারের বয়সসীমা (বছর, ঐচ্ছিক)</span>
            <input type="number" inputMode="numeric" min={1} max={99} value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="যেমন 30" className={`${input} h-12 text-base`} />
          </label>
        </div>

        <div className={card} aria-live="polite">
          {!result ? (
            <p className="py-12 text-center text-stone-500">জন্ম তারিখ দিলে এখানে বয়স দেখাবে।</p>
          ) : "error" in result ? (
            <p className="py-12 text-center font-semibold text-red-600">{result.error}</p>
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm font-semibold text-stone-500">তোমার বয়স</p>
              <p className="mt-3 flex items-end justify-center gap-4">
                {[
                  [result.age.years, "বছর"],
                  [result.age.months, "মাস"],
                  [result.age.days, "দিন"],
                ].map(([n, unit]) => (
                  <span key={unit as string} className="flex flex-col items-center">
                    <span className="font-display text-5xl font-bold text-stone-900">{bnNumber(n as number)}</span>
                    <span className="text-sm text-stone-500">{unit}</span>
                  </span>
                ))}
              </p>
              {result.eligibility && (
                <div className={`mt-6 rounded-xl p-4 text-left text-sm leading-relaxed ${result.eligibility.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
                  <p className="font-semibold">{result.eligibility.ok ? "বয়সসীমার মধ্যে আছ ✓" : "বয়সসীমা পার হয়ে গেছে"}</p>
                  <p className="mt-1">
                    তুমি {formatDate(result.eligibility.turns)} তারিখে {bnNumber(limit)} বছর পূর্ণ {result.eligibility.reached ? "করেছ" : "করবে"}।
                  </p>
                </div>
              )}
              <p className="mt-5 text-xs leading-relaxed text-stone-500">
                কোটা বা বিশেষ ক্ষেত্রে বয়সসীমা আলাদা হতে পারে; আবেদনের আগে সার্কুলারের নিয়ম মিলিয়ে নাও।
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AgeCalculator;
