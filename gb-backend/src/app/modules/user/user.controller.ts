import { Request, Response } from "express";
import { userServices } from "./user.services";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const createUser = catchAsync(async (req, res) => {
  const result = await userServices.createUserIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User created successfully",
    data: result,
  });
});
const getUsers = catchAsync(async (req, res) => {
  const result = await userServices.getUsersFromDB();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Users retrieved successfully",
    data: result,
  });
});

export const userControllers = {
  createUser,
  getUsers,
};
