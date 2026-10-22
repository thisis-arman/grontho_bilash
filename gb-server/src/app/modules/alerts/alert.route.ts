import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { Auth } from "../../middlewares/auth";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { USER_ROLE } from "../user/user.interface";
import { alertService } from "./alert.service";

const router = Router();
const anyUser = Auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin);

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "অনেক বেশি অনুরোধ। কিছুক্ষণ পরে আবার চেষ্টা করো।" },
});

const createSchema = z.object({
  query: z.string().trim().min(3, "বইয়ের নাম আরেকটু লিখে দাও (অন্তত ৩ অক্ষর)।").max(100, "নামটা খুব বড়"),
});

router.post(
  "/",
  anyUser,
  createLimiter,
  catchAsync(async (req, res) => {
    const { query } = createSchema.parse(req.body);
    const result = await alertService.createAlert(req.user.id, query);
    sendResponse(res, {
      statusCode: result.alert ? 201 : 200,
      success: true,
      message: result.alreadyAvailable ? "বইটি এখনই পাওয়া যাচ্ছে" : "বইটি পাওয়া গেলে তোমাকে জানানো হবে",
      data: result,
    });
  })
);

router.get(
  "/mine",
  anyUser,
  catchAsync(async (req, res) => {
    sendResponse(res, { statusCode: 200, success: true, message: "Alerts", data: await alertService.myAlerts(req.user.id) });
  })
);

router.delete(
  "/:id",
  anyUser,
  catchAsync(async (req, res) => {
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "খোঁজটি মুছে ফেলা হয়েছে",
      data: await alertService.cancelAlert(req.user.id, req.params.id),
    });
  })
);

export const alertRoutes = router;
