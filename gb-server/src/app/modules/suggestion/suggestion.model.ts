import { Schema, model, Types } from "mongoose";
import { TContentStatus } from "../blogs/blog.model";

export const EXAM_LEVELS = [
  "SSC",
  "HSC",
  "Honours",
  "Masters",
  "Admission Test",
  "Job Exam",
  "Other",
] as const;

export type TExamLevel = (typeof EXAM_LEVELS)[number];

// The same module holds two kinds of exam material: suggestions, and past
// question papers (the "question bank"). Records saved before `kind` existed
// are suggestions.
export const CONTENT_KINDS = ["suggestion", "question"] as const;
export type TContentKind = (typeof CONTENT_KINDS)[number];

export interface TAttachment {
  url: string;
  name: string;
  kind: "pdf" | "image";
  // Bytes, as reported by Cloudinary.
  size?: number;
}

export interface TSuggestion {
  kind: TContentKind;
  title: string;
  slug: string;
  summary: string;
  // Optional Markdown: the suggestion itself typed out (chapters, questions).
  body: string;
  attachments: TAttachment[];

  level: TExamLevel;
  subject: string;
  subjectCode?: string;
  program?: string; // e.g. BBA, BSc
  department?: string; // e.g. Accounting
  academicYear?: string; // e.g. 4th Year
  examYear?: string; // e.g. 2026
  institution?: string; // e.g. National University
  preparedBy?: string;
  tags: string[];

  author: Types.ObjectId;
  status: TContentStatus;
  publishedAt?: Date;
  views: number;
  downloads: number;
  isDeleted: boolean;
}

const attachmentSchema = new Schema<TAttachment>(
  {
    url: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    kind: { type: String, enum: ["pdf", "image"], required: true },
    size: { type: Number },
  },
  { _id: false }
);

const suggestionSchema = new Schema<TSuggestion>(
  {
    kind: { type: String, enum: CONTENT_KINDS, default: "suggestion" },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, trim: true, maxlength: 300, default: "" },
    body: { type: String, default: "" },
    attachments: { type: [attachmentSchema], default: [] },

    level: { type: String, enum: EXAM_LEVELS, required: true },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    subjectCode: { type: String, trim: true, maxlength: 30 },
    program: { type: String, trim: true, maxlength: 60 },
    department: { type: String, trim: true, maxlength: 80 },
    academicYear: { type: String, trim: true, maxlength: 40 },
    examYear: { type: String, trim: true, maxlength: 40 },
    institution: { type: String, trim: true, maxlength: 120 },
    preparedBy: { type: String, trim: true, maxlength: 80 },
    tags: { type: [String], default: [] },

    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

suggestionSchema.index({ status: 1, isDeleted: 1, publishedAt: -1 });
suggestionSchema.index({ level: 1, subject: 1 });
suggestionSchema.index({ kind: 1, status: 1, isDeleted: 1, publishedAt: -1 });

export const SuggestionModel = model<TSuggestion>("Suggestion", suggestionSchema);
