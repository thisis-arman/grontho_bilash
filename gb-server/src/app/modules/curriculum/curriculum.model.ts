import { Schema, model } from "mongoose";
import { TContentStatus } from "../blogs/blog.model";

// Course catalogue: one document per department of a program, with the
// courses of each year (e.g. National University › BBA (Honours) ›
// Accounting › 1st year). Used for the public "সিলেবাস ও কোর্স" pages, the
// course picker when listing a book, and search.

export interface TCourse {
  code?: string;
  title: string;
  marks?: number | null;
  credits?: number | null;
  group?: string; // e.g. "Group-A (Any Two)" for elective choices
}

export interface TCurriculumYear {
  year: number; // 1-5
  session?: string; // e.g. "2024-2025": the curriculum it belongs to
  syllabusUrl?: string; // official syllabus (PDF)
  publishedAt?: string; // as printed by the institution
  courses: TCourse[];
}

export interface TCurriculum {
  slug: string;
  institution: string; // "National University"
  institutionBn: string; // "জাতীয় বিশ্ববিদ্যালয়"
  level: string; // "Honours"
  program: string; // "BBA"
  programName: string; // "Bachelor of Business Administration (Honours)"
  programNameBn: string; // "বিবিএ (অনার্স)"
  department: string; // "Accounting"
  departmentBn: string; // "হিসাববিজ্ঞান"
  years: TCurriculumYear[];
  status: TContentStatus;
  isDeleted: boolean;
}

// Shape of the bundled dataset (data/nuHonours2024.ts).
export interface CurriculumSeed {
  source: string;
  institution: string;
  institutionBn: string;
  level: string;
  note: string;
  compiledAt: string;
  programs: Record<string, { name: string; nameBn: string }>;
  departments: {
    program: string;
    department: string;
    departmentBn: string;
    years: TCurriculumYear[];
  }[];
  extras: { kind: string; title: string; url: string; publishedAt?: string; program?: string | null; year?: number | null }[];
}

const courseSchema = new Schema<TCourse>(
  {
    code: { type: String, trim: true, maxlength: 20 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    marks: { type: Number, min: 0, max: 1000 },
    credits: { type: Number, min: 0, max: 30 },
    group: { type: String, trim: true, maxlength: 80 },
  },
  { _id: false }
);

const yearSchema = new Schema<TCurriculumYear>(
  {
    year: { type: Number, required: true, min: 1, max: 5 },
    session: { type: String, trim: true, maxlength: 20 },
    syllabusUrl: { type: String, trim: true, maxlength: 500 },
    publishedAt: { type: String, trim: true, maxlength: 40 },
    courses: { type: [courseSchema], default: [] },
  },
  { _id: false }
);

const curriculumSchema = new Schema<TCurriculum>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    institution: { type: String, required: true, trim: true, maxlength: 120 },
    institutionBn: { type: String, trim: true, maxlength: 120, default: "" },
    level: { type: String, required: true, trim: true, maxlength: 40 },
    program: { type: String, required: true, trim: true, maxlength: 20 },
    programName: { type: String, trim: true, maxlength: 120, default: "" },
    programNameBn: { type: String, trim: true, maxlength: 120, default: "" },
    department: { type: String, required: true, trim: true, maxlength: 120 },
    departmentBn: { type: String, trim: true, maxlength: 120, default: "" },
    years: { type: [yearSchema], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

curriculumSchema.index({ status: 1, isDeleted: 1, program: 1, department: 1 });

export const CurriculumModel = model<TCurriculum>("Curriculum", curriculumSchema);
