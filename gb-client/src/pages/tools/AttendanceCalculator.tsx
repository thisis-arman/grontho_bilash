import { useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import ToolHeader from "./ToolHeader";
import { card, input, label } from "./toolStyles";

const AttendanceCalculator = () => {
  const [held, setHeld] = useState("");
  const [attended, setAttended] = useState("");
  const [required, setRequired] = useState("75");

  const result = useMemo(() => {
    if (held === "" || attended === "" || required === "") return null;

    const total = Number(held);
    const present = Number(attended);
    const need = Number(required);

    if (!Number.isInteger(total) || !Number.isInteger(present) || total <= 0 || present < 0) {
      return { kind: "invalid" as const, message: "ক্লাসের সংখ্যা পূর্ণসংখ্যায় দাও, আর মোট ক্লাস শূন্যের বেশি হতে হবে।" };
    }
    if (present > total) {
      return { kind: "invalid" as const, message: "উপস্থিত ক্লাস মোট ক্লাসের চেয়ে বেশি হতে পারে না।" };
    }
    if (need <= 0 || need > 100) {
      return { kind: "invalid" as const, message: "প্রয়োজনীয় হার 1 থেকে 100 এর মধ্যে দাও।" };
    }

    const ratio = need / 100;
    const percent = (present / total) * 100;

    if (percent >= need) {
      // Largest m with present / (total + m) >= ratio.
      const canMiss = Math.floor(present / ratio - total + 1e-9);
      return { kind: "safe" as const, percent, canMiss };
    }
    if (need === 100) {
      return { kind: "unreachable" as const, percent };
    }
    // Smallest n with (present + n) / (total + n) >= ratio.
    const mustAttend = Math.ceil((ratio * total - present) / (1 - ratio) - 1e-9);
    return { kind: "short" as const, percent, mustAttend };
  }, [held, attended, required]);

  const percent = result && result.kind !== "invalid" ? result.percent : 0;
  const isSafe = result?.kind === "safe";

  return (
    <>
      <ToolHeader
        icon={CalendarCheck}
        title="অ্যাটেনডেন্স ক্যালকুলেটর"
        desc="এখন পর্যন্ত কত ক্লাস হয়েছে আর কয়টায় ছিলে, দাও। কয়টা মিস করা যাবে বা টানা কয়টা করতে হবে, বলে দেবে।"
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className={`${card} space-y-4`}>
          <label className="block">
            <span className={label}>এখন পর্যন্ত মোট ক্লাস হয়েছে</span>
            <input type="number" inputMode="numeric" min={0} step={1} value={held} onChange={(e) => setHeld(e.target.value)} placeholder="যেমন 40" className={input} />
          </label>
          <label className="block">
            <span className={label}>তুমি উপস্থিত ছিলে</span>
            <input type="number" inputMode="numeric" min={0} step={1} value={attended} onChange={(e) => setAttended(e.target.value)} placeholder="যেমন 26" className={input} />
          </label>
          <label className="block">
            <span className={label}>প্রয়োজনীয় উপস্থিতি (%)</span>
            <input type="number" inputMode="decimal" min={1} max={100} step={1} value={required} onChange={(e) => setRequired(e.target.value)} className={input} />
            <span className="mt-1.5 block text-xs text-stone-500">
              বেশিরভাগ প্রতিষ্ঠানে 75%। তোমার প্রতিষ্ঠানের নিয়ম আলাদা হলে বদলে নাও।
            </span>
          </label>
        </div>

        <div className={card} aria-live="polite">
          {!result ? (
            <p className="py-10 text-center text-stone-500">ঘরগুলো পূরণ করলে এখানে ফলাফল দেখাবে।</p>
          ) : result.kind === "invalid" ? (
            <p className="py-10 text-center font-semibold text-red-600">{result.message}</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-stone-500">তোমার উপস্থিতি</p>
              <p className={`mt-1 font-display text-5xl font-extrabold ${isSafe ? "text-emerald-600" : "text-red-600"}`}>
                {percent.toFixed(1)}%
              </p>

              <div className="relative mt-5 h-2.5 rounded-full bg-stone-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isSafe ? "bg-emerald-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
                <span
                  aria-hidden="true"
                  className="absolute -top-1 h-[1.125rem] w-0.5 bg-stone-900"
                  style={{ left: `${Math.min(100, Number(required))}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-stone-500">কালো দাগ: প্রয়োজনীয় {required}%</p>

              <p className="mt-5 text-lg font-semibold leading-relaxed text-stone-900">
                {result.kind === "safe" &&
                  (result.canMiss > 0
                    ? `তুমি নিরাপদ। সামনে টানা ${result.canMiss}টা ক্লাস মিস করলেও ${required}% এর নিচে নামবে না।`
                    : `তুমি ঠিক সীমায় আছো। আর একটা ক্লাস মিস করলেই ${required}% এর নিচে নেমে যাবে।`)}
                {result.kind === "short" &&
                  `${required}% এ পৌঁছাতে সামনের টানা ${result.mustAttend}টা ক্লাসে উপস্থিত থাকতে হবে।`}
                {result.kind === "unreachable" &&
                  "একটা ক্লাসও মিস হয়ে গেলে 100% উপস্থিতিতে আর ফেরা যায় না।"}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AttendanceCalculator;
