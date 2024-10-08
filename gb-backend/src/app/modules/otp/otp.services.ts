import { Otp } from "./otp.interface";
import { OtpModel } from "./otp.model";
import crypto from "crypto"; // For generating random OTP
import { sendEmail } from "./otp.utils";

// Function to generate a random OTP
export const generateOtp = (): number => {
  return crypto.randomInt(100000, 999999); // A 6-digit OTP
};

// OTP creation and sending logic with request limits
const createAndSendOtp = async (email: string) => {
  const maxOtpRequests = 3; // Maximum OTP requests per hour
  const otpValidityDuration = 5; // OTP validity in minutes

  // Calculate the timestamp for one hour ago to find recent OTPs
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  // Find recent OTPs for this email within the last hour
  const recentOtps = await OtpModel.find({
    email,
    createdAt: { $gte: oneHourAgo },
  });

  // Check if the request limit is reached
  if (recentOtps.length >= maxOtpRequests) {
    throw new Error(
      "You have reached the maximum OTP request limit. Please try again later."
    );
  }

  // Invalidate previous OTPs by marking them as verified (or you can delete them)
  await OtpModel.updateMany({ email, verified: false }, { verified: true });

  // Generate a new OTP
  const otp = generateOtp();

  // Set expiry time for the new OTP (e.g., 5 minutes from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + otpValidityDuration);

  // Send OTP via email
  await sendEmail(email, otp);

  // Save the new OTP to the database
  const otpCreated = await OtpModel.create({
    email,
    otp,
    expiresAt,
    verified: false,
  });

  return otpCreated;
};

// OTP verification logic with latest OTP validation
const verifyOtp = async (email: string, otp: number): Promise<boolean> => {
  // Find the most recent OTP entry for the email
  const otpEntry = await OtpModel.findOne({ email, verified: false }).sort({
    createdAt: -1,
  });

  if (!otpEntry || otpEntry.otp !== otp || otpEntry.expiresAt < new Date()) {
    return false; // Invalid OTP
  }

  // Mark OTP as verified
  otpEntry.verified = true;
  await otpEntry.save();

  return true; // OTP is valid
};

export const otpServices = {
  createAndSendOtp,
  verifyOtp,
};
