import { z } from "zod";

const email = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address");

const loginValidationSchema = z.object({
  email,
  password: z.string({ required_error: "Password is required" }).min(1).max(128),
});
const forgotPasswordValidationSchema = z.object({
  email,
});
const resetPasswordValidationSchema = z.object({
  email,
  otp: z.union([z.string(), z.number()]),
  newPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});
const changePasswordValidationSchema = z.object({
  oldPassword: z.string({ required_error: "Old password is required" }),
  newPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const authValidationsSchema = {
  loginValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
  changePasswordValidationSchema,
};
