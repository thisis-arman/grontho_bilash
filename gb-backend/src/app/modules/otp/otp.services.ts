import { OtpModel } from "./otp.model";
import crypto from "crypto"; // For generating random OTP
// import { sendOtpViaEmail } from "./otp.utils"; // A utility function for sending the OTP via email

// Function to generate a random OTP
export const generateOtp = (): number => {
  return crypto.randomInt(100000, 999999); // A 6-digit OTP
};

// OTP creation logic
 const createAndSendOtp = async (email: string): Promise<void> => {
  // Generate a new OTP
  const otp = generateOtp();

  // Create an expiry time (e.g., 5 minutes from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5); // OTP valid for 5 minutes

  // Save the OTP to the database
  await OtpModel.create({
    email,
    otp,
    expiresAt,
    verified: false,
  });

    // Send the OTP via email (or SMS if you prefer)
    // TODO: ADD FUNCTIONALITY 
//   await sendOtpViaEmail(email, otp); // Implement this function to use a mailer service
};

// OTP verification logic (unchanged)
 const verifyOtp = async (
  email: string,
  otp: number
): Promise<boolean> => {
  const otpEntry = await OtpModel.findOne({ email });

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
}