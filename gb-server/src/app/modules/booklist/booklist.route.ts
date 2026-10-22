import { Router } from "express";
import { Auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { USER_ROLE } from "../user/user.interface";
import { EXAM_LEVELS } from "../suggestion/suggestion.model";
import { bookListService } from "./booklist.service";
import { bookListValidations } from "./booklist.validation";

const router = Router();
const adminOnly = Auth(USER_ROLE.admin, USER_ROLE.superAdmin);

const ok = (res: Parameters<typeof sendResponse>[0], data: unknown, message: string, statusCode = 200) =>
  sendResponse(res, { statusCode, success: true, message, data });

// ── Public ───────────────────────────────────────────────────────────────

router.get("/", catchAsync(async (req, res) => ok(res, await bookListService.listPublished(req.query), "Book lists")));

router.get(
  "/filters",
  catchAsync(async (req, res) =>
    ok(res, { ...(await bookListService.getFilters(req.query)), allLevels: EXAM_LEVELS }, "Filters")
  )
);

router.get(
  "/slug/:slug",
  catchAsync(async (req, res) => ok(res, await bookListService.getPublishedBySlug(req.params.slug), "Book list"))
);

// ── Admin ────────────────────────────────────────────────────────────────

router.get(
  "/admin/all",
  adminOnly,
  catchAsync(async (req, res) => ok(res, await bookListService.listForAdmin(req.query), "Book lists"))
);

router.get(
  "/admin/:id",
  adminOnly,
  catchAsync(async (req, res) => ok(res, await bookListService.getForAdmin(req.params.id), "Book list"))
);

router.post(
  "/",
  adminOnly,
  validateRequest(bookListValidations.createSchema),
  catchAsync(async (req, res) => ok(res, await bookListService.create(req.body, req.user.id), "Book list created", 201))
);

router.patch(
  "/:id",
  adminOnly,
  validateRequest(bookListValidations.updateSchema),
  catchAsync(async (req, res) => ok(res, await bookListService.update(req.params.id, req.body), "Book list updated"))
);

router.delete(
  "/:id",
  adminOnly,
  catchAsync(async (req, res) => ok(res, await bookListService.remove(req.params.id), "Book list deleted"))
);

export const bookListRoutes = router;
