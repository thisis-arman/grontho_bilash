import { z } from "zod";

const email = z
  .string({ required_error: "ইমেইল দিতে হবে" })
  .trim()
  .toLowerCase()
  .email("অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দাও");

const loginValidationSchema = z.object({
  email,
  password: z.string({ required_error: "পাসওয়ার্ড দিতে হবে" }).min(1, "পাসওয়ার্ড দিতে হবে").max(128, "পাসওয়ার্ড সর্বোচ্চ ১২৮ অক্ষরের হতে পারে"),
});
const forgotPasswordValidationSchema = z.object({
  email,
});
const resetPasswordValidationSchema = z.object({
  email,
  otp: z.union([z.string(), z.number()], {
    errorMap: () => ({ message: "OTP কোডটি দিতে হবে" }),
  }),
  newPassword: z
    .string({ required_error: "নতুন পাসওয়ার্ড দিতে হবে" })
    .min(6, { message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" }),
});
const changePasswordValidationSchema = z.object({
  oldPassword: z.string({ required_error: "পুরনো পাসওয়ার্ড দিতে হবে" }),
  newPassword: z
    .string({ required_error: "নতুন পাসওয়ার্ড দিতে হবে" })
    .min(6, { message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" }),
});

export const authValidationsSchema = {
  loginValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
  changePasswordValidationSchema,
};
