import { escapeRegex } from "./content";

// Shared search logic: the shop, search suggestions, "notify me" alerts and
// book-list availability all match text the same way.
//
// - Bangla digits become Latin ("২০২৪" finds "2024").
// - The query is split into words; every word must match somewhere, so
//   "principles accounting" finds "Principles of Accounting".
// - Each word is expanded with Bangla/English equivalents, so "হিসাববিজ্ঞান"
//   also finds "Accounting" and "physics" finds "পদার্থবিজ্ঞান".

const MAX_QUERY_LENGTH = 100;
const MAX_WORDS = 6;

const BN_DIGITS: Record<string, string> = {
  "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
};

// Words that mean the same thing to a student searching for a book. All
// members of a group are searched when any one of them is typed. Keep
// entries lowercase.
const SYNONYM_GROUPS: string[][] = [
  ["accounting", "হিসাববিজ্ঞান", "হিসাব বিজ্ঞান", "একাউন্টিং", "অ্যাকাউন্টিং"],
  ["finance", "ফিন্যান্স", "ফাইন্যান্স", "অর্থায়ন"],
  ["management", "ব্যবস্থাপনা", "ম্যানেজমেন্ট"],
  ["marketing", "মার্কেটিং", "বিপণন", "বাজারজাতকরণ"],
  ["economics", "অর্থনীতি", "ইকোনমিক্স"],
  ["business", "ব্যবসা", "বিজনেস", "ব্যবসায়"],
  ["statistics", "পরিসংখ্যান", "স্ট্যাটিস্টিক্স"],
  ["mathematics", "math", "maths", "গণিত", "অংক", "ম্যাথ"],
  ["higher math", "higher mathematics", "উচ্চতর গণিত"],
  ["physics", "পদার্থবিজ্ঞান", "পদার্থ বিজ্ঞান", "ফিজিক্স"],
  ["chemistry", "রসায়ন", "কেমিস্ট্রি"],
  ["biology", "জীববিজ্ঞান", "জীব বিজ্ঞান", "বায়োলজি"],
  ["botany", "উদ্ভিদবিজ্ঞান", "উদ্ভিদবিদ্যা"],
  ["zoology", "প্রাণিবিজ্ঞান", "প্রাণিবিদ্যা"],
  ["science", "বিজ্ঞান", "সায়েন্স"],
  ["english", "ইংরেজি", "ইংলিশ"],
  ["bangla", "bengali", "বাংলা"],
  ["grammar", "ব্যাকরণ", "গ্রামার"],
  ["literature", "সাহিত্য"],
  ["history", "ইতিহাস"],
  ["islamic history", "ইসলামের ইতিহাস"],
  ["geography", "ভূগোল"],
  ["political science", "রাষ্ট্রবিজ্ঞান"],
  ["sociology", "সমাজবিজ্ঞান"],
  ["social work", "সমাজকর্ম"],
  ["philosophy", "দর্শন"],
  ["psychology", "মনোবিজ্ঞান"],
  ["law", "আইন"],
  ["islamic studies", "ইসলামিক স্টাডিজ", "ইসলাম শিক্ষা"],
  ["religion", "ধর্ম", "ধর্মীয়"],
  ["ict", "information technology", "তথ্য ও যোগাযোগ প্রযুক্তি", "আইসিটি"],
  ["computer", "কম্পিউটার"],
  ["computer science", "cse", "কম্পিউটার বিজ্ঞান"],
  ["programming", "প্রোগ্রামিং"],
  ["engineering", "প্রকৌশল", "ইঞ্জিনিয়ারিং"],
  ["medical", "মেডিকেল", "চিকিৎসা"],
  ["anatomy", "অ্যানাটমি", "শারীরস্থান"],
  ["agriculture", "কৃষি", "কৃষিশিক্ষা"],
  ["admission", "ভর্তি", "এডমিশন", "অ্যাডমিশন"],
  ["admission test", "ভর্তি পরীক্ষা", "ভর্তি গাইড"],
  ["bcs", "বিসিএস"],
  ["job", "চাকরি", "জব"],
  ["general knowledge", "gk", "সাধারণ জ্ঞান"],
  ["guide", "গাইড", "সহায়িকা"],
  ["note", "notes", "নোট", "লেকচার শিট"],
  ["suggestion", "সাজেশন"],
  ["question", "questions", "প্রশ্ন", "প্রশ্নব্যাংক", "প্রশ্ন ব্যাংক"],
  ["model test", "মডেল টেস্ট"],
  ["dictionary", "অভিধান", "ডিকশনারি"],
  ["novel", "উপন্যাস", "নভেল"],
  ["story", "গল্প"],
  ["poem", "poetry", "কবিতা"],
  ["fiction", "কল্পকাহিনী", "ফিকশন"],
  ["thriller", "থ্রিলার", "রহস্য"],
  ["self help", "self-help", "আত্মোন্নয়ন", "সেলফ হেল্প"],
  ["children", "শিশুতোষ", "শিশু", "কিশোর"],
  ["quran", "কুরআন", "কোরআন"],
  ["hadith", "হাদিস"],
  ["academic", "একাডেমিক", "পাঠ্যবই", "পাঠ্য বই"],
  ["textbook", "text book", "পাঠ্যবই", "টেক্সটবুক"],
  ["honours", "honors", "অনার্স", "স্নাতক"],
  ["masters", "মাস্টার্স", "স্নাতকোত্তর"],
  ["degree", "ডিগ্রি", "ডিগ্রী"],
  ["ssc", "এসএসসি"],
  ["hsc", "এইচএসসি", "ইন্টারমিডিয়েট"],
  ["jsc", "জেএসসি"],
  ["national university", "nu", "জাতীয় বিশ্ববিদ্যালয়"],
  ["1st year", "first year", "১ম বর্ষ", "প্রথম বর্ষ"],
  ["2nd year", "second year", "২য় বর্ষ", "দ্বিতীয় বর্ষ"],
  ["3rd year", "third year", "৩য় বর্ষ", "তৃতীয় বর্ষ"],
  ["4th year", "fourth year", "৪র্থ বর্ষ", "চতুর্থ বর্ষ"],
  ["1st paper", "first paper", "১ম পত্র", "প্রথম পত্র"],
  ["2nd paper", "second paper", "২য় পত্র", "দ্বিতীয় পত্র"],
];

// Prepared once: lowercase, digits normalised.
const GROUPS = SYNONYM_GROUPS.map((group) => group.map((word) => normalizeDigits(word.toLowerCase())));

function normalizeDigits(value: string) {
  return value.replace(/[০-৯]/g, (d) => BN_DIGITS[d]);
}

// Cleans user input: Unicode-normalised, no control characters, single
// spaces, Bangla digits as Latin, at most 100 characters.
export const normalizeQuery = (raw: unknown) =>
  normalizeDigits(
    String(raw ?? "")
      .normalize("NFC")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  ).slice(0, MAX_QUERY_LENGTH);

// Lowercase key used to group the same search typed in different ways.
export const queryKey = (raw: unknown) => normalizeQuery(raw).toLowerCase();

// Other ways of writing the same word. Partial words count, so a student
// still typing "হিসা" already gets "accounting" too.
export const expandWord = (word: string): string[] => {
  const lower = word.toLowerCase();
  const out = new Set([lower]);
  if (lower.length >= 2) {
    for (const group of GROUPS) {
      if (group.some((member) => member.startsWith(lower) || (member.length >= 3 && lower === member))) {
        group.forEach((member) => out.add(member));
      }
    }
  }
  return [...out];
};

// Multi-word synonyms ("national university", "১ম বর্ষ") are matched as
// a whole before the query is split into single words.
const splitWords = (query: string) => {
  let rest = ` ${query.toLowerCase()} `;
  const phrases: string[] = [];
  for (const group of GROUPS) {
    for (const member of group) {
      if (member.includes(" ") && rest.includes(` ${member} `)) {
        phrases.push(member);
        rest = rest.replace(` ${member} `, " ");
      }
    }
  }
  const words = rest.split(" ").filter((w) => w.length > 0);
  return [...phrases, ...words].slice(0, MAX_WORDS);
};

// For each word of the query, the list of alternatives that may match.
export const queryTerms = (raw: unknown): string[][] => {
  const query = normalizeQuery(raw);
  if (!query) return [];
  return splitWords(query).map(expandWord);
};

// A MongoDB filter: every word must match one of `fields`, in any of its
// alternative spellings. Input is escaped, so it never runs as a regex.
export const buildTextFilter = (raw: unknown, fields: string[]): Record<string, unknown> | null => {
  const terms = queryTerms(raw);
  if (!terms.length) return null;
  return {
    $and: terms.map((alternatives) => ({
      $or: fields.flatMap((field) =>
        alternatives.map((alt) => ({ [field]: { $regex: escapeRegex(alt), $options: "i" } }))
      ),
    })),
  };
};

// The same test in memory, for matching alerts against a new listing.
export const textMatches = (raw: unknown, text: string) => {
  const haystack = normalizeDigits(text.normalize("NFC").toLowerCase());
  const terms = queryTerms(raw);
  return terms.length > 0 && terms.every((alternatives) => alternatives.some((alt) => haystack.includes(alt)));
};

// Equivalent words in the other language, for "related searches":
// "হিসাববিজ্ঞান" → ["accounting", ...].
export const translations = (raw: unknown): string[] => {
  const query = queryKey(raw);
  if (query.length < 2) return [];
  const group = GROUPS.find((g) => g.includes(query) || g.some((m) => m.startsWith(query)));
  return group ? group.filter((m) => m !== query) : [];
};
