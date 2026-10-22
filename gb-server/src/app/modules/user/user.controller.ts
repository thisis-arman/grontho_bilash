import { Request, Response } from "express";
import { userServices } from "./user.services";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authServices } from "../auth/auth.services";
import { setRefreshCookie } from "../auth/auth.controllers";

const createUser = catchAsync(async (req, res) => {
  await userServices.createUserIntoDB(req.body);

  // Sign the new member in right away instead of sending them to the login
  // form to type the password they just chose.
  const { accessToken, refreshToken } = await authServices.loginUser({
    email: req.body.email,
    password: req.body.password,
  });
  setRefreshCookie(res, refreshToken);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "অ্যাকাউন্ট খোলা হয়েছে",
    data: { accessToken },
  });
});
const getMe = catchAsync(async (req, res) => {
  const email = req.params.email;
  //console.log("req______",req.params.email)
  const result = await userServices.getLoggedInUserFromDB(
    email,
    req.user.email,
    req.user.role
  );

  //console.log("result---",result);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "তোমার তথ্য পাওয়া গেছে",
    data: result,
  });
});

const getUsers = catchAsync(async (req, res) => {
  //console.log("req______",req.body)
  const result = await userServices.getUsersFromDB();

  //console.log("result---",result);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Users retrieved successfully",
    data: result,
  });
});

export const updateUserInfo = catchAsync(async (req, res) => {
  const id = req.params.id;
  const { email, role } = req.user;
  const result = await userServices.updateUserInfo(id, req.body, email, role);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "তথ্য সফলভাবে আপডেট হয়েছে",
    data: result,
  });
});

export const deleteMe = catchAsync(async (req, res) => {
  const id = req.params.id;
  const { email, role } = req.user;
  const result = await userServices.deleteUser(id, email, role);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে",
    data: result,
  });
});

export const userControllers = {
  createUser,
  getUsers,
  updateUserInfo,
  getMe,
  deleteMe
};
