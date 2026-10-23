import { Router } from "express";
import { Auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { USER_ROLE } from "../user/user.interface";
import { BLOG_CATEGORIES } from "./blog.model";
import { blogService } from "./blog.service";
import { blogValidations } from "./blog.validation";

const router = Router();
const adminOnly = Auth(USER_ROLE.admin, USER_ROLE.superAdmin);

const ok = (res: Parameters<typeof sendResponse>[0], data: unknown, message: string, statusCode = 200) =>
  sendResponse(res, { statusCode, success: true, message, data });

// ── Public ───────────────────────────────────────────────────────────────

router.get(
  "/",
  catchAsync(async (req, res) => ok(res, await blogService.listPublished(req.query), "Posts fetched"))
);

router.get("/categories", (_req, res) => ok(res, BLOG_CATEGORIES, "Categories fetched"));

router.get(
  "/slug/:slug",
  catchAsync(async (req, res) => ok(res, await blogService.getPublishedBySlug(req.params.slug), "Post fetched"))
);

// ── Admin ────────────────────────────────────────────────────────────────

router.get(
  "/admin/all",
  adminOnly,
  catchAsync(async (req, res) => ok(res, await blogService.listForAdmin(req.query), "Posts fetched"))
);

router.get(
  "/admin/:id",
  adminOnly,
  catchAsync(async (req, res) => ok(res, await blogService.getForAdmin(req.params.id), "Post fetched"))
);

router.post(
  "/admin/import-guides",
  adminOnly,
  catchAsync(async (req, res) => ok(res, await blogService.importGuides(req.user.id), "Guides published", 201))
);

router.post(
  "/",
  adminOnly,
  validateRequest(blogValidations.createBlogSchema),
  catchAsync(async (req, res) =>
    ok(res, await blogService.createBlog(req.body, req.user.id), "Post created", 201)
  )
);

router.patch(
  "/:id",
  adminOnly,
  validateRequest(blogValidations.updateBlogSchema),
  catchAsync(async (req, res) => ok(res, await blogService.updateBlog(req.params.id, req.body), "Post updated"))
);

router.delete(
  "/:id",
  adminOnly,
  catchAsync(async (req, res) => ok(res, await blogService.deleteBlog(req.params.id), "Post deleted"))
);

export const blogRoutes = router;
