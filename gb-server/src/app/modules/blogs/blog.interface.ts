import { Types } from "mongoose";


export type TBlogCategory = "Book Review" | "Academic Tips" | "Platform News" | "User Story";

export type TBlogStatus = "Draft" | "Published" | "Archived";

export type TContentFormat = "html" | "markdown";


export interface TBlogSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
}


export interface TBlog {
  _id: Types.ObjectId;

  // Core content
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentFormat: TContentFormat;
  featuredImage: string;

  // Author
  author: Types.ObjectId;
  authorName?: string;

  // Categorization
  category: TBlogCategory;
  tags?: string[];

  // SEO
  seo?: TBlogSeo;

  // Engagement
  views: number;
  likes: Types.ObjectId[];
  savedBy: Types.ObjectId[];
  commentCount: number;

  // Related content
  relatedBooks?: Types.ObjectId[];
  relatedPosts?: Types.ObjectId[];

  // Computed
  readingTime?: number;

  // Lifecycle
  status: TBlogStatus;
  publishedAt?: Date;
  isDeleted: boolean;

  // Timestamps (added by mongoose)
  createdAt: Date;
  updatedAt: Date;
}

// ── Payload types (for create / update requests) ──────────────────────────────

export type TCreateBlogPayload = Omit<
  TBlog,
  | "_id"
  | "views"
  | "likes"
  | "savedBy"
  | "commentCount"
  | "readingTime"
  | "isDeleted"
  | "createdAt"
  | "updatedAt"
  | "publishedAt"
>;

export type TUpdateBlogPayload = Partial<TCreateBlogPayload>;

export interface TBlogListResponse {
  data: TBlog[];
  total: number;
  page: number;
  limit: number;
}

export interface TBlogResponse {
  data: TBlog;
  message: string;
}