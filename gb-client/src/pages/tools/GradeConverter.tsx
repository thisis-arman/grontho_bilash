import { useMemo, useState } from "react";
import { Percent } from "lucide-react";
import ToolHeader from "./ToolHeader";
import { card, input, label, segment, segmentGroup } from "./toolStyles";

// Marks → letter grade and grade point, on the two scales students meet:
// the UGC uniform scale (public/private universities, National University)
// and the SSC/HSC board scale.
const SCALES = {
  ugc: {
    name: "বিশ্ববিদ্যালয় (UGC)",
    note: "ইউজিসির অভিন্ন গ্রেডিং পদ্ধতি; সরকারি-বেসরকারি বিশ্ববিদ্যালয় ও জাতীয় বিশ্ববিদ্যালয়ে প্রচলিত।",
    max: 4,
    rows: [
      { min: 80, grade: "A+", gp: 4.0 },
      { min: 75, grade: "A", gp: 3.75 },
      { min: 70, grade: "A-", gp: 3.5 },
      { min: 65, grade: "B+", gp: 3.25 },
      { min: 60, grade: "B", gp: 3.0 },
      { min: 55, grade: "B-", gp: 2.75 },
      { min: 50, grade: "C+", gp: 2.5 },
      { min: 45, grade: "C", gp: 2.25 },
      { min: 40, grade: "D", gp: 2.0 },
      { min: 0, grade: "F", gp: 0 },
    ],
  },
  board: {
    name: "এসএসসি / এইচএসসি",
    note: "শিক্ষা বোর্ডের গ্রেডিং পদ্ধতি (৫.০০ স্কেল)।",
    max: 5,
    rows: [
      { min: 80, grade: "A+", gp: 5.0 },
      { min: 70, grade: "A", gp: 4.0 },
      { min: 60, grade: "A-", gp: 3.5 },
      { min: 50, grade: "B", gp: 3.0 },
      { min: 40, grade: "C", gp: 2.0 },
      { min: 33, grade: "D", gp: 1.0 },
      { min: 0, grade: "F", gp: 0 },
    ],
  },
} as const;

type ScaleKey = keyof typeof SCALES;

const rangeText = (rows: readonly { min: number }[], i: number) =>
  i === 0 ? `${rows[0].min}–100` : `${rows[i].min}–${rows[i - 1].min - 1}`;

const GradeConverter = () => {
  const [scale, setScale] = useState<ScaleKey>("ugc");
  const [marks, setMarks] = useState("");
  const [total, setTotal] = useState("100");
  const table = SCALES[scale];

  const result = useMemo(() => {
    if (marks === "" || total === "") return null;
    const got = Number(marks);
    const outOf = Number(total);
    if (!(outOf > 0) || got < 0) return { error: "নম্বর ঠিকভাবে দাও; মোট নম্বর শূন্যের বেশি হতে হবে।" };
    if (got > outOf) return { error: "প্রাপ্ত নম্বর মোট নম্বরের চেয়ে বেশি হতে পারে না।" };
    // Percentages are compared after rounding to whole marks, as result sheets do.
    const percent = (got / outOf) * 100;
    const rounded = Math.round(percent * 100) / 100;
    const index = table.rows.findIndex((r) => Math.floor(rounded) >= r.min);
    return { percent: rounded, index, row: table.rows[index] };
  }, [marks, total, table]);

  return (
    <>
      <ToolHeader
        icon={Percent}
        title="নম্বর থেকে গ্রেড"
        desc="কত নম্বর পেয়েছ বসাও, কোন গ্রেড আর কত পয়েন্ট (GP) হবে দেখে নাও। বিশ্ববিদ্যালয় ও বোর্ড, দুই পদ্ধতিতেই।"
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className={`${card} space-y-4`}>
          <div className={segmentGroup} role="group" aria-label="গ্রেডিং পদ্ধতি">
            {(Object.keys(SCALES) as ScaleKey[]).map((key) => (
              <button key={key} type="button" aria-pressed={scale === key} onClick={() => setScale(key)} className={segment(scale === key)}>
                {SCALES[key].name}
              </button>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-stone-500">{table.note}</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={label}>প্রাপ্ত নম্বর</span>
              <input type="number" inputMode="decimal" min={0} value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="যেমন 68" className={`${input} h-12 text-base`} />
            </label>
            <label className="block">
              <span className={label}>মোট নম্বর</span>
              <input type="number" inputMode="decimal" min={1} value={total} onChange={(e) => setTotal(e.target.value)} className={`${input} h-12 text-base`} />
            </label>
          </div>

          <div className="rounded-xl bg-stone-50 p-4 text-center" aria-live="polite">
            {!result ? (
              <p className="text-sm text-stone-500">নম্বর বসালে এখানে গ্রেড দেখাবে।</p>
            ) : "error" in result ? (
              <p className="text-sm font-semibold text-red-600">{result.error}</p>
            ) : (
              <>
                <p className="font-display text-5xl font-bold text-stone-900">{result.row.grade}</p>
                <p className="mt-2 text-sm text-stone-600">
                  GP <b>{result.row.gp.toFixed(2)}</b> / {table.max.toFixed(2)} · {result.percent}%
                </p>
              </>
            )}
          </div>
        </div>

        <div className={card}>
          <p className={label}>{table.name} গ্রেড তালিকা</p>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-500">
                <th className="py-2 font-semibold">নম্বর (%)</th>
                <th className="py-2 font-semibold">গ্রেড</th>
                <th className="py-2 text-right font-semibold">GP</th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => {
                const active = result && !("error" in result) && result.index === i;
                return (
                  <tr key={row.grade} className={`border-t border-stone-100 ${active ? "bg-amber-50 font-semibold text-amber-900" : "text-stone-700"}`}>
                    <td className="px-1 py-2">{row.min === 0 ? `0–${table.rows[i - 1].min - 1}` : rangeText(table.rows, i)}</td>
                    <td className="py-2">{row.grade}</td>
                    <td className="py-2 text-right">{row.gp.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default GradeConverter;
