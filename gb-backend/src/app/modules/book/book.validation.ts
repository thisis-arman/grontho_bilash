import { z } from "zod";

// Zod schema for creating a book with custom messages
export const createBookSchema = z.object({
  bookTitle: z
    .string({ message: "Book title is required" })
    .min(1, { message: "Book title cannot be empty" }),
  price: z
    .number({ message: "Price is required" })
    .positive({ message: "Price must be a positive number" }),
  description: z
    .string({ message: "Description is required" })
    .min(1, { message: "Description cannot be empty" }),
  condition: z.enum(["fresh", "used"], {
    message: "Condition must be 'fresh' or 'used'",
  }),
  level: z.enum(["ssc", "hsc", "bachelor", "master"], {
    message: "Invalid education level",
  }),
  isPublished: z.boolean({ message: "isPublished must be a boolean value" }),
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
  deliveryOption: z.enum(["pickup", "shipping"], {
    message: "Delivery option must be 'pickup' or 'shipping'",
  }),
  shippingCost: z
    .number({ message: "Shipping cost must be a number" })
    .positive({ message: "Shipping cost must be a positive number" })
    .optional()
    .refine(
      (val, ctx) => {
        const deliveryOption = ctx?.parent?.deliveryOption;
        return (
          deliveryOption !== "shipping" ||
          (deliveryOption === "shipping" && val != null)
        );
      },
      {
        message: "Shipping cost is required when delivery option is 'shipping'",
      }
    ),
});
