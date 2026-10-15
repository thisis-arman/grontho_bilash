import httpStatus from "http-status";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { escapeRegex, pageMeta, pageParams, readingMinutes, uniqueSlug } from "../../utils/content";
import { BlogModel, TBlog } from "./blog.model";

type BlogInput = Partial<Omit<TBlog, "author" | "views" | "isDeleted" | "readingTime" | "publishedAt">>;

const AUTHOR_FIELDS = "name";
const LIST_FIELDS = "-content";

const assertPublishable = (blog: Partial<TBlog>) => {
  const missing: string[] = [];
  if (!blog.coverImage) missing.push("a cover image");
  if (!blog.excerpt) missing.push("a short summary");
  if (!blog.content || blog.content.trim().length < 50) missing.push("at least a few sentences of content");
  if (missing.length) {
    throw new AppError(httpStatus.BAD_REQUEST, `To publish, add ${missing.join(", ")}.`);
  }
};

const getOwnedOrThrow = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new AppError(httpStatus.BAD_REQUEST, "Invalid post ID");
  const blog = await BlogModel.findOne({ _id: id, isDeleted: false });
  if (!blog) throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  return blog;
};

const createBlog = async (payload: BlogInput, authorId: string) => {
  const status = payload.status ?? "draft";
  if (status === "published") assertPublishable(payload);

  return BlogModel.create({
    ...payload,
    status,
    slug: await uniqueSlug(BlogModel, payload.slug || payload.title || "post"),
    readingTime: readingMinutes(payload.content),
    publishedAt: status === "published" ? new Date() : undefined,
    author: authorId,
  });
};

const updateBlog = async (id: string, payload: BlogInput) => {
  const blog = await getOwnedOrThrow(id);
  const next = { ...blog.toObject(), ...payload };

  if (next.status === "published") assertPublishable(next);

  if (payload.slug && payload.slug !== blog.slug) {
    payload.slug = await uniqueSlug(BlogModel, payload.slug, id);
  }

  Object.assign(blog, payload);
  if (payload.content !== undefined) blog.readingTime = readingMinutes(payload.content);
  // First publish sets the date; later edits keep it so the post does not
  // jump back to the top of the list.
  if (blog.status === "published" && !blog.publishedAt) blog.publishedAt = new Date();

  await blog.save();
  return blog;
};

const deleteBlog = async (id: string) => {
  const blog = await getOwnedOrThrow(id);
  blog.isDeleted = true;
  await blog.save();
  return null;
};

// ── Public ───────────────────────────────────────────────────────────────

const listPublished = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = pageParams(query, 9, 30);
  const filter: Record<string, unknown> = { status: "published", isDeleted: false };

  if (query.category) filter.category = String(query.category);
  if (query.tag) filter.tags = String(query.tag).toLowerCase();
  const search = String(query.search ?? "").trim().slice(0, 100);
  if (search) {
    const pattern = escapeRegex(search);
    filter.$or = [
      { title: { $regex: pattern, $options: "i" } },
      { excerpt: { $regex: pattern, $options: "i" } },
      { tags: { $regex: pattern, $options: "i" } },
      { "bookReview.bookTitle": { $regex: pattern, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    BlogModel.find(filter)
      .select(LIST_FIELDS)
      .populate("author", AUTHOR_FIELDS)
      .sort({ publishedAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit),
    BlogModel.countDocuments(filter),
  ]);

  return { data, meta: pageMeta(total, page, limit) };
};

const getPublishedBySlug = async (slug: string) => {
  const blog = await BlogModel.findOneAndUpdate(
    { slug, status: "published", isDeleted: false },
    { $inc: { views: 1 } },
    { new: true }
  ).populate("author", AUTHOR_FIELDS);

  if (!blog) throw new AppError(httpStatus.NOT_FOUND, "Post not found");

  const related = await BlogModel.find({
    _id: { $ne: blog._id },
    category: blog.category,
    status: "published",
    isDeleted: false,
  })
    .select(LIST_FIELDS)
    .sort({ publishedAt: -1 })
    .limit(3);

  return { post: blog, related };
};

// ── Admin ────────────────────────────────────────────────────────────────

const listForAdmin = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = pageParams(query, 20, 50);
  const filter: Record<string, unknown> = { isDeleted: false };
  if (query.status === "draft" || query.status === "published") filter.status = query.status;
  const search = String(query.search ?? "").trim().slice(0, 100);
  if (search) filter.title = { $regex: escapeRegex(search), $options: "i" };

  const [data, total] = await Promise.all([
    BlogModel.find(filter)
      .select(LIST_FIELDS)
      .populate("author", AUTHOR_FIELDS)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    BlogModel.countDocuments(filter),
  ]);
  return { data, meta: pageMeta(total, page, limit) };
};

const getForAdmin = (id: string) => getOwnedOrThrow(id);

export const blogService = {
  createBlog,
  updateBlog,
  deleteBlog,
  listPublished,
  getPublishedBySlug,
  listForAdmin,
  getForAdmin,
};
