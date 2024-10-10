// otp.controllers.ts
import { Request, Response } from "express";
import { otpServices } from "./otp.services";
import sendResponse from "../../utils/sendResponse";

// Controller for creating OTP
const createOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log({ email });
  const result = await otpServices.createAndSendOtp(email);
  console.log({ result });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OTP sent Successful ",
    data: result,
  });
};

// Controller for verifying OTP
const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  console.log({email,otp});

  // Call the service to verify the OTP
  const result = await otpServices.verifyOtp(email, otp);

  console.log(result ,'controllers');
  if (result?.success==false) {
    sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "invalid OTP ",
      data: result,
    });
  }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OTP Verified Successfully ",
      data: result,
    });
};

export const otpControllers = {
  createOtp,
  verifyOtp,
};
