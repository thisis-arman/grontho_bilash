import { Request, Router } from "express";
import { otpControllers } from "./otp.controllers";

const router = Router();

router.post("/otp/create", otpControllers.createOtp); // Route for creating OTP
router.get("/otp/verify", otpControllers.createOtp); // Route for verifying OTP

export default router;
