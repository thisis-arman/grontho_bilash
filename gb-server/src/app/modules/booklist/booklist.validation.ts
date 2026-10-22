import { z } from "zod";
import { EXAM_LEVELS } from "../suggestion/suggestion.model";

const optionalText = (max: number) => z.string().trim().max(max).optional();

const fields = {
  title: z.string().trim().min(3, "Title is too short").max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes")
    .max(90)
    .optional(),
  description: optionalText(500),
  level: z.enum(EXAM_LEVELS),
  institution: optionalText(120),
  program: optionalText(60),
  department: optionalText(80),
  academicYear: optionalText(40),
  session: optionalText(20),
  books: z
    .array(
      z.object({
        title: z.string().trim().min(2, "Every book needs a title").max(160),
        author: optionalText(120),
        note: optionalText(200),
        optional: z.boolean().optional(),
        searchTerm: optionalText(100),
      })
    )
    .max(40, "At most 40 books per list"),
  status: z.enum(["draft", "published"]).optional(),
};

export const bookListValidations = {
  createSchema: z.object(fields),
  updateSchema: z.object(fields).partial(),
};
