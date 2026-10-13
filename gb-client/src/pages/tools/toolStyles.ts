// Class strings shared by the tool pages so inputs, cards and buttons look
// the same in every tool.

export const card = "rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6";

export const label = "mb-1.5 block text-sm font-semibold text-stone-700";

export const input =
  "block w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200";

export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-stone-950 transition hover:bg-amber-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-50";

// Two-option switch (semester/year, 4.00/5.00, ...).
export const segment = (active: boolean) =>
  `flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
    active ? "bg-stone-900 text-white shadow-sm" : "text-stone-600 hover:text-stone-900"
  }`;

export const segmentGroup = "flex gap-1 rounded-xl bg-stone-100 p-1";
