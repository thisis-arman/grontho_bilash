// otp.controllers.ts
import { Request, Response } from "express";
import { otpServices } from "./otp.services";

// Controller for creating OTP
const createOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Call the service to create OTP and send it to the user
  const result = await otpServices.createAndSendOtp(email);

  res.json({
    success: true,
    message: "OTP sent successfully",
    data: result,
  });
};

// Controller for verifying OTP
const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  // Call the service to verify the OTP
  const result = await otpServices.verifyOtp(email, otp);

  res.json({
    success: true,
    message: "OTP verified successfully",
    data: result,
  });
};

export const otpControllers = {
  createOtp,
  verifyOtp,
};
