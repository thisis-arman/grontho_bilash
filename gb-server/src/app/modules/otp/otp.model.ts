import { model, Schema } from "mongoose";
import { Otp } from "./otp.interface";

const otpSchema = new Schema<Otp>(
  {
    email: { type: String, required: true, index: true },
    otp: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    attempts: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const OtpModel = model<Otp>("Otp", otpSchema);
