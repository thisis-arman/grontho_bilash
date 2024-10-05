import { z } from "zod";
import { Types } from "mongoose";

// Define a Zod schema for validating ObjectId (from Mongoose)
const ObjectIdSchema = z.string().refine(
  (value) => {
    return Types.ObjectId.isValid(value);
  },
  {
    message: "Invalid ObjectId",
  }
);

// Zod schema for the order object
 const createOrderSchema = z.object({
  orderId: z
    .string()
    .min(1, { message: "Order ID is required and cannot be empty" })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        "Order ID can only contain letters, numbers, underscores, and dashes",
    }),

  book: ObjectIdSchema,

  buyer: ObjectIdSchema,

  seller: ObjectIdSchema,

  orderDate: z.date().default(() => new Date()),

  totalAmount: z
    .number()
    .positive({ message: "Total amount must be a positive number" })
    .min(1, { message: "Total amount must be at least 1" }),

  shippingCost: z.number().optional(),

  deliveryOption: z.enum(["pickup", "shipping"], {
    errorMap: () => ({
      message: "Delivery option must be either 'pickup' or 'shipping'",
    }),
  }),

  deliveryAddress: z.string().optional(),

  paymentStatus: z.enum(["pending", "completed", "failed"], {
    errorMap: () => ({
      message:
        "Payment status must be one of 'pending', 'completed', or 'failed'",
    }),
  }),

  orderStatus: z.enum(
    ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    {
      errorMap: () => ({
        message:
          "Order status must be one of 'pending', 'confirmed', 'shipped', 'delivered', or 'cancelled'",
      }),
    }
  ),

  transactionDate: z.date().optional(),

  isNegotiable: z.boolean().refine((value) => typeof value === "boolean", {
    message: "Negotiability status is required and must be a boolean value",
  }),
});

export const orderValidations = {
    createOrderSchema
};
