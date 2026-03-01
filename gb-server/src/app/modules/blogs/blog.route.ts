import express from "express";
import fs from "fs";
import { blogController } from "./blog.controller";
import { USER_ROLE } from "../user/user.interface";
import { imageUploader, upload } from "../../utils/imageUploader";
import { Auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { createBlogSchema, updateBlogSchema } from "./blog.validation";


const router = express.Router();

// ── Public Routes ─────────────────────────────────────────────────────────────

// Get all published blogs (with filters, search, pagination)
router.get("/", blogController.getAllBlogs);

// Get a blog by slug (SEO-friendly public URL)
router.get("/slug/:slug", blogController.getBlogBySlug);

// Get all blogs by a specific author
router.get("/author/:authorId", blogController.getBlogsByAuthor);

// ── Image Upload ──────────────────────────────────────────────────────────────

router.post(
  "/upload",
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  upload.single("image"),
  async (req, res): Promise<void> => {
    try {
      const imageName = req.file?.originalname;
      const path = req.file?.path;

      if (!imageName || !path) {
        res.status(400).json({ error: "Image file is required." });
        return;
      }

      const result = (await imageUploader(imageName, path)) as { secure_url: string };

      fs.unlink(path, (err) => {
        if (err) console.error("Failed to delete local file:", err);
      });

      res.status(200).json({ url: result?.secure_url });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  }
);

// ── Protected Routes (Admin / SuperAdmin) ─────────────────────────────────────

// Create a new blog post
router.post(
  "/create-blog",
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(createBlogSchema),
  blogController.createBlog
);

// Get single blog by ID (admin/editor)
router.get(
  "/:id",
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  blogController.getBlogById
);

// Update blog
router.patch(
  "/:id",
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(updateBlogSchema),
  blogController.updateBlog
);

// Publish a blog
router.patch(
  "/:id/publish",
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  blogController.publishBlog
);

// Archive a blog
router.patch(
  "/:id/archive",
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  blogController.archiveBlog
);

// Soft delete a blog
router.delete(
  "/:id",
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  blogController.deleteBlog
);

// ── Engagement Routes (Authenticated Users) ───────────────────────────────────

// Increment view count
router.patch("/:id/views", blogController.incrementViews);

// Toggle like
router.patch(
  "/:id/like",
  Auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  blogController.toggleLike
);

// Toggle save/bookmark
router.patch(
  "/:id/save",
  Auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  blogController.toggleSave
);

export const blogRoutes = router;