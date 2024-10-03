import { Request, Router } from "express";
import { otpControllers } from "./otp.controllers";

const router = Router();

router.post("/sent-otp", otpControllers.createOtp);
router.post("/verify-otp", otpControllers.verifyOtp);

export const otpRoutes = router;
