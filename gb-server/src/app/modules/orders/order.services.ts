import { ObjectId } from 'mongodb';
import { OrderModel } from "./order.model";
import mongoose, { Mongoose, Types } from "mongoose";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TOrder } from "./order.interface";
import { orderValidations } from "./order.validation";
import { User } from "../user/user.model";

const generateOrderId = async (): Promise<string> => {
  const lastOrder = await OrderModel.findOne()
    .sort({ orderId: -1 })
    .select("orderId");

  if (lastOrder && lastOrder.orderId) {
    const lastOrderNumber = parseInt(lastOrder.orderId, 10);
    return (lastOrderNumber + 1).toString();
  }
  return "1001";
};

const createOrder = async (orderData: TOrder) => {
  const orderId = await generateOrderId();

  const data = { ...orderData, orderId };
  console.log({ data });

  // // Validate order data using Zod
  // const validatedOrder = orderValidations.createOrderSchema.parse({
  //   ...orderData,
  //   orderId,
  // });

  // console.log("validatedOrder", { validatedOrder });
  // Save order in the database
  const newOrder = await OrderModel.create(data);
  console.log({ newOrder });
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
