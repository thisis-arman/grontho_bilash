import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { blogServices } from "./blog.services";

// Create a new blog post
const createBlog = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user._id; // from Auth middleware
  const result = await blogServices.createBlogIntoDb({ ...req.body, author: authorId });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Blog created successfully",
    data: result,
  });
});

// Get all blogs (with filters, pagination, search)
const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const result = await blogServices.getAllBlogsFromDb(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blogs fetched successfully",
    data: result,
  });
});

// Get single blog by slug (public-facing)
const getBlogBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const result = await blogServices.getBlogBySlugFromDb(slug);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blog fetched successfully",
    data: result,
  });
});

// Get single blog by ID (admin/editor use)
const getBlogById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await blogServices.getBlogByIdFromDb(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blog fetched successfully",
    data: result,
  });
});

// Get all blogs by a specific author
const getBlogsByAuthor = catchAsync(async (req: Request, res: Response) => {
  const { authorId } = req.params;
  const result = await blogServices.getBlogsByAuthorFromDb(authorId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Author blogs fetched successfully",
    data: result,
  });
});

// Update blog
const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await blogServices.updateBlogIntoDb(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blog updated successfully",
    data: result,
  });
});

// Publish blog (change status to Published)
const publishBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await blogServices.publishBlogIntoDb(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blog published successfully",
    data: result,
  });
});

// Archive blog
const archiveBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await blogServices.archiveBlogIntoDb(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blog archived successfully",
    data: result,
  });
});

// Soft delete blog
const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await blogServices.deleteBlogFromDb(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blog deleted successfully",
    data: result,
  });
});

// Increment view count
const incrementViews = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await blogServices.incrementBlogViews(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "View count updated",
    data: result,
  });
});

// Toggle like on a blog
const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user._id;
  const result = await blogServices.toggleBlogLike(id, userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.liked ? "Blog liked" : "Blog unliked",
    data: result,
  });
});

// Toggle save/bookmark on a blog
const toggleSave = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user._id;
  const result = await blogServices.toggleBlogSave(id, userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.saved ? "Blog saved" : "Blog unsaved",
    data: result,
  });
});

export const blogController = {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  getBlogById,
  getBlogsByAuthor,
  updateBlog,
  publishBlog,
  archiveBlog,
  deleteBlog,
  incrementViews,
  toggleLike,
  toggleSave,
};