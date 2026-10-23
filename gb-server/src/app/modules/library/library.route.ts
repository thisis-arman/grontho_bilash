import { Router } from "express";
import rateLimit from "express-rate-limit";
import { Auth } from "../../middlewares/auth";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { USER_ROLE } from "../user/user.interface";
import { libraryService } from "./library.service";

const router = Router();
const anyUser = Auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin);

// Each open signs fresh links; a person reading normally needs only a few.
const openLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "একটু পরে আবার চেষ্টা করো।" },
});

router.get(
  "/",
  anyUser,
  catchAsync(async (req, res) => {
    const data = await libraryService.getLibrary(String(req.user?.id));
    sendResponse(res, { statusCode: 200, success: true, message: "লাইব্রেরি", data });
  })
);

router.get(
  "/owned",
  anyUser,
  catchAsync(async (req, res) => {
    const data = await libraryService.getOwnedStatus(String(req.user?.id));
    sendResponse(res, { statusCode: 200, success: true, message: "লাইব্রেরি", data });
  })
);

router.get(
  "/:productId",
  anyUser,
  openLimiter,
  catchAsync(async (req, res) => {
    const data = await libraryService.openBook(req.params.productId, req.user ?? {});
    // Signed links must not end up in a shared cache.
    res.setHeader("Cache-Control", "private, no-store");
    sendResponse(res, { statusCode: 200, success: true, message: "বইটি খোলা হয়েছে", data });
  })
);

export const libraryRoutes = router;
