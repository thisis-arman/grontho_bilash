import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { paymentServices } from "./payment.services";

// Controller to create a payment
const createPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentServices.createPayment(req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "Payment created successfully.",
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
  const result = await paymentServices.getPayments();
  sendResponse(res, {
    statusCode: 200,
    message: "Payments fetched successfully",
    success: true,
    data: result,
  });
});



const getPaymentsByEmail = catchAsync(async (req, res) => {
  const result = await paymentServices.getPaymentsByUser(req.params.email);

  sendResponse(res, {
    statusCode: 200,
    message: "payments retrieved successfully by email",
    data: result,
    success: true,
  });
});


// Controller to update a payment by ID
const updatePayment = catchAsync(async (req: Request, res: Response) => {
  const paymentId = req.params.id;
  const updateData = req.body;
  const result = await paymentServices.updatePaymentStatus(
    paymentId,
    updateData
  );
  sendResponse(res, {
    statusCode: 200,
    message: "Payment updated successfully.",
    success: true,
    data: result,
  });
});

export const paymentController = {
  createPayment,
  getPayment,
  getPayments,
  updatePayment,
  getPaymentsByEmail,
};
