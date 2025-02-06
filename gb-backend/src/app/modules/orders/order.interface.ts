import { Schema, Types, model } from "mongoose";

export interface TOrder {
  orderId: string; // Unique identifier for the order
  books: {
    book: Types.ObjectId; // Reference to the book being ordered
    seller: Types.ObjectId; // Reference to the seller (user ID)
    price: number; // Price of the book
    quantity: number; // Quantity of the book being ordered
    isNegotiable?: boolean; // Whether the price was negotiable
  }[]; // Array to handle multiple books in one order
  buyer: Types.ObjectId; // Reference to the buyer (user ID)
  orderDate: Date; // Date when the order was placed
  totalAmount: number; // Total amount for all books
  shippingCost?: number; // Shipping cost (if applicable)
  deliveryOption: "pickup" | "shipping"; // Pickup or shipping option
  deliveryAddress?: string; // Address for shipping if deliveryOption is 'shipping'
  paymentStatus: "pending" | "completed" | "failed"; // Payment status of the order
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"; // Status of the order
  transactionDate?: Date; // Date when the payment was completed (optional)
}
