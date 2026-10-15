import { z } from "zod";

export const UserRoleEnum = z.enum(["user", "admin"]);
export const UserStatusEnum = z.enum(["active", "blocked"]);

export const userZodSchema = z.object({
  name: z.string().trim().min(2, { message: "Please enter your name" }).max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  contactNo: z.string().trim().nonempty({ message: "Contact number is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128),
});

export const userValidationSchema = {
  userZodSchema,
};
