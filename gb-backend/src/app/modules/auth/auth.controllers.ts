import httpStatus from "http-status";
import config from "../../config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authServices } from "./auth.services";

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUser(req.body);
  const { refreshToken, accessToken, needsUpdateProfile } = result;

  console.log(result);
  res.cookie("refreshToken", refreshToken, {
    secure: config.node_env === "production",
    httpOnly: true,
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
  const result = await authServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token is retrieved successfully!",
    data: result,
  });
});

export const authControllers = {
  loginUser,
  refreshToken
};
