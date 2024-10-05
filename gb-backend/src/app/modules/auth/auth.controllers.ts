import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authServices } from "./auth.services";

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUser(req.body);
console.log(result);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "login successful",
    data: result,
  });
});


export const authControllers = {
    loginUser
}