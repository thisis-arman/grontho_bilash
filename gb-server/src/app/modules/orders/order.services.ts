import { ObjectId } from 'mongodb';
import { OrderModel } from "./order.model";
import mongoose, { Mongoose, Types } from "mongoose";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TOrder } from "./order.interface";
import { orderValidations } from "./order.validation";
import { User } from "../user/user.model";

const generateOrderId = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Get the count of orders today to increment
  const orderCount = await OrderModel.countDocuments({
    createdAt: { 
      $gte: new Date(date.setHours(0,0,0,0)), 
      $lte: new Date(date.setHours(23,59,59,999)) 
    }
  });

  const sequence = String(orderCount + 1).padStart(4, '0');
  return `ORD${year}${month}${sequence}`; 
  // Result: ORD-202602-0001
};

const createOrder = async (orderData: Partial<TOrder>) => {
  console.log({orderData});
  const generatedOrderId = await generateOrderId();
  console.log(generatedOrderId);
  const payload = { 
    ...orderData, 
    orderId:generatedOrderId,
    transactionId: orderData.paymentMethod === 'bkash' ? orderData.transactionId : 'N/A'
  };
  console.log({payload});
  const validatedOrder = orderValidations.createOrderSchema.parse(payload);
  const newOrder = await OrderModel.create(validatedOrder);
  
  // Optional: You could trigger a notification here (SMS/Email) 
  // alerting you that a new bKash order needs verification.

  return newOrder;
};

// Service to get an order by ID
const getOrderById = async (orderId: string) => {
  console.log("order id", { orderId });
  if (!Types.ObjectId.isValid(orderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid order ID");
  }

  const order = await OrderModel.aggregate([
    { $match: { _id:new mongoose.Types.ObjectId(orderId) }},
    {
    $lookup: {
      from: "books",              
      let: { bookIds: "$books.book" }, 
      pipeline: [
        { $match: { $expr: { $in: ["$_id", "$$bookIds"] } } },
        { $project: { title: 1, price: 1, _id: 1 } } 
      ],
      as: "book_details"          
    }
  },
    {
      $lookup: {
        from: "books",
        localField: "book",
        foreignField: "_id",
        as: "book_details",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "buyer",
        foreignField: "_id",
        as: "bought_by",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "seller",
        foreignField: "_id",
        as: "sold_by",
      },
    },
  ]);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return order;
};

const getOrdersFromDB = async () => {
  const orders = await OrderModel.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "buyer",
        foreignField: "_id",
        as: "bought_by",
      },
    },
  ]);
  return orders;
};
const updateOrderById = async (
  orderId: string,
  updateData: Partial<TOrder>
) => {
  if (!Types.ObjectId.isValid(orderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid order ID");
  }

  const validatedData = orderValidations.createOrderSchema
    .partial()
    .parse(updateData);

  const updatedOrder = await OrderModel.findByIdAndUpdate(
    orderId,
    validatedData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return updatedOrder;
};

// Service to delete an order by ID
const deleteOrderById = async (orderId: string) => {
  if (!Types.ObjectId.isValid(orderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid order ID");
  }

  const deletedOrder = await OrderModel.findByIdAndDelete(orderId);

  if (!deletedOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return deletedOrder;
};

const getOrdersByUserId = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user ID");
  }

  const isValid = await User.findOne({ _id: userId });
  if (!isValid) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const orders = await OrderModel.find({ buyer: userId }).populate("buyer");

  return orders;
};

export const orderServices = {
  createOrder,
  getOrderById,
  updateOrderById,
  deleteOrderById,
  getOrdersFromDB,
  getOrdersByUserId,
};
