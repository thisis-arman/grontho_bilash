import { OrderModel } from "./order.model";
import { Types } from "mongoose";
// Custom application error handler
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TOrder } from "./order.interface";
import { orderValidations } from "./order.validation";
import { User } from "../user/user.model";

// Function to generate a unique orderId
const generateOrderId = async (): Promise<string> => {
  // Get the last order sorted by orderId in descending order
  const lastOrder = await OrderModel.findOne()
    .sort({ orderId: -1 })
    .select("orderId");

  if (lastOrder && lastOrder.orderId) {
    // Extract the numeric part and increment
    const lastOrderNumber = parseInt(lastOrder.orderId, 10);
    return (lastOrderNumber + 1).toString();
  }

  // If no orders exist, start from 1001
  return "1001";
};

// Service to create an order
const createOrder = async (orderData: TOrder) => {
  // Generate unique order ID
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
  if (!Types.ObjectId.isValid(orderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid order ID");
  }

  const order = await OrderModel.findById(orderId)
    .populate("book")
    .populate("buyer")
    .populate("seller");

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return order;
};

const getOrdersFromDB = async () => {
  const orders = await OrderModel.find()
    .populate("seller")
    .populate("buyer")
    .populate("book");
  return orders;
};
// Service to update an order by ID
const updateOrderById = async (
  orderId: string,
  updateData: Partial<TOrder>
) => {
  if (!Types.ObjectId.isValid(orderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid order ID");
  }

  // Validate the incoming data using Zod for only the fields being updated
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

  const orders = await OrderModel.find({ buyer: userId })
    .populate("buyer")

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
