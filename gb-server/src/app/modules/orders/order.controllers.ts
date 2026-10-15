import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { orderServices } from "./order.services";
import { orderValidations } from "./order.validation";


// Public: guests can see real totals in their bag too. A valid login, if
// sent, lets the quote flag the buyer's own listings.
const getQuote = catchAsync(async (req: Request, res: Response) => {
  const payload = orderValidations.quoteSchema.parse(req.body);
  let buyerId: string | undefined;
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (token) {
    try {
      buyerId = (jwt.verify(token, config.jwt_access_secret as string) as JwtPayload).id;
    } catch {
      // Expired or invalid: quote as a guest.
    }
  }
  const result = await orderServices.getQuote(payload, buyerId);
  sendResponse(res, { statusCode: 200, message: "Quote calculated", success: true, data: result });
});

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const validatedPayload = orderValidations.createOrderSchema.parse(req.body);
  const result = await orderServices.createOrder(validatedPayload, req.user);

  sendResponse(res, {
    statusCode: 201,
    message:
      result.length > 1
        ? `${result.length} orders created successfully (split by seller)`
        : "Order created successfully",
    success: true,
    data: result,
  });
});


const getOrder = catchAsync(async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  //console.log("order id___",orderId);
  const result = await orderServices.getOrderById(orderId, req.user);
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
  const orderId = req.params.orderId;
  const result = await orderServices.deleteOrderById(orderId, req.user);
  sendResponse(res, {
    statusCode: 200,
    message: "Order cancelled successfully",
    success: true,
    data: result,
  });
});

// Controller to update an order by ID
const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  const updateData = req.body;
  const result = await orderServices.updateOrderById(
    orderId,
    updateData,
    req.user
  );
  sendResponse(res, {
    statusCode: 200,
    message: "Order updated successfully",
    success: true,
    data: result,
  });
});

const getOrdersByUserId = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userid;
  //console.log(userId, "get orders by user id");
  const result = await orderServices.getOrdersByUserId(userId, req.user);
  sendResponse(res, {
    statusCode: 200,
    message: "Orders fetched successfully",
    success: true,
    data: result,
  });
});

const getMySales = catchAsync(async (req: Request, res: Response) => {
  const result = await orderServices.getSalesBySeller(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    message: "Sales fetched successfully",
    success: true,
    data: result,
  });
});

export const orderController = {
  getQuote,
  getMySales,
  createOrder,
  getOrder,
  getOrders,
  deleteOrder,
  updateOrder,
  getOrdersByUserId,
};
