import { Types } from "mongoose";

export interface TOrder {
  orderId?: string;
  books: {
    book: Types.ObjectId;
    bookTitle: string;
    productImage: string;
    seller: Types.ObjectId;
    price: number;
    quantity: number;
  }[];
  
  // Buyer Details
  buyer: Types.ObjectId;
  phoneNumber: string;
  email: string; // Added for notifications
  deliveryAddress: string;
  
  // Shipping Logic
  shippingArea: "inside" | "outside"; // Added to handle 70tk vs 130tk logic
  shippingCost: number; // Now required as it's part of your new logic
  totalAmount: number;
  
  // Payment Details
  paymentMethod: "cod" | "bkash"; // Added for BD context
  transactionId?: string; // Storing the bKash TrxID
  paymentStatus: "pending" | "paid" | "partially-paid" | "failed" | "cancelled";
  
  // Order Metadata
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  orderDate?: Date;
  transactionDate?: Date;
  comment?: string;
  isDeleted: boolean;
  
  // Timestamps (handled by Mongoose, but good for typing)
  createdAt?: Date;
  updatedAt?: Date;
}