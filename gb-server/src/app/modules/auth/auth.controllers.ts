import httpStatus from "http-status";
import config from "../../config";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authServices } from "./auth.services";

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUser(req.body);
  const { refreshToken, accessToken, needsUpdateProfile } = result;

  //console.log(result);
  // The API and the site live on different domains in production, so the
  // cookie has to be SameSite=None (which in turn requires Secure).
  res.cookie("refreshToken", refreshToken, {
    secure: config.is_production,
    sameSite: config.is_production ? "none" : "lax",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "login successful",
    data: {
      accessToken,
      needsUpdateProfile,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not logged in.");
  }
  const result = await authServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token is retrieved successfully!",
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
    message: "Password changed successfully!",
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
    message: "If an account exists for this email, a reset code has been sent.",
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await authServices.resetPassword(email, otp, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully! Please log in.",
    data: null,
  });
});

export const authControllers = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
