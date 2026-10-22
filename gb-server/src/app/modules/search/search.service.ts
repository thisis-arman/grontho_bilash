import { ProductModel } from "../book/product.model";
import { BlogModel } from "../blogs/blog.model";
import { SuggestionModel } from "../suggestion/suggestion.model";
import { BookListModel } from "../booklist/booklist.model";
import { BookAlertModel } from "../alerts/alert.model";
import { buildTextFilter, normalizeQuery, queryKey, translations } from "../../utils/searchText";
import { escapeRegex } from "../../utils/content";
import { SearchLogModel } from "./searchLog.model";
import { curriculumService } from "../curriculum/curriculum.service";

// Fields a shopper can search by. Used by the shop list and suggestions.
export const PRODUCT_SEARCH_FIELDS = [
  "title",
  "bookMetadata.author",
  "bookMetadata.isbn",
  "category",
  "subcategory",
  // The course a book is listed for: "212501" or "Principles of Accounting".
  "academicMetadata.courseTitle",
  "academicMetadata.courseCode",
  "academicMetadata.departmentName",
];

const YEAR_BN: Record<number, string> = { 1: "১ম", 2: "২য়", 3: "৩য়", 4: "৪র্থ", 5: "৫ম" };

export const FOR_SALE = { isDeleted: false, isPublished: true, stockStatus: { $ne: "Out of Stock" } };

// Small in-memory cache: the same few prefixes ("acc", "accou", ...) are
// requested over and over while people type. Per server instance, short-lived.
const cache = new Map<string, { at: number; data: unknown }>();
const CACHE_MS = 60_000;
const CACHE_MAX = 500;
const cached = async <T>(key: string, ms: number, load: () => Promise<T>): Promise<T> => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ms) return hit.data as T;
  const data = await load();
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
  cache.set(key, { at: Date.now(), data });
  return data;
};

// Ranks a title for a query: starts with it > a word starts with it > contains it.
const rank = (title: string, query: string) => {
  const t = title.toLowerCase();
  if (t.startsWith(query)) return 3;
  if (t.includes(` ${query}`)) return 2;
  return t.includes(query) ? 1 : 0;
};

type ProductHit = {
  title: string;
  slug: string;
  images?: string[];
  price?: { basePrice?: number; discountPrice?: number };
  bookMetadata?: { author?: string };
  condition?: string;
  category?: string;
};

// What the search box shows while someone types.
const suggest = (raw: unknown) => {
  const query = normalizeQuery(raw);
  const key = query.toLowerCase();
  if (key.length < 2) return Promise.resolve({ query, products: [], terms: [], content: [] });

  return cached(`suggest:${key}`, CACHE_MS, async () => {
    const productFilter = buildTextFilter(query, PRODUCT_SEARCH_FIELDS);
    const contentFilter = buildTextFilter(query, ["title", "subject", "department", "program", "tags"]);
    const booklistFilter = buildTextFilter(query, ["title", "department", "program", "institution", "books.title"]);
    const blogFilter = buildTextFilter(query, ["title", "tags"]);
    const startsWith = { $regex: `^${escapeRegex(key)}`, $options: "i" };

    const [products, total, contents, lists, posts, popular, courses] = await Promise.all([
      ProductModel.find({ ...FOR_SALE, ...productFilter })
        .select("title slug images price bookMetadata.author condition category")
        .sort({ viewCount: -1 })
        .limit(30)
        .lean<ProductHit[]>(),
      ProductModel.countDocuments({ ...FOR_SALE, ...productFilter }),
      SuggestionModel.find({ status: "published", isDeleted: false, ...contentFilter })
        .select("title slug kind")
        .sort({ views: -1 })
        .limit(3)
        .lean<{ title: string; slug: string; kind?: string }[]>(),
      BookListModel.find({ status: "published", isDeleted: false, ...booklistFilter })
        .select("title slug")
        .limit(2)
        .lean<{ title: string; slug: string }[]>(),
      BlogModel.find({ status: "published", isDeleted: false, ...blogFilter })
        .select("title slug")
        .limit(1)
        .lean<{ title: string; slug: string }[]>(),
      // Searches other students made that found something.
      SearchLogModel.find({ term: startsWith, lastResults: { $gt: 0 }, count: { $gte: 2 } })
        .select("display")
        .sort({ count: -1 })
        .limit(4)
        .lean<{ display: string }[]>(),
      // Courses from the syllabus catalogue ("Principles of Accounting", "212501").
      curriculumService.searchCourses(query, 2),
    ]);

    const ranked = products
      .map((p) => ({ p, score: rank(p.title, key) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ p }) => ({
        title: p.title,
        slug: p.slug,
        image: p.images?.[0] ?? "",
        price: p.price?.discountPrice || p.price?.basePrice || 0,
        author: p.bookMetadata?.author ?? "",
        condition: p.condition ?? "",
      }));

    // "Related searches": the other-language name, matching authors and
    // categories, and popular searches with the same start.
    const terms = new Set<string>();
    translations(query).slice(0, 2).forEach((t) => terms.add(t));
    for (const p of products) {
      if (p.bookMetadata?.author?.toLowerCase().includes(key)) terms.add(p.bookMetadata.author);
      if (p.category?.toLowerCase().includes(key)) terms.add(p.category);
    }
    popular.forEach((p) => terms.add(p.display));
    terms.delete(query);

    const content = [
      ...courses.map((c) => ({
        kind: "course",
        title: `${c.code ? `${c.code} · ` : ""}${c.title} (${c.departmentBn || c.department}, ${YEAR_BN[c.year] ?? c.year} বর্ষ)`,
        url: `/courses/${c.slug}?year=${c.year}`,
      })),
      ...lists.map((l) => ({ kind: "booklist", title: l.title, url: `/booklists/${l.slug}` })),
      ...contents.map((c) => ({
        kind: c.kind === "question" ? "question" : "suggestion",
        title: c.title,
        url: `/${c.kind === "question" ? "questions" : "suggestions"}/${c.slug}`,
      })),
      ...posts.map((b) => ({ kind: "blog", title: b.title, url: `/blogs/${b.slug}` })),
    ].slice(0, 4);

    return { query, total, products: ranked, terms: [...terms].slice(0, 5), content };
  });
};

// Popular searches, shown when the search box is empty.
const popular = () =>
  cached("popular", 10 * 60_000, async () => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const rows = await SearchLogModel.find({ lastSearchedAt: { $gte: since }, lastResults: { $gt: 0 }, count: { $gte: 2 } })
      .select("display")
      .sort({ count: -1 })
      .limit(8)
      .lean<{ display: string }[]>();
    return rows.map((r) => r.display);
  });

// Records a search the shopper actually made. The result count is worked
// out here rather than trusted from the browser.
const logSearch = async (raw: unknown) => {
  const display = normalizeQuery(raw);
  const term = display.toLowerCase();
  if (term.length < 2) return { results: 0 };

  const filter = buildTextFilter(display, PRODUCT_SEARCH_FIELDS);
  const results = await ProductModel.countDocuments({ ...FOR_SALE, ...filter });

  await SearchLogModel.updateOne(
    { term },
    {
      $set: { display, lastResults: results, lastSearchedAt: new Date() },
      $inc: { count: 1, zeroCount: results === 0 ? 1 : 0 },
    },
    { upsert: true }
  );
  return { results };
};

// For the admin "what are students looking for" page.
const insights = async () => {
  const [notFound, top, openAlerts, totals] = await Promise.all([
    SearchLogModel.find({ lastResults: 0, zeroCount: { $gt: 0 } })
      .select("display count zeroCount lastSearchedAt")
      .sort({ zeroCount: -1, lastSearchedAt: -1 })
      .limit(50)
      .lean(),
    SearchLogModel.find({})
      .select("display count lastResults lastSearchedAt")
      .sort({ count: -1 })
      .limit(30)
      .lean(),
    BookAlertModel.aggregate([
      { $match: { status: "open" } },
      { $group: { _id: "$queryKey", query: { $last: "$query" }, people: { $sum: 1 }, since: { $min: "$createdAt" } } },
      { $sort: { people: -1, since: 1 } },
      { $limit: 50 },
    ]),
    Promise.all([
      SearchLogModel.estimatedDocumentCount(),
      BookAlertModel.countDocuments({ status: "open" }),
      BookAlertModel.countDocuments({ status: "notified" }),
    ]),
  ]);

  return {
    notFound,
    top,
    openAlerts: openAlerts.map((a) => ({ query: a.query, people: a.people, since: a.since })),
    totals: { distinctSearches: totals[0], openAlerts: totals[1], notifiedAlerts: totals[2] },
  };
};

export const searchService = { suggest, popular, logSearch, insights, queryKey };
