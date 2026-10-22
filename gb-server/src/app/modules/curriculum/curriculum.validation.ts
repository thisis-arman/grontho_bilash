import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

const course = z.object({
  code: text(20).regex(/^[A-Za-z0-9-]*$/, "Course codes use letters, numbers and dashes").optional(),
  title: text(200).min(2, "Every course needs a title"),
  marks: z.number().int().min(0).max(1000).nullable().optional(),
  credits: z.number().min(0).max(30).nullable().optional(),
  group: text(80).optional(),
});

const year = z.object({
  year: z.number().int().min(1).max(5),
  session: text(20).optional(),
  syllabusUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https:\/\//.test(v), "Use an https:// link")
    .optional(),
  publishedAt: text(40).optional(),
  courses: z.array(course).max(60, "At most 60 courses per year"),
});

const fields = {
  institution: text(120).min(2),
  institutionBn: text(120).optional(),
  level: text(40).min(2),
  program: text(20).min(2),
  programName: text(120).optional(),
  programNameBn: text(120).optional(),
  department: text(120).min(2),
  departmentBn: text(120).optional(),
  years: z
    .array(year)
    .max(6)
    .refine((ys) => new Set(ys.map((y) => y.year)).size === ys.length, "Each year can appear only once"),
  status: z.enum(["draft", "published"]).optional(),
};

export const curriculumValidations = {
  createSchema: z.object(fields),
  updateSchema: z.object(fields).partial(),
};
