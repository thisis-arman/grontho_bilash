import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { orderServices } from "./order.services";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await orderServices.createOrder(req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "Order created successfully",
    success: true,
    data: result,
  });
});

const getOrder = catchAsync(async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  console.log("order id___",orderId);
  const result = await orderServices.getOrderById(orderId);
  sendResponse(res, {
    statusCode: 200,
    message: "Order fetched successfully",
    success: true,
    data: result,
  });
});

// Controller to get all orders
const getOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await orderServices.getOrdersFromDB();
  sendResponse(res, {
    statusCode: 200,
    message: "Orders fetched successfully",
    success: true,
    data: result,
  });
});

// Controller to delete an order by ID
const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const orderId = req.params.id;
  const result = await orderServices.deleteOrderById(orderId);
  sendResponse(res, {
    statusCode: 200,
    message: "Order deleted successfully",
    success: true,
    data: result,
  });
});

// Controller to update an order by ID
const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const orderId = req.params.id;
  const updateData = req.body;
  const result = await orderServices.updateOrderById(orderId, updateData);
  sendResponse(res, {
    statusCode: 200,
    message: "Order updated successfully",
    success: true,
    data: result,
  });
});

const getOrdersByUserId = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userid;
  console.log(userId, "get orders by user id");
  const result = await orderServices.getOrdersByUserId(userId);
  sendResponse(res, {
    statusCode: 200,
    message: "Orders fetched successfully",
    success: true,
    data: result,
  });
});

export const orderController = {
  createOrder,
  getOrder,
  getOrders,
  deleteOrder,
  updateOrder,
  getOrdersByUserId,
};
