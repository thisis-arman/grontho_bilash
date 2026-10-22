import { Response } from "express";
import httpStatus from "http-status";
import config from "../../config";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authServices } from "./auth.services";

// The API and the site live on different domains in production, so the
// cookie has to be SameSite=None (which in turn requires Secure).
const refreshCookieOptions = {
  secure: config.is_production,
  sameSite: (config.is_production ? "none" : "lax") as "none" | "lax",
  httpOnly: true,
  path: "/",
};

export const setRefreshCookie = (res: Response, token: string) =>
  res.cookie("refreshToken", token, {
    ...refreshCookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUser(req.body);
  const { refreshToken, accessToken, needsUpdateProfile } = result;

  setRefreshCookie(res, refreshToken);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "লগইন সফল হয়েছে",
    data: {
      accessToken,
      needsUpdateProfile,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, "তুমি লগইন করোনি। অনুগ্রহ করে আগে লগইন করো।");
  }
  const result = await authServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "অ্যাক্সেস টোকেন পাওয়া গেছে!",
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const email = req.user.email;

  await authServices.changePassword(email, oldPassword, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!",
    data: null,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  await authServices.forgotPassword(req.body.email);

  // Same answer whether or not the account exists, so this endpoint cannot
  // be used to find out which emails are registered.
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট থাকলে, পাসওয়ার্ড রিসেট করার কোড পাঠানো হয়েছে।",
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await authServices.resetPassword(email, otp, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "পাসওয়ার্ড সফলভাবে রিসেট হয়েছে! অনুগ্রহ করে লগইন করো।",
    data: null,
  });
});

const logoutUser = catchAsync(async (req, res) => {
  res.clearCookie("refreshToken", refreshCookieOptions);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "লগআউট হয়েছে",
    data: null,
  });
});

export const authControllers = {
  logoutUser,
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
