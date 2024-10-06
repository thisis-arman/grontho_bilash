import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

// Controller to create a payment
const createPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentServices.createPayment(req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "Payment created successfully",
    success: true,
    data: result,
  });
});

// Controller to get a single payment by ID
const getPayment = catchAsync(async (req: Request, res: Response) => {
  const paymentId = req.params.id;
  const result = await paymentServices.getPaymentById(paymentId);
  sendResponse(res, {
    statusCode: 200,
    message: "Payment fetched successfully",
    success: true,
    data: result,
  });
});

// Controller to get all payments
const getPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentServices.getPaymentsFromDB();
  sendResponse(res, {
    statusCode: 200,
    message: "Payments fetched successfully",
    success: true,
    data: result,
  });
});

// Controller to delete a payment by ID
const deletePayment = catchAsync(async (req: Request, res: Response) => {
  const paymentId = req.params.id;
  const result = await paymentServices.deletePaymentById(paymentId);
  sendResponse(res, {
    statusCode: 200,
    message: "Payment deleted successfully",
    success: true,
    data: result,
  });
});

// Controller to update a payment by ID
const updatePayment = catchAsync(async (req: Request, res: Response) => {
  const paymentId = req.params.id;
  const updateData = req.body;
  const result = await paymentServices.updatePaymentById(paymentId, updateData);
  sendResponse(res, {
    statusCode: 200,
    message: "Payment updated successfully",
    success: true,
    data: result,
  });
});

export const paymentController = {
  createPayment,
  getPayment,
  getPayments,
  deletePayment,
  updatePayment,
};
