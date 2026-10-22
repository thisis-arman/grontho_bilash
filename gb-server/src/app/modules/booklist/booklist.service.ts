import httpStatus from "http-status";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { escapeRegex, pageMeta, pageParams, uniqueSlug } from "../../utils/content";
import { buildTextFilter } from "../../utils/searchText";
import { ProductModel } from "../book/product.model";
import { FOR_SALE } from "../search/search.service";
import { BookListModel, TBookList } from "./booklist.model";

type BookListInput = Partial<Omit<TBookList, "author" | "views" | "isDeleted" | "publishedAt">>;

const PUBLIC_FILTER = { status: "published", isDeleted: false };
const FILTER_KEYS = ["level", "institution", "program", "department", "academicYear"] as const;

const getOrThrow = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new AppError(httpStatus.BAD_REQUEST, "Invalid book list ID");
  const item = await BookListModel.findOne({ _id: id, isDeleted: false });
  if (!item) throw new AppError(httpStatus.NOT_FOUND, "Book list not found");
  return item;
};

const assertPublishable = (item: Partial<TBookList>) => {
  if (!item.books?.length) throw new AppError(httpStatus.BAD_REQUEST, "Add at least one book before publishing.");
};

const create = async (payload: BookListInput, authorId: string) => {
  const status = payload.status ?? "draft";
  if (status === "published") assertPublishable(payload);
  return BookListModel.create({
    ...payload,
    status,
    slug: await uniqueSlug(
      BookListModel,
      payload.slug || [payload.program, payload.department, payload.academicYear, payload.title].filter(Boolean).join(" ")
    ),
    publishedAt: status === "published" ? new Date() : undefined,
    author: authorId,
  });
};

const update = async (id: string, payload: BookListInput) => {
  const item = await getOrThrow(id);
  const next = { ...item.toObject(), ...payload };
  if (next.status === "published") assertPublishable(next);
  if (payload.slug && payload.slug !== item.slug) payload.slug = await uniqueSlug(BookListModel, payload.slug, id);
  Object.assign(item, payload);
  if (item.status === "published" && !item.publishedAt) item.publishedAt = new Date();
  await item.save();
  availabilityCache.delete(item.slug);
  return item;
};

const remove = async (id: string) => {
  const item = await getOrThrow(id);
  item.isDeleted = true;
  await item.save();
  return null;
};

// ── Public ───────────────────────────────────────────────────────────────

const listPublished = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = pageParams(query, 24, 60);
  const filter: Record<string, unknown> = { ...PUBLIC_FILTER };
  for (const key of FILTER_KEYS) if (query[key]) filter[key] = String(query[key]).slice(0, 120);

  const search = buildTextFilter(query.search, ["title", "program", "department", "institution", "books.title"]);
  if (search) Object.assign(filter, search);

  const [data, total] = await Promise.all([
    BookListModel.find(filter)
      .select("title slug description level institution program department academicYear session books.title")
      .sort({ level: 1, department: 1, academicYear: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BookListModel.countDocuments(filter),
  ]);
  return {
    data: data.map(({ books, ...rest }) => ({ ...rest, bookCount: books?.length ?? 0 })),
    meta: pageMeta(total, page, limit),
  };
};

// Values for the step-by-step picker, from what is actually published.
// Each step is narrowed by the choices made before it.
const getFilters = async (query: Record<string, unknown>) => {
  const match: Record<string, unknown> = { ...PUBLIC_FILTER };
  for (const key of FILTER_KEYS) if (query[key]) match[key] = String(query[key]).slice(0, 120);

  const values = (field: string) =>
    BookListModel.aggregate([
      { $match: { ...match, [field]: { $nin: [null, ""] } } },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 80 },
    ]).then((rows) => rows.map((r) => ({ name: r._id as string, count: r.count as number })));

  const [levels, institutions, programs, departments, academicYears] = await Promise.all(
    FILTER_KEYS.map((f) => values(f))
  );
  return { levels, institutions, programs, departments, academicYears };
};

// How many copies of each book are for sale right now, and the lowest price.
// Cached for a few minutes per list; one small query per book.
const availabilityCache = new Map<string, { at: number; data: { count: number; fromPrice: number | null }[] }>();
const AVAILABILITY_MS = 5 * 60_000;

const availabilityFor = async (slug: string, books: TBookList["books"]) => {
  const hit = availabilityCache.get(slug);
  if (hit && Date.now() - hit.at < AVAILABILITY_MS && hit.data.length === books.length) return hit.data;

  const data = await Promise.all(
    books.map(async (book) => {
      const filter = buildTextFilter(book.searchTerm || book.title, ["title"]);
      if (!filter) return { count: 0, fromPrice: null };
      const [row] = await ProductModel.aggregate([
        { $match: { ...FOR_SALE, ...filter } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            fromPrice: {
              $min: { $cond: [{ $gt: ["$price.discountPrice", 0] }, "$price.discountPrice", "$price.basePrice"] },
            },
          },
        },
      ]);
      return { count: row?.count ?? 0, fromPrice: row?.fromPrice ?? null };
    })
  );
  if (availabilityCache.size > 300) availabilityCache.clear();
  availabilityCache.set(slug, { at: Date.now(), data });
  return data;
};

const getPublishedBySlug = async (slug: string) => {
  const list = await BookListModel.findOneAndUpdate({ ...PUBLIC_FILTER, slug }, { $inc: { views: 1 } }, { new: true })
    .select("-author")
    .lean();
  if (!list) throw new AppError(httpStatus.NOT_FOUND, "বইয়ের তালিকাটি পাওয়া যায়নি");

  const availability = await availabilityFor(list.slug, list.books);
  const related = await BookListModel.find({
    ...PUBLIC_FILTER,
    _id: { $ne: list._id },
    level: list.level,
    ...(list.department ? { department: list.department } : {}),
  })
    .select("title slug academicYear department program")
    .sort({ academicYear: 1 })
    .limit(6)
    .lean();

  return {
    list: { ...list, books: list.books.map((book, i) => ({ ...book, ...availability[i] })) },
    related,
  };
};

// ── Admin ────────────────────────────────────────────────────────────────

const listForAdmin = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = pageParams(query, 20, 50);
  const filter: Record<string, unknown> = { isDeleted: false };
  if (query.status === "draft" || query.status === "published") filter.status = query.status;
  const search = String(query.search ?? "").trim().slice(0, 100);
  if (search) {
    const pattern = escapeRegex(search);
    filter.$or = ["title", "department", "program"].map((f) => ({ [f]: { $regex: pattern, $options: "i" } }));
  }
  const [data, total] = await Promise.all([
    BookListModel.find(filter).select("-books.note -books.searchTerm").sort({ updatedAt: -1 }).skip(skip).limit(limit),
    BookListModel.countDocuments(filter),
  ]);
  return { data, meta: pageMeta(total, page, limit) };
};

export const bookListService = {
  create,
  update,
  remove,
  listPublished,
  getFilters,
  getPublishedBySlug,
  listForAdmin,
  getForAdmin: getOrThrow,
};
