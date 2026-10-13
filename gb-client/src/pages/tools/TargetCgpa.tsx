import { useMemo, useState } from "react";
import { Target, Wand2 } from "lucide-react";
import ToolHeader from "./ToolHeader";
import { card, input, label, secondaryButton, segment, segmentGroup } from "./toolStyles";
import { SCALE_4, SCALE_5, STORAGE_KEY, getTermResult } from "./cgpa-calculator/constants";
import { Term } from "./cgpa-calculator/types";

type Field = "current" | "done" | "target" | "remaining";

const fields: { key: Field; label: string; placeholder: string; step: string }[] = [
  { key: "current", label: "এখনকার CGPA", placeholder: "যেমন 3.20", step: "0.01" },
  { key: "done", label: "শেষ করা ক্রেডিট", placeholder: "যেমন 60", step: "0.5" },
  { key: "target", label: "টার্গেট CGPA", placeholder: "যেমন 3.50", step: "0.01" },
  { key: "remaining", label: "বাকি ক্রেডিট", placeholder: "যেমন 60", step: "0.5" },
];

// Pulls the current CGPA and credits out of what the CGPA calculator saved.
const readCalculatorData = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    const terms: Term[] = saved?.terms ?? [];
    const scaleType = saved?.scaleType === "5.00" ? "5.00" : "4.00";
    const scale = scaleType === "5.00" ? SCALE_5 : SCALE_4;
    let credits = 0;
    let points = 0;
    for (const term of terms) {
      if (!term.included) continue;
      const result = getTermResult(term, scale, Number(scaleType));
      credits += result.credits;
      points += result.points;
    }
    return credits > 0 ? { scaleType, credits, cgpa: points / credits } : null;
  } catch {
    return null;
  }
};

const TargetCgpa = () => {
  const [scale, setScale] = useState<"4.00" | "5.00">("4.00");
  const [values, setValues] = useState<Record<Field, string>>({
    current: "",
    done: "",
    target: "",
    remaining: "",
  });
  const [importNote, setImportNote] = useState("");

  const max = Number(scale);

  const importFromCalculator = () => {
    const data = readCalculatorData();
    if (!data) {
      setImportNote("CGPA ক্যালকুলেটরে এখনো কোনো রেজাল্ট সেভ করা নেই।");
      return;
    }
    setScale(data.scaleType as "4.00" | "5.00");
    setValues((prev) => ({
      ...prev,
      current: data.cgpa.toFixed(2),
      done: String(data.credits),
    }));
    setImportNote("CGPA ক্যালকুলেটর থেকে এখনকার CGPA ও ক্রেডিট বসানো হয়েছে।");
  };

  const result = useMemo(() => {
    const current = Number(values.current);
    const done = Number(values.done);
    const target = Number(values.target);
    const remaining = Number(values.remaining);

    if (Object.values(values).some((v) => v === "")) return null;
    if (current < 0 || current > max || target < 0 || target > max) {
      return { kind: "invalid" as const, message: `CGPA 0 থেকে ${scale} এর মধ্যে হতে হবে।` };
    }
    if (done < 0 || remaining <= 0) {
      return { kind: "invalid" as const, message: "বাকি ক্রেডিট শূন্যের বেশি হতে হবে।" };
    }

    const total = done + remaining;
    const required = (target * total - current * done) / remaining;
    // What the final CGPA would be for a few GPA levels in the remaining credits.
    const scenarios = [max, max - 0.25, max - 0.5, max - 0.75, max - 1].map((gpa) => ({
      gpa,
      final: (current * done + gpa * remaining) / total,
    }));
    const best = scenarios[0].final;

    if (required > max) return { kind: "impossible" as const, required, best, scenarios };
    if (required <= 0) return { kind: "secured" as const, required, best, scenarios };
    return { kind: "possible" as const, required, best, scenarios };
  }, [values, max, scale]);

  return (
    <>
      <ToolHeader
        icon={Target}
        title="টার্গেট CGPA প্ল্যানার"
        desc="কাঙ্ক্ষিত CGPA-তে পৌঁছাতে বাকি ক্রেডিটগুলোতে গড়ে কত GPA তুলতে হবে, জেনে নাও।"
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className={card}>
          <p className={label}>গ্রেডিং স্কেল</p>
          <div className={`${segmentGroup} mb-5`} role="group" aria-label="গ্রেডিং স্কেল">
            {(["4.00", "5.00"] as const).map((s) => (
              <button key={s} type="button" aria-pressed={scale === s} onClick={() => setScale(s)} className={segment(scale === s)}>
                {s} স্কেল
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.key} className="block">
                <span className={label}>{field.label}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={field.step}
                  value={values[field.key]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className={input}
                />
              </label>
            ))}
          </div>

          <button type="button" onClick={importFromCalculator} className={`${secondaryButton} mt-5 w-full`}>
            <Wand2 size={16} aria-hidden="true" /> CGPA ক্যালকুলেটর থেকে বসাও
          </button>
          {importNote && <p className="mt-2 text-center text-xs text-stone-500">{importNote}</p>}
        </div>

        <div className={card} aria-live="polite">
          {!result ? (
            <p className="py-10 text-center text-stone-500">
              চারটা ঘর পূরণ করলে এখানে ফলাফল দেখাবে।
            </p>
          ) : result.kind === "invalid" ? (
            <p className="py-10 text-center font-semibold text-red-600">{result.message}</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-stone-500">বাকি ক্রেডিটে গড়ে দরকার</p>
              <p
                className={`mt-1 font-display text-5xl font-extrabold ${
                  result.kind === "impossible" ? "text-red-600" : result.kind === "secured" ? "text-emerald-600" : "text-stone-900"
                }`}
              >
                {result.kind === "secured" ? "0.00" : result.required.toFixed(2)}
                <span className="ml-2 text-lg font-semibold text-stone-400">GPA</span>
              </p>

              <p className="mt-4 leading-relaxed text-stone-700">
                {result.kind === "possible" &&
                  `বাকি ${values.remaining} ক্রেডিটে গড়ে ${result.required.toFixed(2)} GPA রাখতে পারলে তোমার CGPA ${Number(values.target).toFixed(2)} হবে।`}
                {result.kind === "impossible" &&
                  `এটা ${scale} স্কেলে সম্ভব নয়। বাকি সব ক্রেডিটে সর্বোচ্চ গ্রেড পেলেও CGPA সর্বোচ্চ ${result.best.toFixed(2)} হবে।`}
                {result.kind === "secured" &&
                  "তোমার এখনকার রেজাল্টেই টার্গেট নিশ্চিত। বাকি কোর্সগুলো পাস করলেই CGPA টার্গেটের নিচে নামবে না।"}
              </p>

              <table className="mt-6 w-full text-sm">
                <caption className="mb-2 text-left text-xs font-semibold text-stone-500">
                  বাকি ক্রেডিটে যে GPA পেলে শেষ CGPA যা দাঁড়াবে
                </caption>
                <thead>
                  <tr className="border-b border-stone-200 text-left text-stone-500">
                    <th scope="col" className="py-2 font-semibold">বাকি ক্রেডিটে GPA</th>
                    <th scope="col" className="py-2 text-right font-semibold">শেষ CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {result.scenarios.map((row) => (
                    <tr key={row.gpa} className="border-b border-stone-100">
                      <td className="py-2 text-stone-700">{row.gpa.toFixed(2)}</td>
                      <td
                        className={`py-2 text-right font-semibold ${
                          row.final >= Number(values.target) ? "text-emerald-600" : "text-stone-900"
                        }`}
                      >
                        {row.final.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TargetCgpa;
