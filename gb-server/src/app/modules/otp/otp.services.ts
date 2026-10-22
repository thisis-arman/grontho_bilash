import httpStatus from "http-status";
import crypto from "crypto"; // For generating random OTP
import AppError from "../../errors/AppError";
import { OtpModel } from "./otp.model";
import { sendEmail } from "./otp.utils";

const MAX_OTP_REQUESTS_PER_HOUR = 10;
const OTP_VALIDITY_MINUTES = 5;
const MAX_VERIFY_ATTEMPTS = 5;
// How long a verified email stays usable for the follow-up step (sign-up form).
const VERIFIED_WINDOW_MINUTES = 30;

// Function to generate a random OTP
export const generateOtp = (): number => {
  return crypto.randomInt(100000, 1000000); // A 6-digit OTP
};

// OTP creation and sending logic with request limits
const createAndSendOtp = async (email: string) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentCount = await OtpModel.countDocuments({
    email,
    createdAt: { $gte: oneHourAgo },
  });

  if (recentCount >= MAX_OTP_REQUESTS_PER_HOUR) {
    throw new AppError(
      httpStatus.TOO_MANY_REQUESTS,
      "তুমি সর্বোচ্চ সংখ্যকবার OTP চেয়ে ফেলেছো। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করো।"
    );
  }

  // Invalidate previous unused codes. They are expired rather than deleted
  // so they still count toward the hourly limit above.
  await OtpModel.updateMany(
    { email, verified: false },
    { expiresAt: new Date(0) }
  );

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000);

  await OtpModel.create({ email, otp, expiresAt, verified: false });

  // Throws if the mail could not be sent, so the client never shows
  // "code sent" for a code that will not arrive.
  await sendEmail(email, otp);

  // The code itself must never leave the server except by email.
  return { email, expiresAt };
};

// OTP verification logic with latest OTP validation
const verifyOtp = async (email: string, otp: number | string) => {
  const otpEntry = await OtpModel.findOne({ email, verified: false }).sort({
    createdAt: -1,
  });

  if (!otpEntry || otpEntry.expiresAt < new Date()) {
    return null;
  }

  if (otpEntry.attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new AppError(
      httpStatus.TOO_MANY_REQUESTS,
      "অনেকবার ভুল কোড দেওয়া হয়েছে। অনুগ্রহ করে নতুন কোড চাও।"
    );
  }

  if (otpEntry.otp !== Number(otp)) {
    otpEntry.attempts += 1;
    await otpEntry.save();
    return null;
  }

  otpEntry.verified = true;
  otpEntry.verifiedAt = new Date();
  await otpEntry.save();

  return { email, verified: true };
};

// Used by sign-up: the email must have been verified recently. The proof is
// single-use, so it is removed once consumed.
const consumeVerifiedEmail = async (email: string) => {
  const since = new Date(Date.now() - VERIFIED_WINDOW_MINUTES * 60 * 1000);
  const entry = await OtpModel.findOneAndDelete({
    email,
    verified: true,
    verifiedAt: { $gte: since },
  });

  if (!entry) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "এগোনোর আগে আমাদের পাঠানো কোড দিয়ে তোমার ইমেইল যাচাই করো।"
    );
  }
};

export const otpServices = {
  createAndSendOtp,
  verifyOtp,
  consumeVerifiedEmail,
};
