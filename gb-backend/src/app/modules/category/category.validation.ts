import { z } from "zod";
import { Types } from "mongoose";

// EducationCategory Zod Schema
export const EducationCategoryZodSchema = z.object({
  levelId: z.string({
    required_error: "Level ID is required and must be unique.",
  }),
  levelName: z.string({
    required_error: "Level name is required, e.g., 'Bachelor', 'Master'.",
  }),
  faculties: z.array(z.instanceof(Types.ObjectId).or(z.string())).optional(),
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
    required_error: "Faculty shorthand is required, e.g., 'BBA', 'BSc'.",
  }),
  departments: z.array(z.string()),
});

// Department Zod Schema
export const DepartmentZodSchema = z.object({
  deptId: z.string({
    required_error: "Department ID is required and must be unique.",
  }),
  department: z.string({
    required_error:
      "Department name is required, e.g., 'Accounting', 'Chemistry'.",
  }),
  deptShorts: z.string({
    required_error: "Department shorthand is required, e.g., 'ACC', 'CHEM'.",
  }),
});
