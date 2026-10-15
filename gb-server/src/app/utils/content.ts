import { Model } from "mongoose";
import slugify from "slugify";

// Helpers shared by the content modules (blog posts and exam suggestions).

export const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A readable, unique slug for a title. Bengali titles slugify to nothing,
// so a short random token keeps the URL valid; a numeric suffix resolves
// clashes ("my-post", "my-post-2", ...).
export const uniqueSlug = async (
  model: Model<any>,
  source: string,
  excludeId?: string
): Promise<string> => {
  const base =
    slugify(source, { lower: true, strict: true, trim: true }).slice(0, 80) ||
    `post-${Math.random().toString(36).slice(2, 8)}`;

  let candidate = base;
  for (let n = 2; ; n++) {
    const clash = await model.exists({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (!clash) return candidate;
    candidate = `${base}-${n}`;
  }
};

// Average adult reading speed; Markdown syntax is stripped first so links
// and image URLs don't inflate the count.
export const readingMinutes = (markdown = "") => {
  const words = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

// page/limit from a query string, clamped to sane bounds.
export const pageParams = (
  query: Record<string, unknown>,
  defaultLimit = 12,
  maxLimit = 48
) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(query.limit) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

export const pageMeta = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
