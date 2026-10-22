import httpStatus from "http-status";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { escapeRegex, pageMeta, pageParams, uniqueSlug } from "../../utils/content";
import { SuggestionModel, TSuggestion } from "./suggestion.model";
import { BCS_PRACTICE_SETS, practiceBody } from "./data/bcsPractice";

type SuggestionInput = Partial<
  Omit<TSuggestion, "author" | "views" | "downloads" | "isDeleted" | "publishedAt">
>;

const PUBLIC_FILTER = { status: "published", isDeleted: false };

// Old records have no `kind`; they are suggestions.
export const kindFilter = (kind: unknown) =>
  kind === "question" ? { kind: "question" } : { kind: { $ne: "question" } };
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

  clearHub();
  return SuggestionModel.create({
    ...payload,
    status,
    slug: await uniqueSlug(
      SuggestionModel,
      payload.slug ||
        [payload.kind === "question" ? payload.level : "", payload.examYear, payload.subjectCode, payload.title]
          .filter(Boolean)
          .join(" ")
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
  clearHub();
  return item;
};

const deleteSuggestion = async (id: string) => {
  const item = await getOrThrow(id);
  item.isDeleted = true;
  await item.save();
  clearHub();
  return null;
};

// ── Public ───────────────────────────────────────────────────────────────

const listPublished = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = pageParams(query, 12, 48);
  const filter: Record<string, unknown> = { ...PUBLIC_FILTER, ...kindFilter(query.kind) };

  for (const key of ["level", "subject", "program", "department", "academicYear", "institution", "examYear"] as const) {
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
const getFilters = async (kind?: unknown) => {
  const count = (field: string) =>
    SuggestionModel.aggregate([
      { $match: { ...PUBLIC_FILTER, ...kindFilter(kind), [field]: { $nin: [null, ""] } } },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 60 },
    ]).then((rows) => rows.map((row) => ({ name: row._id as string, count: row.count as number })));

  const [levels, subjects, departments, academicYears, institutions, examYears] = await Promise.all([
    count("level"),
    count("subject"),
    count("department"),
    count("academicYear"),
    count("institution"),
    count("examYear"),
  ]);
  return { levels, subjects, departments, academicYears, institutions, examYears };
};

const getPublishedBySlug = async (slug: string, kind?: unknown) => {
  const item = await SuggestionModel.findOneAndUpdate(
    { ...PUBLIC_FILTER, ...kindFilter(kind), slug },
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!item) throw new AppError(httpStatus.NOT_FOUND, "Suggestion not found");

  const related = await SuggestionModel.find({
    ...PUBLIC_FILTER,
    ...kindFilter(item.kind),
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

// Overview for the question bank / suggestions landing page: how many items
// each level has, the most-covered boards/universities/exams per level, the
// exam years available, and the newest items.
let hubCache: Record<string, { at: number; data: unknown }> = {};
const getHub = async (kind?: unknown) => {
  const key = kind === "question" ? "question" : "suggestion";
  const hit = hubCache[key];
  if (hit && Date.now() - hit.at < 5 * 60_000) return hit.data;
  const match = { ...PUBLIC_FILTER, ...kindFilter(kind) };
  const [levels, institutions, years, recent, total] = await Promise.all([
    SuggestionModel.aggregate([{ $match: match }, { $group: { _id: "$level", count: { $sum: 1 } } }]),
    SuggestionModel.aggregate([
      { $match: { ...match, institution: { $nin: [null, ""] } } },
      { $group: { _id: { level: "$level", institution: "$institution" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 60 },
    ]),
    SuggestionModel.aggregate([
      { $match: { ...match, examYear: { $nin: [null, ""] } } },
      { $group: { _id: "$examYear", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 20 },
    ]),
    SuggestionModel.find(match).select(LIST_FIELDS).sort({ publishedAt: -1 }).limit(6).lean(),
    SuggestionModel.countDocuments(match),
  ]);
  const data = {
    total,
    levels: levels.map((l) => ({ name: l._id as string, count: l.count as number })),
    institutions: institutions.map((i) => ({ level: i._id.level as string, name: i._id.institution as string, count: i.count as number })),
    years: years.map((y) => ({ name: y._id as string, count: y.count as number })),
    recent,
  };
  hubCache[key] = { at: Date.now(), data };
  return data;
};
const clearHub = () => {
  hubCache = {};
};

// Adds the team-written BCS preliminary practice sets (data/bcsPractice.ts)
// as drafts, so an admin reviews each one before publishing. Sets that
// already exist (same slug, even if edited or deleted) are left alone.
const importPractice = async (authorId: string) => {
  let added = 0;
  for (const set of BCS_PRACTICE_SETS) {
    if (await SuggestionModel.exists({ slug: set.slug })) continue;
    await SuggestionModel.create({
      kind: "suggestion",
      slug: set.slug,
      title: set.title,
      summary: set.summary,
      body: practiceBody(set),
      level: "Job Exam",
      subject: set.subject,
      institution: "বিসিএস প্রিলিমিনারি",
      preparedBy: "গ্রন্থবিলাস টিম",
      source: "গ্রন্থবিলাস টিমের তৈরি অনুশীলনী (বিগত সালের প্রশ্ন নয়)",
      tags: set.tags,
      status: "draft",
      author: authorId,
    });
    added++;
  }
  clearHub();
  return { added, total: BCS_PRACTICE_SETS.length, questions: BCS_PRACTICE_SETS.reduce((n, s) => n + s.questions.length, 0) };
};

// ── Admin ────────────────────────────────────────────────────────────────

const listForAdmin = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = pageParams(query, 20, 50);
  const filter: Record<string, unknown> = { isDeleted: false, ...kindFilter(query.kind) };
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
  getHub,
  importPractice,
};
