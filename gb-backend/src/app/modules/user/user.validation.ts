import { z } from "zod";

export const UserRoleEnum = z.enum(["user", "admin"]);
export const UserStatusEnum = z.enum(["active", "blocked"]);

export const userZodSchema = z.object({

  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .nonempty({ message: "Email is required" }),
  contactNo: z
    .string()
    .regex(/^\d{10,15}$/, { message: "Please enter a valid contact number" })
    .nonempty({ message: "Contact number is required" }),
  password: z.string().nonempty({ message: "Password is required" }),


});
