import httpStatus from "http-status";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { escapeRegex, pageMeta, pageParams, uniqueSlug } from "../../utils/content";
import { SuggestionModel, TSuggestion } from "./suggestion.model";

type SuggestionInput = Partial<
  Omit<TSuggestion, "author" | "views" | "downloads" | "isDeleted" | "publishedAt">
>;

const PUBLIC_FILTER = { status: "published", isDeleted: false };
const LIST_FIELDS = "-body";

const assertPublishable = (item: Partial<TSuggestion>) => {
  const hasText = (item.body ?? "").trim().length >= 20;
  const hasFiles = (item.attachments ?? []).length > 0;
  if (!hasText && !hasFiles) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "To publish, add the suggestion text or attach at least one file."
    );
  }
};

const getOrThrow = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new AppError(httpStatus.BAD_REQUEST, "Invalid suggestion ID");
  const item = await SuggestionModel.findOne({ _id: id, isDeleted: false });
  if (!item) throw new AppError(httpStatus.NOT_FOUND, "Suggestion not found");
  return item;
};

const createSuggestion = async (payload: SuggestionInput, authorId: string) => {
  const status = payload.status ?? "draft";
  if (status === "published") assertPublishable(payload);

  return SuggestionModel.create({
    ...payload,
    status,
    slug: await uniqueSlug(
      SuggestionModel,
      payload.slug || [payload.subjectCode, payload.title].filter(Boolean).join(" ")
    ),
    publishedAt: status === "published" ? new Date() : undefined,
    author: authorId,
  });
};

const updateSuggestion = async (id: string, payload: SuggestionInput) => {
  const item = await getOrThrow(id);
  const next = { ...item.toObject(), ...payload };
  if (next.status === "published") assertPublishable(next);

  if (payload.slug && payload.slug !== item.slug) {
    payload.slug = await uniqueSlug(SuggestionModel, payload.slug, id);
  }

  Object.assign(item, payload);
  if (item.status === "published" && !item.publishedAt) item.publishedAt = new Date();
  await item.save();
  return item;
};

const deleteSuggestion = async (id: string) => {
  const item = await getOrThrow(id);
  item.isDeleted = true;
  await item.save();
  return null;
};

// ── Public ───────────────────────────────────────────────────────────────

const listPublished = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = pageParams(query, 12, 48);
  const filter: Record<string, unknown> = { ...PUBLIC_FILTER };

  for (const key of ["level", "subject", "program", "department", "academicYear"] as const) {
    if (query[key]) filter[key] = String(query[key]);
  }
  if (query.hasFiles === "true") filter["attachments.0"] = { $exists: true };

  const search = String(query.search ?? "").trim().slice(0, 100);
  if (search) {
    const pattern = escapeRegex(search);
    filter.$or = ["title", "subject", "subjectCode", "department", "program", "institution", "tags"].map(
      (field) => ({ [field]: { $regex: pattern, $options: "i" } })
    );
  }

  const sort: Record<string, 1 | -1> =
    query.sort === "popular" ? { views: -1, _id: -1 } : { publishedAt: -1, _id: -1 };

  const [data, total] = await Promise.all([
    SuggestionModel.find(filter).select(LIST_FIELDS).sort(sort).skip(skip).limit(limit),
    SuggestionModel.countDocuments(filter),
  ]);
  return { data, meta: pageMeta(total, page, limit) };
};

// Values the filters can offer, from what is actually published.
const getFilters = async () => {
  const count = (field: string) =>
    SuggestionModel.aggregate([
      { $match: { ...PUBLIC_FILTER, [field]: { $nin: [null, ""] } } },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 60 },
    ]).then((rows) => rows.map((row) => ({ name: row._id as string, count: row.count as number })));

  const [levels, subjects, departments, academicYears] = await Promise.all([
    count("level"),
    count("subject"),
    count("department"),
    count("academicYear"),
  ]);
  return { levels, subjects, departments, academicYears };
};

const getPublishedBySlug = async (slug: string) => {
  const item = await SuggestionModel.findOneAndUpdate(
    { ...PUBLIC_FILTER, slug },
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!item) throw new AppError(httpStatus.NOT_FOUND, "Suggestion not found");

  const related = await SuggestionModel.find({
    ...PUBLIC_FILTER,
    _id: { $ne: item._id },
    level: item.level,
    ...(item.department ? { department: item.department } : { subject: item.subject }),
  })
    .select(LIST_FIELDS)
    .sort({ publishedAt: -1 })
    .limit(4);

  return { suggestion: item, related };
};

const recordDownload = async (slug: string) => {
  await SuggestionModel.updateOne({ ...PUBLIC_FILTER, slug }, { $inc: { downloads: 1 } });
  return null;
};

// ── Admin ────────────────────────────────────────────────────────────────

const listForAdmin = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = pageParams(query, 20, 50);
  const filter: Record<string, unknown> = { isDeleted: false };
  if (query.status === "draft" || query.status === "published") filter.status = query.status;
  const search = String(query.search ?? "").trim().slice(0, 100);
  if (search) {
    const pattern = escapeRegex(search);
    filter.$or = [{ title: { $regex: pattern, $options: "i" } }, { subject: { $regex: pattern, $options: "i" } }];
  }

  const [data, total] = await Promise.all([
    SuggestionModel.find(filter).select(LIST_FIELDS).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    SuggestionModel.countDocuments(filter),
  ]);
  return { data, meta: pageMeta(total, page, limit) };
};

export const suggestionService = {
  createSuggestion,
  updateSuggestion,
  deleteSuggestion,
  listPublished,
  getFilters,
  getPublishedBySlug,
  recordDownload,
  listForAdmin,
  getForAdmin: getOrThrow,
};
