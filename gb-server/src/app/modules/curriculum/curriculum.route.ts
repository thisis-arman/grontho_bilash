import { Router } from "express";
import rateLimit from "express-rate-limit";
import { Auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { USER_ROLE } from "../user/user.interface";
import { curriculumService } from "./curriculum.service";
import { curriculumValidations } from "./curriculum.validation";

const router = Router();
const adminOnly = Auth(USER_ROLE.admin, USER_ROLE.superAdmin);

const ok = (res: Parameters<typeof sendResponse>[0], data: unknown, message: string, statusCode = 200) =>
  sendResponse(res, { statusCode, success: true, message, data });

const searchLimiter = rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false });

// ── Public ───────────────────────────────────────────────────────────────

router.get(
  "/",
  catchAsync(async (_req, res) => {
    res.set("Cache-Control", "public, max-age=300, s-maxage=300");
    ok(res, await curriculumService.listPublished(), "Departments");
  })
);

router.get(
  "/official-links",
  catchAsync(async (_req, res) => {
    res.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    ok(res, curriculumService.officialLinks(), "Official links");
  })
);

router.get(
  "/courses",
  searchLimiter,
  catchAsync(async (req, res) => ok(res, await curriculumService.searchCourses(req.query.q), "Courses"))
);

router.get(
  "/slug/:slug",
  catchAsync(async (req, res) => {
    res.set("Cache-Control", "public, max-age=300, s-maxage=300");
    ok(res, await curriculumService.getBySlug(req.params.slug), "Department");
  })
);

// ── Admin ────────────────────────────────────────────────────────────────

router.get("/admin/all", adminOnly, catchAsync(async (_req, res) => ok(res, await curriculumService.listForAdmin(), "Departments")));

router.post(
  "/admin/import-nu-honours",
  adminOnly,
  catchAsync(async (_req, res) => ok(res, await curriculumService.importNuHonours(), "Imported"))
);

router.get("/admin/:id", adminOnly, catchAsync(async (req, res) => ok(res, await curriculumService.getForAdmin(req.params.id), "Department")));

router.post(
  "/",
  adminOnly,
  validateRequest(curriculumValidations.createSchema),
  catchAsync(async (req, res) => ok(res, await curriculumService.create(req.body), "Department created", 201))
);

router.patch(
  "/:id",
  adminOnly,
  validateRequest(curriculumValidations.updateSchema),
  catchAsync(async (req, res) => ok(res, await curriculumService.update(req.params.id, req.body), "Department updated"))
);

router.delete("/:id", adminOnly, catchAsync(async (req, res) => ok(res, await curriculumService.remove(req.params.id), "Department deleted")));

export const curriculumRoutes = router;
