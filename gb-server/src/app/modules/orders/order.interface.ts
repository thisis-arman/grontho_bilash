import { Types } from "mongoose";

export interface TOrder {
  orderId: string;
  books: {
    book: Types.ObjectId;
    bookTitle: string;
    deliveryOption: string;
    isNegotiable: boolean;
    productImage: string;
    seller: Types.ObjectId;
    price: number;
    shippingCost?: number;
    quantity: number;
  }[];
  phoneNumber: string;
  buyer: Types.ObjectId;
  orderDate: Date;
  totalAmount: number;
  shippingCost?: number;
  deliveryOption: "pickup" | "shipping";
  deliveryAddress: string;
  paymentStatus: "pending" | "completed" | "failed";
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  transactionDate?: Date;
  comment?: string;
  isDeleted:boolean
}
