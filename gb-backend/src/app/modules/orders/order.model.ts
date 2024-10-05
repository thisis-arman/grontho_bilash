import { model, Schema, Types } from "mongoose";
import { TOrder } from "./order.interface";

const orderSchema = new Schema<TOrder>({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  book: {
    type: Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderDate: {
    type: Date,
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
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  orderStatus: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  transactionDate: {
    type: Date,
  },
  isNegotiable: {
    type: Boolean,
    required: true,
  },
});

export const OrderModel = model<TOrder>("Order", orderSchema);
