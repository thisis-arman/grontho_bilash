import { Schema, model, Types } from "mongoose";

export const BLOG_CATEGORIES = [
  "Book Review",
  "Study Tips",
  "Exam Preparation",
  "Career",
  "Student Life",
  "Guides",
  "Platform News",
] as const;

export type TBlogCategory = (typeof BLOG_CATEGORIES)[number];
export type TContentStatus = "draft" | "published";

export interface TBlog {
  title: string;
  slug: string;
  excerpt: string;
  // Markdown source. Rendered (and sanitised) by the client; raw HTML in it
  // is never rendered.
  content: string;
  coverImage?: string;
  category: TBlogCategory;
  tags: string[];
  // Only for book reviews.
  bookReview?: {
    bookTitle?: string;
    bookAuthor?: string;
    rating?: number;
  };
  author: Types.ObjectId;
  status: TContentStatus;
  publishedAt?: Date;
  readingTime: number;
  views: number;
  isDeleted: boolean;
}

const blogSchema = new Schema<TBlog>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, trim: true, maxlength: 300, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String },
    category: { type: String, enum: BLOG_CATEGORIES, required: true },
    tags: { type: [String], default: [] },
    bookReview: {
      bookTitle: { type: String, trim: true },
      bookAuthor: { type: String, trim: true },
      rating: { type: Number, min: 1, max: 5 },
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date },
    readingTime: { type: Number, default: 1 },
    views: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

blogSchema.index({ status: 1, isDeleted: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });

export const BlogModel = model<TBlog>("Blog", blogSchema);
