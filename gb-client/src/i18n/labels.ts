// Bangla display labels for values that are stored in English in the
// database (conditions, order and payment statuses, ...). Always show these
// labels to users and keep sending the English values to the API.
//
// Words used across the site (keep them consistent):
//   cart/bag → ব্যাগ · order → অর্ডার · checkout → চেকআউট · seller → বিক্রেতা
//   buyer → ক্রেতা · listing → লিস্টিং · price → দাম · delivery → ডেলিভারি
//   search → খুঁজো · category → ক্যাটাগরি · author → লেখক · publisher → প্রকাশক
//   edition → সংস্করণ · log in → লগইন · sign up → সাইন আপ · password → পাসওয়ার্ড
//   dashboard → ড্যাশবোর্ড · profile → প্রোফাইল · save → সেভ করো · cancel → বাতিল
//   delete → মুছে ফেলো · edit → এডিট · bKash → বিকাশ · cash on delivery → ক্যাশ অন ডেলিভারি
// Tone: informal "তুমি", short sentences, everyday words.

const pick = (map: Record<string, string>, value?: string | null) => (value ? map[value] ?? value : "");

export const CONDITION_LABELS: Record<string, string> = {
  New: "নতুন",
  "Like New": "প্রায় নতুন",
  Used: "পুরনো",
  "Digital Content": "ডিজিটাল",
};
export const conditionLabel = (value?: string | null) => pick(CONDITION_LABELS, value);

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  Physical: "ছাপা বই",
  Digital: "ডিজিটাল",
};
export const productTypeLabel = (value?: string | null) => pick(PRODUCT_TYPE_LABELS, value);

export const STOCK_LABELS: Record<string, string> = {
  "In Stock": "স্টকে আছে",
  "Out of Stock": "স্টকে নেই",
  "Pre-order": "প্রি-অর্ডার",
};
export const stockLabel = (value?: string | null) => pick(STOCK_LABELS, value);

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "অপেক্ষমাণ",
  confirmed: "নিশ্চিত হয়েছে",
  shipped: "পাঠানো হয়েছে",
  delivered: "পৌঁছে গেছে",
  cancelled: "বাতিল",
};
export const orderStatusLabel = (value?: string | null) => pick(ORDER_STATUS_LABELS, value);

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "বাকি",
  paid: "পরিশোধিত",
  "partially-paid": "আংশিক পরিশোধিত",
  failed: "ব্যর্থ",
};
export const paymentStatusLabel = (value?: string | null) => pick(PAYMENT_STATUS_LABELS, value);

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "ক্যাশ অন ডেলিভারি",
  bkash: "বিকাশ",
};
export const paymentMethodLabel = (value?: string | null) => pick(PAYMENT_METHOD_LABELS, value);

export const SHIPPING_AREA_LABELS: Record<string, string> = {
  inside: "এলাকার ভেতরে",
  outside: "এলাকার বাইরে",
};
export const shippingAreaLabel = (value?: string | null) => pick(SHIPPING_AREA_LABELS, value);

export const EXAM_LEVEL_LABELS: Record<string, string> = {
  SSC: "এসএসসি",
  HSC: "এইচএসসি",
  Honours: "অনার্স",
  Masters: "মাস্টার্স",
  "Admission Test": "ভর্তি পরীক্ষা",
  "Job Exam": "চাকরির পরীক্ষা",
  Other: "অন্যান্য",
};
export const examLevelLabel = (value?: string | null) => pick(EXAM_LEVEL_LABELS, value);

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
// 1250 → "১২৫০". For counts and prices in running Bangla text.
export const bnNumber = (value: number | string) =>
  String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);

// Formats a taka amount: ৳১,২৫০
export const taka = (amount: number) => `৳${bnNumber(Math.round(amount).toLocaleString("en-IN"))}`;

// Shop categories are stored in English.
export const CATEGORY_LABELS: Record<string, string> = {
  Academic: "একাডেমিক",
  "Academic Books": "একাডেমিক বই",
  Fiction: "কল্পকাহিনী",
  "Non-Fiction": "নন-ফিকশন",
  Science: "বিজ্ঞান",
  Technology: "প্রযুক্তি",
  Religion: "ধর্মীয়",
  Children: "শিশুতোষ",
  "Self-Help": "সেলফ-হেল্প",
  Business: "ব্যবসা",
  Other: "অন্যান্য",
};
export const categoryLabel = (value?: string | null) => pick(CATEGORY_LABELS, value);

// 1 → "১ম বর্ষ"
const YEAR_ORDINALS: Record<number, string> = { 1: "১ম", 2: "২য়", 3: "৩য়", 4: "৪র্থ", 5: "৫ম" };
export const yearLabel = (year: number) => `${YEAR_ORDINALS[year] ?? bnNumber(year)} বর্ষ`;

export const PROGRAM_LABELS: Record<string, string> = {
  BA: "বিএ (অনার্স)",
  BSS: "বিএসএস (অনার্স)",
  BSc: "বিএসসি (অনার্স)",
  BBA: "বিবিএ (অনার্স)",
};
export const programLabel = (value?: string | null) => pick(PROGRAM_LABELS, value);
