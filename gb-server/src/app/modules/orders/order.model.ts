

// ─────────────────────────────────────────────────────────────
// Order Counter — unchanged from before. Still needed: order IDs
// must remain race-free regardless of the order shape change.
// ─────────────────────────────────────────────────────────────

import { model, Model, Schema } from "mongoose";
import { TOrder } from "./order.interface";

interface IOrderCounter extends Omit<Document, "_id"> {
  _id: string; // e.g. "202602"
  seq: number;
}

const orderCounterSchema = new Schema<IOrderCounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const OrderCounterModel: Model<IOrderCounter> = model<IOrderCounter>(
  "OrderCounter",
  orderCounterSchema
);

// ─────────────────────────────────────────────────────────────
// Order — exactly your schema, unchanged.
// ─────────────────────────────────────────────────────────────

const orderSchema = new Schema<TOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    books: [
      {
        book: { type: Schema.Types.ObjectId, ref: "Product", required: true },
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
    email: {
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
    shippingArea: {
      type: String,
      enum: ["inside", "outside"],
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "bkash"],
      required: true,
    },
    transactionId: {
      type: String,
      default: "N/A",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partially-paid", "failed"],
      default: "pending",
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