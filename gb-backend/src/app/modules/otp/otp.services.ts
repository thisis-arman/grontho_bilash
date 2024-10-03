import { OtpModel } from "./otp.model";

export const verifyOtp = async (
  email: string,
  otp: number
): Promise<boolean> => {
  const otpEntry = await OtpModel.findOne({ email });

  if (!otpEntry || otpEntry.otp !== otp || otpEntry.expiresAt < new Date()) {
    return false;
  }

  otpEntry.verified = true;
  await otpEntry.save();

  return true;
};
