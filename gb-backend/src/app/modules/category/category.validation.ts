import { z } from "zod";
import { Types } from "mongoose";

// Level Zod Schema
export const LevelZodSchema = z.object({
  level: z.string({
    required_error:
      "Level is required, e.g., 'ssc', 'hsc', 'bachelor', 'master'.",
  }),
  levelId: z.string({
    required_error: "Level ID is required and must be unique.",
  }),
  faculty: z.string({
    required_error: "Faculty is required, e.g., 'science', 'humanities'.",
  }),
});

// Faculty Zod Schema
export const FacultyZodSchema = z.object({
  facultyId: z.string({
    required_error: "Faculty ID is required and must be unique.",
  }),
  faculty: z.string({
    required_error: "Faculty name is required.",
  }),
  facultyShorts: z.string({
    required_error: "Faculty shorthand is required, e.g., 'bba', 'bsc'.",
  }),
  department: z
    .instanceof(Types.ObjectId)
    .optional()
    .or(z.string().optional())
    .refine((val) => val === undefined || Types.ObjectId.isValid(val), {
      message: "Department ID must be a valid ObjectId if provided.",
    }),
  level: z
    .instanceof(Types.ObjectId)
    .or(z.string())
    .refine((val) => Types.ObjectId.isValid(val), {
      required_error: "Level ID is required and must be a valid ObjectId.",
    }),
});

// Department Zod Schema
export const DepartmentZodSchema = z.object({
  deptId: z.string({
    required_error: "Department ID is required and must be unique.",
  }),
  department: z.string({
    required_error:
      "Department name is required, e.g., 'accounting', 'chemistry'.",
  }),
  deptShorts: z.string({
    required_error: "Department shorthand is required, e.g., 'acc', 'chem'.",
  }),
  level: z
    .instanceof(Types.ObjectId)
    .or(z.string())
    .refine((val) => Types.ObjectId.isValid(val), {
      required_error: "Level ID is required and must be a valid ObjectId.",
    }),
  faculty: z
    .instanceof(Types.ObjectId)
    .or(z.string())
    .refine((val) => Types.ObjectId.isValid(val), {
      required_error: "Faculty ID is required and must be a valid ObjectId.",
    }),
});
