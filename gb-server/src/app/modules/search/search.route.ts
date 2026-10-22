import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { Auth } from "../../middlewares/auth";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { USER_ROLE } from "../user/user.interface";
import { searchService } from "./search.service";

const router = Router();

const limited = (max: number) =>
  rateLimit({
    windowMs: 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "অনেক বেশি অনুরোধ। একটু পরে আবার চেষ্টা করো।" },
  });

const querySchema = z.string().trim().max(100, "খোঁজার লেখা খুব বড়");

// Suggestions while typing. Generous limit: each keystroke can be a request.
router.get(
  "/suggest",
  limited(120),
  catchAsync(async (req, res) => {
    const q = querySchema.catch("").parse(req.query.q);
    res.set("Cache-Control", "public, max-age=60, s-maxage=60");
    sendResponse(res, { statusCode: 200, success: true, message: "Suggestions", data: await searchService.suggest(q) });
  })
);

router.get(
  "/popular",
  limited(60),
  catchAsync(async (_req, res) => {
    res.set("Cache-Control", "public, max-age=600, s-maxage=600");
    sendResponse(res, { statusCode: 200, success: true, message: "Popular searches", data: await searchService.popular() });
  })
);

// Called once per completed search on the shop page.
router.post(
  "/log",
  limited(30),
  catchAsync(async (req, res) => {
    const q = querySchema.parse(req.body?.q ?? "");
    sendResponse(res, { statusCode: 200, success: true, message: "Logged", data: await searchService.logSearch(q) });
  })
);

router.get(
  "/insights",
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  catchAsync(async (_req, res) => {
    sendResponse(res, { statusCode: 200, success: true, message: "Search insights", data: await searchService.insights() });
  })
);

export const searchRoutes = router;
