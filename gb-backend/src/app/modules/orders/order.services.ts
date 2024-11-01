import { OrderModel } from "./order.model";
import { Types } from "mongoose";
// Custom application error handler
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TOrder } from "./order.interface";
import { orderValidations } from "./order.validation";

// Service to create an order
const createOrder = async (orderData: TOrder) => {
  // Validate the incoming order data using Zod
  const validatedOrder = orderValidations.createOrderSchema.parse(orderData);

  // Create the new order in the database
  const newOrder = await OrderModel.create(validatedOrder);
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

export const orderServices = {
  createOrder,
  getOrderById,
  updateOrderById,
  deleteOrderById,
  getOrdersFromDB,
};
