import { Schema, Types, model } from "mongoose";

export interface TOrder {
  orderId: string; // Unique identifier for the order
  book: Types.ObjectId; // Reference to the book being ordered
  buyer: Types.ObjectId; // Reference to the buyer (user ID)
  seller: Types.ObjectId; // Reference to the seller (user ID)
  orderDate: string; // Date when the order was placed
  totalAmount: number; 
  shippingCost?: number; 
  deliveryOption: "pickup" | "shipping"; // Pickup or shipping option
  deliveryAddress?: string; // Address for shipping if deliveryOption is 'shipping'
  paymentStatus: "pending" | "completed" | "failed"; // Payment status of the order
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"; // Status of the order
  transactionDate?: Date; // Date when the order is completed (optional)
  isNegotiable: boolean; // Whether the price was negotiable
}
