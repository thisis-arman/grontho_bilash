import { z } from "zod";

const createPaymentSchema = z.object({
  paymentId: z.string().nonempty("Payment ID is required."),
  orderId: z.string().nonempty("Order ID is required."),
  userId: z.string().nonempty("User ID is required."),
  transactionId: z.string().nonempty("Transaction ID is required."),
  amount: z
    .number()
    .positive("Amount must be a positive number.")
    .min(0, "Amount must be greater than 0."),
  paymentMethod: z.enum(
    ["credit_card", "debit_card", "bank_transfer", "cash", "mobile_banking"],
    {
      required_error: "Payment method is required.",
      invalid_type_error:
        "Invalid payment method. Choose from 'credit_card', 'debit_card', 'bank_transfer', 'cash', or 'mobile_banking'.",
    }
  ),
  paymentStatus: z
    .enum(["pending", "completed", "failed", "refunded"], {
      required_error: "Payment status is required.",
      invalid_type_error:
        "Invalid payment status. Choose from 'pending', 'completed', 'failed', or 'refunded'.",
    })
    .default("pending"),
  transactionDate: z.date({
    required_error: "Transaction date is required.",
    invalid_type_error: "Transaction date must be a valid date.",
  }),
  referenceNumber: z.string().optional(),
  isRefunded: z.boolean().default(false),
  refundDate: z
    .date({
      invalid_type_error: "Refund date must be a valid date.",
    })
    .optional(),
});

export const paymentValidations = {
  createPaymentSchema,
};
