import { Schema, Types, model } from "mongoose";

export interface TPayment {
  paymentId: string; // Unique identifier for each payment
  orderId: Types.ObjectId; // Reference to the associated order
  userId: Types.ObjectId; // Reference to the user making the payment
  amount: number; // Total amount paid
  paymentMethod:
    | "credit_card"
    | "debit_card"
    | "bank_transfer"
    | "cash"
    | "mobile_banking"; // Payment method used
  paymentStatus: "pending" | "completed" | "failed" | "refunded"; // Status of the payment
  transactionDate: Date; // Date and time of the payment transaction
  referenceNumber?: string; // Unique reference from the payment provider (if applicable)
  isRefunded: boolean; // Whether the payment has been refunded
  refundDate?: Date; // Date of refund, if applicable
}