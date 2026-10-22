import { Router } from "express";
import rateLimit from "express-rate-limit";
import { Auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { USER_ROLE } from "../user/user.interface";
import { EXAM_LEVELS } from "./suggestion.model";
import { suggestionService } from "./suggestion.service";
import { suggestionValidations } from "./suggestion.validation";

const router = Router();
const adminOnly = Auth(USER_ROLE.admin, USER_ROLE.superAdmin);

const ok = (res: Parameters<typeof sendResponse>[0], data: unknown, message: string, statusCode = 200) =>
  sendResponse(res, { statusCode, success: true, message, data });

// Keeps the public download counter from being inflated by a script.
const downloadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

// ── Public ───────────────────────────────────────────────────────────────

router.get(
  "/",
  catchAsync(async (req, res) => ok(res, await suggestionService.listPublished(req.query), "Suggestions fetched"))
);

router.get(
  "/filters",
  catchAsync(async (req, res) =>
    ok(res, { ...(await suggestionService.getFilters(req.query.kind)), allLevels: EXAM_LEVELS }, "Filters fetched")
  )
);

router.get(
  "/hub",
  catchAsync(async (req, res) => {
    res.set("Cache-Control", "public, max-age=120, s-maxage=300");
    ok(res, await suggestionService.getHub(req.query.kind), "Hub");
  })
);

router.get(
  "/slug/:slug",
  catchAsync(async (req, res) => ok(res, await suggestionService.getPublishedBySlug(req.params.slug, req.query.kind), "Suggestion fetched"))
);

router.post(
  "/slug/:slug/download",
  downloadLimiter,
  catchAsync(async (req, res) => ok(res, await suggestionService.recordDownload(req.params.slug), "Download recorded"))
);

// ── Admin ────────────────────────────────────────────────────────────────

router.get(
  "/admin/all",
  adminOnly,
  catchAsync(async (req, res) => ok(res, await suggestionService.listForAdmin(req.query), "Suggestions fetched"))
);

router.post(
  "/admin/import-practice",
  adminOnly,
  catchAsync(async (req, res) => ok(res, await suggestionService.importPractice(req.user.id), "Practice sets imported"))
);

router.get(
  "/admin/:id",
  adminOnly,
  catchAsync(async (req, res) => ok(res, await suggestionService.getForAdmin(req.params.id), "Suggestion fetched"))
);

router.post(
  "/",
  adminOnly,
  validateRequest(suggestionValidations.createSuggestionSchema),
  catchAsync(async (req, res) =>
    ok(res, await suggestionService.createSuggestion(req.body, req.user.id), "Suggestion created", 201)
  )
);

router.patch(
  "/:id",
  adminOnly,
  validateRequest(suggestionValidations.updateSuggestionSchema),
  catchAsync(async (req, res) =>
    ok(res, await suggestionService.updateSuggestion(req.params.id, req.body), "Suggestion updated")
  )
);

router.delete(
  "/:id",
  adminOnly,
  catchAsync(async (req, res) => ok(res, await suggestionService.deleteSuggestion(req.params.id), "Suggestion deleted"))
);

export const suggestionRoutes = router;
