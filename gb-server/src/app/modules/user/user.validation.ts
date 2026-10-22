import { z } from "zod";

export const UserRoleEnum = z.enum(["user", "admin"]);
export const UserStatusEnum = z.enum(["active", "blocked"]);

export const userZodSchema = z.object({
  name: z.string({ required_error: "অনুগ্রহ করে তোমার নাম লেখো" }).trim().min(2, { message: "অনুগ্রহ করে তোমার নাম লেখো" }).max(80, { message: "নাম সর্বোচ্চ ৮০ অক্ষরের হতে পারে" }),
  email: z.string({ required_error: "ইমেইল দিতে হবে" }).trim().toLowerCase().email("অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দাও"),
  contactNo: z.string({ required_error: "মোবাইল নম্বর দিতে হবে" }).trim().nonempty({ message: "মোবাইল নম্বর দিতে হবে" }),
  password: z
    .string({ required_error: "পাসওয়ার্ড দিতে হবে" })
    .min(6, { message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" })
    .max(128, { message: "পাসওয়ার্ড সর্বোচ্চ ১২৮ অক্ষরের হতে পারে" }),
});

export const userValidationSchema = {
  userZodSchema,
};
