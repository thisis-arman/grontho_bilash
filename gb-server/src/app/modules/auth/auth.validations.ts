import { z } from "zod";

const loginValidationSchema = z.object({
  email: z.string({ required_error: "email is required." }),
  password: z.string({ required_error: "Password is required" }),
});
const forgotPasswordValidationSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});
const resetPasswordValidationSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
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
