import { Types } from "mongoose";
import { z } from "zod";


const createBookSchema = z.object({
   user:z.string(),
  bookTitle: z
    .string({ message: "Book title is required" })
    .min(1, { message: "Book title cannot be empty" }),
  price: z
    .number({ message: "Price is required" })
    .positive({ message: "Price must be a positive number" }),
  description: z
    .string({ message: "Description is required" })
    .min(1, { message: "Description cannot be empty" }),
  condition: z.enum(["Fresh", "Used"], {
    message: "Condition must be 'fresh' or 'used'",
  }),
  level: z.string({
    message:"level is required"
  }),
  faculty: z.string({
    message:"faculty is required"
  }).optional(),
  department: z.string({
    message:"department is required"
  }).optional(),
  isContactNoHidden: z.boolean({
    message: "isContactNoHidden must be a boolean value",
  }),
  isNegotiable: z.boolean({ message: "isNegotiable must be a boolean value" }),
  images: z
    .array(z.string().url({ message: "Each image must be a valid URL" }), {
      message: "Images must be an array of valid URLs",
    })
    .min(1, { message: "At least one image URL is required" }),
  publicationYear: z
    .number({ message: "Publication year is required" })
    .int({ message: "Publication year must be an integer" }),
  transactionDate: z
    .date({ message: "Transaction date must be a valid date" })
    .optional(),
  location: z
    .string({ message: "Location is required" })
    .min(1, { message: "Location cannot be empty" }),
  deliveryOption: z.enum(["Pickup", "Shipping"], {
    message: "Delivery option must be 'pickup' or 'shipping'",
  }),
  shippingCost: z
    .number({ message: "Shipping cost must be a number" })
    .positive({ message: "Shipping cost must be a positive number" })
    .optional(),
});

const updateBookSchema = createBookSchema
  .pick({
    // Required in updates
    bookTitle: true,
    price: true,
  })
  .partial()
  .merge(
    createBookSchema.pick({
      // Always optional in updates
      condition: true,
      images: true,
      // Add other fields that should be optional
    })
  );

export const zodValidationSchema = {
  createBookSchema,
  updateBookSchema,
};
