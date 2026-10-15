// otp.controllers.ts
import httpStatus from "http-status";
import { z } from "zod";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { User } from "../user/user.model";
import { otpServices } from "./otp.services";

const emailSchema = z.string().trim().toLowerCase().email("Please enter a valid email address");

// Controller for creating OTP (sign-up email verification)
const createOtp = catchAsync(async (req, res) => {
  const email = emailSchema.parse(req.body?.email);

  if (await User.isUserExistsByEmail(email)) {
    throw new AppError(
      httpStatus.CONFLICT,
      "An account with this email already exists. Please log in."
    );
  }

  const result = await otpServices.createAndSendOtp(email);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OTP sent Successful ",
    data: result,
  });
});

// Controller for verifying OTP
const verifyOtp = catchAsync(async (req, res) => {
  const email = emailSchema.parse(req.body?.email);
  const result = await otpServices.verifyOtp(email, req.body?.otp);

  if (!result?.verified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired OTP");
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OTP Verified Successfully ",
    data: result,
  });
});

export const otpControllers = {
  createOtp,
  verifyOtp,
};
