import { Request, Response } from "express";
import { userServices } from "./user.services";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const createUser = catchAsync(async (req, res) => {
  console.log(req.body);
  const result = await userServices.createUserIntoDB(req.body);
  console.log(result);
  if (result) {
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User created successfully",
      data: result,
    });
  }

  sendResponse(res, {
    success: false,
    statusCode: 500,
    message: "Failed to create User",
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
