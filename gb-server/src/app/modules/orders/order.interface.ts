import { Types } from "mongoose";

export type ShippingArea = "inside" | "outside";
export type PaymentMethod = "cod" | "bkash";
export type PaymentStatus = "pending" | "paid" | "partially-paid" | "failed";
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface TOrderBookItem {
  book: Types.ObjectId;
  bookTitle: string;
  productImage: string;
  seller: Types.ObjectId;
  price: number; // UNIT price per copy — line total = price * quantity
  quantity: number;
}

export interface TOrder {
  orderId: string;
  books: TOrderBookItem[];
  buyer: Types.ObjectId;
  phoneNumber: string;
  email: string;
  totalAmount: number;
  shippingCost: number;
  shippingArea: ShippingArea;
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  comment?: string;
  isDeleted: boolean;
}