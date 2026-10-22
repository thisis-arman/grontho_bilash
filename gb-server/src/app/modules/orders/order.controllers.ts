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
  sendResponse(res, { statusCode: 200, message: "মোট খরচ হিসাব করা হয়েছে", success: true, data: result });
});

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const validatedPayload = orderValidations.createOrderSchema.parse(req.body);
  const result = await orderServices.createOrder(validatedPayload, req.user);

  sendResponse(res, {
    statusCode: 201,
    message:
      result.length > 1
        ? `${result.length}টি অর্ডার সফলভাবে করা হয়েছে (বিক্রেতা অনুযায়ী ভাগ করা হয়েছে)`
        : "অর্ডার সফলভাবে করা হয়েছে",
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
    message: "অর্ডারের তথ্য পাওয়া গেছে",
    success: true,
    data: result,
  });
});

// Controller to get all orders
const getOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await orderServices.getOrdersFromDB();
  sendResponse(res, {
    statusCode: 200,
    message: "অর্ডারগুলোর তথ্য পাওয়া গেছে",
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
    message: "অর্ডারটি বাতিল করা হয়েছে",
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
    message: "অর্ডারটি আপডেট হয়েছে",
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
    message: "অর্ডারগুলোর তথ্য পাওয়া গেছে",
    success: true,
    data: result,
  });
});

const getMySales = catchAsync(async (req: Request, res: Response) => {
  const result = await orderServices.getSalesBySeller(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    message: "বিক্রির তথ্য পাওয়া গেছে",
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
