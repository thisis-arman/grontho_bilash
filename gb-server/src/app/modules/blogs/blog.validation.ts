import { z } from "zod";

// ── Reusable primitives ───────────────────────────────────────────────────────

const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

// ── Enums ─────────────────────────────────────────────────────────────────────

const BlogCategoryEnum = z.enum([
  "Book Review",
  "Academic Tips",
  "Platform News",
  "User Story",
]);

const BlogStatusEnum = z.enum(["Draft", "Published", "Archived"]);

const ContentFormatEnum = z.enum(["html", "markdown"]);

// ── SEO Sub-schema ────────────────────────────────────────────────────────────

const BlogSeoSchema = z.object({
  metaTitle: z
    .string()
    .max(60, "Meta title must be 60 characters or fewer")
    .optional(),
  metaDescription: z
    .string()
    .max(160, "Meta description must be 160 characters or fewer")
    .optional(),
  keywords: z.array(z.string().min(1)).max(20, "Too many keywords").optional(),
  canonicalUrl: z.string().url("Canonical URL must be a valid URL").optional(),
  ogImage: z.string().url("OG image must be a valid URL").optional(),
});

// ── Create Blog Schema ────────────────────────────────────────────────────────

export const createBlogSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "Title is required" })
      .min(5, "Title must be at least 5 characters")
      .max(150, "Title must be 150 characters or fewer")
      .trim(),

    slug: z
      .string({ required_error: "Slug is required" })
      .min(3, "Slug must be at least 3 characters")
      .max(200, "Slug must be 200 characters or fewer")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase letters, numbers, and hyphens only (e.g. my-blog-post)"
      ),

    excerpt: z
      .string({ required_error: "Excerpt is required" })
      .min(10, "Excerpt must be at least 10 characters")
      .max(300, "Excerpt must be 300 characters or fewer")
      .trim(),

    content: z
      .string({ required_error: "Content is required" })
      .min(50, "Content must be at least 50 characters"),

    contentFormat: ContentFormatEnum.default("html"),

    featuredImage: z
      .string({ required_error: "Featured image is required" })
      .url("Featured image must be a valid URL"),

    authorName: z.string().max(100).optional(),

    category: BlogCategoryEnum,

    tags: z
      .array(z.string().min(1).max(50))
      .max(10, "You can add up to 10 tags only")
      .optional(),

    seo: BlogSeoSchema.optional(),

    relatedBooks: z
      .array(mongoIdSchema)
      .max(5, "You can link up to 5 related books")
      .optional(),

    relatedPosts: z
      .array(mongoIdSchema)
      .max(5, "You can link up to 5 related posts")
      .optional(),

    status: BlogStatusEnum.default("Draft"),
  }),
});

// ── Update Blog Schema (all fields optional) ──────────────────────────────────

export const updateBlogSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .min(5, "Title must be at least 5 characters")
        .max(150, "Title must be 150 characters or fewer")
        .trim()
        .optional(),

      slug: z
        .string()
        .min(3)
        .max(200)
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Slug must be lowercase letters, numbers, and hyphens only"
        )
        .optional(),

      excerpt: z
        .string()
        .min(10)
        .max(300)
        .trim()
        .optional(),

      content: z.string().min(50).optional(),

      contentFormat: ContentFormatEnum.optional(),

      featuredImage: z.string().url("Featured image must be a valid URL").optional(),

      authorName: z.string().max(100).optional(),

      category: BlogCategoryEnum.optional(),

      tags: z.array(z.string().min(1).max(50)).max(10).optional(),

      seo: BlogSeoSchema.optional(),

      relatedBooks: z.array(mongoIdSchema).max(5).optional(),

      relatedPosts: z.array(mongoIdSchema).max(5).optional(),

      status: BlogStatusEnum.optional(),
    })
    .strict(), // reject unknown fields on update
});

// ── Query / Filter Schema (for GET /blogs) ────────────────────────────────────

export const blogQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, "Page must be a positive number"),

    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => val > 0 && val <= 50, "Limit must be between 1 and 50"),

    category: BlogCategoryEnum.optional(),

    status: BlogStatusEnum.optional(),

    tag: z.string().optional(),

    search: z.string().max(100).optional(),

    sortBy: z
      .enum(["publishedAt", "views", "createdAt", "likes"])
      .default("publishedAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

// ── Param Schema (for :id and :slug routes) ───────────────────────────────────

export const blogIdParamSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const blogSlugParamSchema = z.object({
  params: z.object({
    slug: z
      .string()
      .min(3)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Invalid slug format"
      ),
  }),
});


export type TCreateBlogInput  = z.infer<typeof createBlogSchema>["body"];
export type TUpdateBlogInput  = z.infer<typeof updateBlogSchema>["body"];
export type TBlogQueryInput   = z.infer<typeof blogQuerySchema>["query"];