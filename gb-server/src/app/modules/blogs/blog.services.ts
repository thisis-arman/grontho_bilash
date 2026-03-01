import httpStatus from "http-status";
import { Document, Types } from "mongoose";
import AppError from "../../errors/AppError";
import { BlogModel } from "./blog.model";
import { TCreateBlogInput, TUpdateBlogInput, TBlogQueryInput } from "./blog.validation";

// ── Create ────────────────────────────────────────────────────────────────────

const createBlogIntoDb = async (blogInfo: TCreateBlogInput & { author: Types.ObjectId }): Promise<Document> => {
  // Ensure slug is unique
  const existingSlug = await BlogModel.findOne({ slug: blogInfo.slug, isDeleted: false });
  if (existingSlug) {
    throw new AppError(httpStatus.CONFLICT, "A blog with this slug already exists");
  }

  const blog = await BlogModel.create(blogInfo);
  return blog;
};

// ── Read ──────────────────────────────────────────────────────────────────────

const getAllBlogsFromDb = async (query: Partial<TBlogQueryInput>) => {
  const {
    page = 1,
    limit = 10,
    category,
    status = "Published",
    tag,
    search,
    sortBy = "publishedAt",
    sortOrder = "desc",
  } = query;

  const filter: Record<string, unknown> = { isDeleted: false, status };

  if (category) filter.category = category;
  if (tag) filter.tags = { $in: [tag] };
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const [blogs, total] = await Promise.all([
    BlogModel.find(filter)
      .populate("author", "name email")
      .select("-content") // exclude heavy content field from list view
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit),
    BlogModel.countDocuments(filter),
  ]);

  return {
    data: blogs,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getBlogBySlugFromDb = async (slug: string): Promise<Document> => {
  const blog = await BlogModel.findOne({ slug, isDeleted: false, status: "Published" })
    .populate("author", "name email")
    .populate("relatedBooks", "bookTitle price images")
    .populate("relatedPosts", "title slug featuredImage excerpt");

  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }

  return blog;
};

const getBlogByIdFromDb = async (id: string): Promise<Document> => {
  const blog = await BlogModel.findOne({ _id: id, isDeleted: false })
    .populate("author", "name email")
    .populate("relatedBooks", "bookTitle price images")
    .populate("relatedPosts", "title slug featuredImage excerpt");

  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }

  return blog;
};

const getBlogsByAuthorFromDb = async (authorId: string): Promise<Document[]> => {
  const blogs = await BlogModel.find({
    author: authorId,
    isDeleted: false,
    status: "Published",
  })
    .select("-content")
    .sort({ publishedAt: -1 });

  return blogs;
};

// ── Update ────────────────────────────────────────────────────────────────────

const updateBlogIntoDb = async (id: string, updateData: TUpdateBlogInput): Promise<Document> => {
  // If slug is being updated, check for conflicts
  if (updateData.slug) {
    const existingSlug = await BlogModel.findOne({
      slug: updateData.slug,
      isDeleted: false,
      _id: { $ne: id },
    });
    if (existingSlug) {
      throw new AppError(httpStatus.CONFLICT, "A blog with this slug already exists");
    }
  }

  const blog = await BlogModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    updateData,
    { new: true, runValidators: true }
  );

  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }

  return blog;
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────

const publishBlogIntoDb = async (id: string): Promise<Document> => {
  const blog = await BlogModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { status: "Published", publishedAt: new Date() },
    { new: true }
  );

  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }

  return blog;
};

const archiveBlogIntoDb = async (id: string): Promise<Document> => {
  const blog = await BlogModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { status: "Archived" },
    { new: true }
  );

  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }

  return blog;
};

const deleteBlogFromDb = async (id: string): Promise<Document> => {
  const blog = await BlogModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }

  return blog;
};

// ── Engagement ────────────────────────────────────────────────────────────────

const incrementBlogViews = async (id: string): Promise<Document> => {
  const blog = await BlogModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }

  return blog;
};

const toggleBlogLike = async (
  id: string,
  userId: Types.ObjectId
): Promise<{ liked: boolean; likeCount: number }> => {
  const blog = await BlogModel.findOne({ _id: id, isDeleted: false });

  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }

  const alreadyLiked = blog.likes.some(
    (likeId) => likeId.toString() === userId.toString()
  );

  const updatedBlog = await BlogModel.findByIdAndUpdate(
    id,
    alreadyLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } },
    { new: true }
  );

  return {
    liked: !alreadyLiked,
    likeCount: updatedBlog!.likes.length,
  };
};

const toggleBlogSave = async (
  id: string,
  userId: Types.ObjectId
): Promise<{ saved: boolean }> => {
  const blog = await BlogModel.findOne({ _id: id, isDeleted: false });

  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog not found");
  }

  const alreadySaved = blog.savedBy.some(
    (savedId) => savedId.toString() === userId.toString()
  );

  await BlogModel.findByIdAndUpdate(
    id,
    alreadySaved
      ? { $pull: { savedBy: userId } }
      : { $addToSet: { savedBy: userId } },
    { new: true }
  );

  return { saved: !alreadySaved };
};

export const blogServices = {
  createBlogIntoDb,
  getAllBlogsFromDb,
  getBlogBySlugFromDb,
  getBlogByIdFromDb,
  getBlogsByAuthorFromDb,
  updateBlogIntoDb,
  publishBlogIntoDb,
  archiveBlogIntoDb,
  deleteBlogFromDb,
  incrementBlogViews,
  toggleBlogLike,
  toggleBlogSave,
};