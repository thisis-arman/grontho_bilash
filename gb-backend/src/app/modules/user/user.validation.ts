import { z } from "zod";

export const UserRoleEnum = z.enum(["user", "admin"]);
export const UserStatusEnum = z.enum(["active", "blocked"]);

export const userZodSchema = z.object({
  name: z.string().nonempty({ message: "name is required" }),
  email: z.string().email(),
  contactNo: z.string().nonempty({ message: "Contact number is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
});

export const userValidationSchema = {
  userZodSchema,
};
