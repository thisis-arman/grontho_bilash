import httpStatus from "http-status";
import { Types } from "mongoose";
import slugify from "slugify";
import AppError from "../../errors/AppError";
import { escapeRegex } from "../../utils/content";
import { normalizeQuery } from "../../utils/searchText";
import { CurriculumModel, TCurriculum, TCurriculumYear } from "./curriculum.model";
import nuHonours2024 from "./data/nuHonours2024";

type CurriculumInput = Partial<Omit<TCurriculum, "slug" | "isDeleted">>;

const PUBLIC_FILTER = { status: "published", isDeleted: false };

const makeSlug = (c: { institution: string; level: string; program: string; department: string }) => {
  const short = /national university/i.test(c.institution) ? "nu" : c.institution;
  return slugify(`${short} ${c.level} ${c.program} ${c.department}`, { lower: true, strict: true }).slice(0, 90);
};

const sortYears = (years: TCurriculumYear[] = []) => [...years].sort((a, b) => a.year - b.year);

const getOrThrow = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new AppError(httpStatus.BAD_REQUEST, "Invalid ID");
  const doc = await CurriculumModel.findOne({ _id: id, isDeleted: false });
  if (!doc) throw new AppError(httpStatus.NOT_FOUND, "Department not found");
  return doc;
};

// Small cache: the catalogue changes rarely and is read on many pages.
let listCache: { at: number; data: unknown } | null = null;
const LIST_MS = 5 * 60_000;
const clearCache = () => {
  listCache = null;
};

// ── Public ───────────────────────────────────────────────────────────────

// Every published department, without the course lists (small payload).
const listPublished = async () => {
  if (listCache && Date.now() - listCache.at < LIST_MS) return listCache.data;
  const docs = await CurriculumModel.find(PUBLIC_FILTER)
    .select("slug institution institutionBn level program programName programNameBn department departmentBn years.year years.session years.courses.code")
    .sort({ program: 1, department: 1 })
    .lean();
  const data = docs.map(({ years, ...d }) => ({
    ...d,
    years: sortYears(years).map((y) => ({ year: y.year, session: y.session, courseCount: y.courses?.length ?? 0 })),
  }));
  listCache = { at: Date.now(), data };
  return data;
};

const getBySlug = async (slug: string) => {
  const doc = await CurriculumModel.findOne({ ...PUBLIC_FILTER, slug }).lean();
  if (!doc) throw new AppError(httpStatus.NOT_FOUND, "বিভাগটি পাওয়া যায়নি");
  return { ...doc, years: sortYears(doc.years) };
};

// Courses matching a code or title, for the course picker and site search.
const searchCourses = async (raw: unknown, limit = 20) => {
  const q = normalizeQuery(raw);
  if (q.length < 2) return [];
  const pattern = escapeRegex(q);
  const docs = await CurriculumModel.find({
    ...PUBLIC_FILTER,
    $or: [
      { "years.courses.title": { $regex: pattern, $options: "i" } },
      { "years.courses.code": { $regex: `^${pattern}` } },
      { department: { $regex: pattern, $options: "i" } },
      { departmentBn: { $regex: pattern, $options: "i" } },
    ],
  })
    .select("slug program department departmentBn years")
    .limit(40)
    .lean();

  const lower = q.toLowerCase();
  const out: { code?: string; title: string; year: number; program: string; department: string; departmentBn: string; slug: string }[] = [];
  const seen = new Set<string>();
  for (const d of docs) {
    for (const y of d.years) {
      for (const c of y.courses) {
        const hit = c.title.toLowerCase().includes(lower) || (c.code ?? "").startsWith(q);
        const key = `${c.code ?? c.title}|${d.slug}`;
        if (!hit || seen.has(key)) continue;
        seen.add(key);
        out.push({ code: c.code, title: c.title, year: y.year, program: d.program, department: d.department, departmentBn: d.departmentBn, slug: d.slug });
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
};

// ── Admin ────────────────────────────────────────────────────────────────

const listForAdmin = () =>
  CurriculumModel.find({ isDeleted: false })
    .select("slug institution level program department departmentBn status years.year years.courses.code updatedAt")
    .sort({ program: 1, department: 1 })
    .lean();

const create = async (payload: CurriculumInput) => {
  const base = {
    institution: payload.institution ?? "National University",
    level: payload.level ?? "Honours",
    program: payload.program ?? "",
    department: payload.department ?? "",
  };
  const slug = makeSlug(base);
  if (await CurriculumModel.exists({ slug, isDeleted: false })) {
    throw new AppError(httpStatus.CONFLICT, "This department already exists for this program.");
  }
  // A soft-deleted department with the same slug is revived instead.
  await CurriculumModel.deleteOne({ slug, isDeleted: true });
  const doc = await CurriculumModel.create({ ...payload, ...base, slug, years: sortYears(payload.years) });
  clearCache();
  return doc;
};

const update = async (id: string, payload: CurriculumInput) => {
  const doc = await getOrThrow(id);
  Object.assign(doc, payload);
  if (payload.years) doc.years = sortYears(payload.years);
  await doc.save();
  clearCache();
  return doc;
};

const remove = async (id: string) => {
  const doc = await getOrThrow(id);
  doc.isDeleted = true;
  await doc.save();
  clearCache();
  return null;
};

// Adds the bundled National University Honours catalogue (new curriculum,
// session 2024-2025). Only adds what is missing: departments that do not
// exist yet, and years a department does not have yet. Nothing the team has
// edited is overwritten.
const importNuHonours = async () => {
  const seed = nuHonours2024;
  let departmentsAdded = 0;
  let yearsAdded = 0;
  for (const d of seed.departments) {
    const program = seed.programs[d.program];
    const base = { institution: seed.institution, level: seed.level, program: d.program, department: d.department };
    const slug = makeSlug(base);
    const existing = await CurriculumModel.findOne({ slug, isDeleted: false });
    if (!existing) {
      await CurriculumModel.deleteOne({ slug, isDeleted: true });
      await CurriculumModel.create({
        ...base,
        slug,
        institutionBn: seed.institutionBn,
        programName: program?.name ?? "",
        programNameBn: program?.nameBn ?? "",
        departmentBn: d.departmentBn,
        years: sortYears(d.years),
        status: "published",
      });
      departmentsAdded++;
      yearsAdded += d.years.length;
      continue;
    }
    const missing = d.years.filter((y) => !existing.years.some((e) => e.year === y.year));
    if (missing.length) {
      existing.years = sortYears([...existing.years, ...missing]);
      await existing.save();
      yearsAdded += missing.length;
    }
  }
  clearCache();
  return { departmentsAdded, yearsAdded, departmentsInDataset: seed.departments.length, source: seed.source };
};

// Official downloads that come with the dataset (sample questions,
// compulsory-course syllabi).
const officialLinks = () => ({ source: nuHonours2024.source, note: nuHonours2024.note, extras: nuHonours2024.extras });

export const curriculumService = {
  listPublished,
  getBySlug,
  searchCourses,
  listForAdmin,
  getForAdmin: getOrThrow,
  create,
  update,
  remove,
  importNuHonours,
  officialLinks,
};
