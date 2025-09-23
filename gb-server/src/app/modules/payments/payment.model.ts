import { model, Schema } from "mongoose";
import { TPayment } from "./payment.interface";

const paymentSchema = new Schema<TPayment>(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: [
        "credit_card",
        "debit_card",
        "bank_transfer",
        "cash",
        "mobile_banking",
      ],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionDate: {
      type: Date,
      required: true,
    },
    referenceNumber: {
      type: String,
    },
    isRefunded: {
      type: Boolean,
      default: false,
    },
    refundDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = model<TPayment>("Payment", paymentSchema);
