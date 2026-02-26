import { z } from "zod";
import { Types } from "mongoose";

const ObjectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId",
});

const createOrderSchema = z.object({
  orderId:z.string().optional(),
  books: z.array(
    z.object({
      book: ObjectIdSchema,
      bookTitle: z.string().min(1, "Title required"),
      productImage: z.string().url("Invalid image URL"),
      seller: ObjectIdSchema,
      price: z.number().positive(),
      quantity: z.number().int().positive(),
    })
  ),
  buyer: ObjectIdSchema,
  phoneNumber: z.string().min(11, "Valid BD phone number required"),
  email: z.string().email("Invalid email address"),
  deliveryAddress: z.string().min(5, "Full address is required"),
  
  // New Fields
  shippingArea: z.enum(["inside", "outside"], {
    errorMap: () => ({ message: "Select either Inside or Outside Chattogram" }),
  }),
  shippingCost: z.number().nonnegative(),
  totalAmount: z.number().positive(),
  
  paymentMethod: z.enum(["cod", "bkash"], {
    errorMap: () => ({ message: "Select a valid payment method" }),
  }),
  
  // Transaction ID is optional for COD, but recommended for bKash
  transactionId: z.string().optional(),
  comment: z.string().optional(),
}).refine((data) => {
  // Custom logic: If bkash is selected, transactionId should ideally be present
  if (data.paymentMethod === 'bkash' && (!data.transactionId || data.transactionId === '')) {
    return false;
  }
  return true;
}, {
  message: "Transaction ID is required for bKash payments",
  path: ["transactionId"],
});

export const orderValidations = {
  createOrderSchema,
};