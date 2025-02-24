import { z } from "zod";
import { Types } from "mongoose";

// Zod schema for validating MongoDB ObjectId
const ObjectIdSchema = z.string().refine(Types.ObjectId.isValid, {
  message: "Invalid ObjectId",
});

// Schema for order validation
const createOrderSchema = z.object({


  books: z.array(
    z.object({
      book: ObjectIdSchema,
      bookTitle: z.string().min(1, { message: "Book title is required" }),
      deliveryOption: z
        .string()
        .min(1, { message: "Delivery option is required" }),
      isNegotiable: z.boolean(),
      productImage: z.string().url({ message: "Invalid product image URL" }),
      seller: ObjectIdSchema,
      price: z
        .number()
        .positive({ message: "Price must be a positive number" }),
      shippingCost: z.number().nonnegative().optional(),
      quantity: z
        .number()
        .int()
        .positive({ message: "Quantity must be at least 1" }),
    })
  ),
  phoneNumber: z.string(),

  buyer: ObjectIdSchema,

  totalAmount: z
    .number()
    .positive({ message: "Total amount must be a positive number" }),

  shippingCost: z.number().nonnegative().optional(),

  deliveryOption: z.enum(["pickup", "shipping"], {
    errorMap: () => ({
      message: "Delivery option must be either 'pickup' or 'shipping'",
    }),
  }),
  comment: z.string().optional(),

  deliveryAddress: z
    .string()
    .min(1, { message: "Delivery address is required" }),
});

export const orderValidations = {
  createOrderSchema,
};
