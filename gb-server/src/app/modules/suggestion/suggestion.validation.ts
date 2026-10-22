import { z } from "zod";
import config from "../../config";
import { CONTENT_KINDS, EXAM_LEVELS } from "./suggestion.model";

// Attachments must come from this project's Cloudinary account, uploaded
// through the signed-upload endpoint. Arbitrary links are not accepted, so
// a published suggestion can never point readers at a third-party file.
const ownCloudinaryUrl = z
  .string()
  .trim()
  .url()
  .refine(
    (value) =>
      value.startsWith(`https://res.cloudinary.com/${config.cloudinary_cloud_name}/`),
    "Files must be uploaded through the editor"
  );

const optionalText = (max: number) => z.string().trim().max(max).optional();

const suggestionFields = {
  kind: z.enum(CONTENT_KINDS).optional(),
  title: z.string().trim().min(3, "Title is too short").max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes")
    .max(90)
    .optional(),
  summary: optionalText(300),
  body: z.string().max(100_000, "The text is too long").optional(),
  attachments: z
    .array(
      z.object({
        url: ownCloudinaryUrl,
        name: z.string().trim().min(1).max(150),
        kind: z.enum(["pdf", "image"]),
        size: z.number().int().nonnegative().optional(),
      })
    )
    .max(20, "Attach at most 20 files")
    .optional(),
  level: z.enum(EXAM_LEVELS),
  subject: z.string().trim().min(2, "Subject is required").max(120),
  subjectCode: optionalText(30),
  program: optionalText(60),
  department: optionalText(80),
  academicYear: optionalText(40),
  examYear: optionalText(40),
  institution: optionalText(120),
  preparedBy: optionalText(80),
  tags: z
    .array(z.string().trim().toLowerCase().min(1).max(30))
    .max(10)
    .transform((list) => Array.from(new Set(list)))
    .optional(),
  status: z.enum(["draft", "published"]).optional(),
};

export const suggestionValidations = {
  createSuggestionSchema: z.object(suggestionFields),
  updateSuggestionSchema: z.object(suggestionFields).partial(),
};
