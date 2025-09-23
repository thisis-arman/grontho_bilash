import { z } from "zod";

const loginValidationSchema = z.object({
  email: z.string({ required_error: "email is required." }),
  password: z.string({ required_error: "Password is required" }),
});
const refreshTokenValidationSchema = z.object({
  refreshToken: z.string({
    required_error: " Refresh Token is required to get new Access Token",
  }),
});

export const authValidationsSchema = {
  loginValidationSchema,
  refreshTokenValidationSchema,
};
