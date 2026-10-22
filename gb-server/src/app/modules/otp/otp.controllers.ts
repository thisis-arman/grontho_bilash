// otp.controllers.ts
import httpStatus from "http-status";
import { z } from "zod";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { User } from "../user/user.model";
import { otpServices } from "./otp.services";

const emailSchema = z.string({ required_error: "ইমেইল দিতে হবে" }).trim().toLowerCase().email("অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দাও");

// Controller for creating OTP (sign-up email verification)
const createOtp = catchAsync(async (req, res) => {
  const email = emailSchema.parse(req.body?.email);

  if (await User.isUserExistsByEmail(email)) {
    throw new AppError(
      httpStatus.CONFLICT,
      "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে। অনুগ্রহ করে লগইন করো।"
    );
  }

  const result = await otpServices.createAndSendOtp(email);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OTP পাঠানো হয়েছে",
    data: result,
  });
});

// Controller for verifying OTP
const verifyOtp = catchAsync(async (req, res) => {
  const email = emailSchema.parse(req.body?.email);
  const result = await otpServices.verifyOtp(email, req.body?.otp);

  if (!result?.verified) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP ভুল, অথবা এর মেয়াদ শেষ হয়ে গেছে");
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OTP সফলভাবে যাচাই হয়েছে",
    data: result,
  });
});

export const otpControllers = {
  createOtp,
  verifyOtp,
};
