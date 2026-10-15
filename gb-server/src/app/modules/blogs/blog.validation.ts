import { z } from "zod";
import { BLOG_CATEGORIES } from "./blog.model";

const httpsUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .refine((value) => value.startsWith("https://"), "Must be an https:// URL");

const tags = z
  .array(z.string().trim().toLowerCase().min(1).max(30))
  .max(10, "Use at most 10 tags")
  .transform((list) => Array.from(new Set(list)));

// Fields shared by create and update. Publishing rules (cover image, body)
// are checked in the service, because they depend on the final status.
const blogFields = {
  title: z.string().trim().min(3, "Title is too short").max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes")
    .max(90)
    .optional(),
  excerpt: z.string().trim().max(300).optional(),
  content: z.string().max(100_000, "The post is too long").optional(),
  coverImage: httpsUrl.optional().or(z.literal("")),
  category: z.enum(BLOG_CATEGORIES),
  tags: tags.optional(),
  bookReview: z
    .object({
      bookTitle: z.string().trim().max(160).optional(),
      bookAuthor: z.string().trim().max(120).optional(),
      rating: z.number().int().min(1).max(5).optional(),
    })
    .optional(),
  status: z.enum(["draft", "published"]).optional(),
};

const createBlogSchema = z.object(blogFields);
const updateBlogSchema = z.object(blogFields).partial();

export const blogValidations = { createBlogSchema, updateBlogSchema };
