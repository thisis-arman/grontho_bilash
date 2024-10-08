import { model, Schema } from "mongoose";
import { Otp } from "./otp.interface";

const otpSchema = new Schema<Otp>({
  email: { type: String, required: true,},
  otp: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
});

export const OtpModel = model<Otp>("Otp", otpSchema);
