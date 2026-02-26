import { model, Schema } from "mongoose";
import { TOrder } from "./order.interface";

const orderSchema = new Schema<TOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    books: [
      {
        book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
        bookTitle: { type: String, required: true },
        productImage: { type: String, required: true },
        seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: { // Added email for order notifications
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    shippingArea: { // Added to distinguish 70tk vs 130tk
      type: String,
      enum: ["inside", "outside"],
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    paymentMethod: { // Added: cod or bkash
      type: String,
      enum: ["cod", "bkash"],
      required: true,
    },
    transactionId: { // Required if paymentMethod is bkash
      type: String,
      default: "N/A", 
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partially-paid", "failed"],
      default: "pending", // "partially-paid" can represent upfront shipping paid
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    comment: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const OrderModel = model<TOrder>("Order", orderSchema);