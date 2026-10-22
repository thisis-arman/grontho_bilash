import { Schema, Types, model } from "mongoose";
import { TContentStatus } from "../blogs/blog.model";
import { EXAM_LEVELS, TExamLevel } from "../suggestion/suggestion.model";

// "Which books do I need?" A curated list of the books for one class,
// program or exam, e.g. National University › BBA › Accounting › 2nd year.
export interface TBookListItem {
  title: string;
  author?: string;
  note?: string; // e.g. "যেকোনো একটি লেখকের বই হলেই চলবে"
  optional?: boolean; // reference / extra reading
  searchTerm?: string; // what to search the shop for, if not the title
}

export interface TBookList {
  title: string;
  slug: string;
  description: string;
  level: TExamLevel;
  institution?: string; // জাতীয় বিশ্ববিদ্যালয়, ঢাকা বোর্ড, ...
  program?: string; // BBA, BSc, বিজ্ঞান বিভাগ
  department?: string; // হিসাববিজ্ঞান
  academicYear?: string; // ২য় বর্ষ
  session?: string; // 2023-24
  books: TBookListItem[];
  author: Types.ObjectId;
  status: TContentStatus;
  publishedAt?: Date;
  views: number;
  isDeleted: boolean;
}

const itemSchema = new Schema<TBookListItem>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    author: { type: String, trim: true, maxlength: 120 },
    note: { type: String, trim: true, maxlength: 200 },
    optional: { type: Boolean, default: false },
    searchTerm: { type: String, trim: true, maxlength: 100 },
  },
  { _id: false }
);

const bookListSchema = new Schema<TBookList>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    level: { type: String, enum: EXAM_LEVELS, required: true },
    institution: { type: String, trim: true, maxlength: 120 },
    program: { type: String, trim: true, maxlength: 60 },
    department: { type: String, trim: true, maxlength: 80 },
    academicYear: { type: String, trim: true, maxlength: 40 },
    session: { type: String, trim: true, maxlength: 20 },
    books: { type: [itemSchema], default: [] },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: Date,
    views: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookListSchema.index({ status: 1, isDeleted: 1, level: 1, department: 1, academicYear: 1 });

export const BookListModel = model<TBookList>("BookList", bookListSchema);
