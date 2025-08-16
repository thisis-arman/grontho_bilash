import { model, Schema, Types } from "mongoose";
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
        deliveryOption: { type: String, required: true },
        isNegotiable: { type: Boolean, required: true },
        productImage: { type: String, required: true },
        seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
        price: { type: Number, required: true },
        shippingCost: { type: Number },
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
    orderDate: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
    },
    deliveryOption: {
      type: String,
      enum: ["pickup", "shipping"],
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending" , "paid" , "failed" , "cancelled"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

export const OrderModel = model<TOrder>("Order", orderSchema);
