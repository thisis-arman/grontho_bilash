// payment.services.ts
import { Payment } from "./payment.model";
import { TPayment } from "./payment.interface";

const createPayment = async (paymentData: TPayment): Promise<TPayment> => {
  const payment = new Payment(paymentData);
  return await payment.save();
};

const getPaymentById = async (paymentId: string): Promise<TPayment | null> => {
  return await Payment.findOne({ paymentId });
};

const updatePaymentStatus = async (
  paymentId: string,
  status: TPayment["paymentStatus"]
): Promise<TPayment | null> => {
  return await Payment.findOneAndUpdate(
    { paymentId },
    { paymentStatus: status, transactionDate: new Date() },
    { new: true }
  );
};

const getPaymentsByUser = async (userId: string): Promise<TPayment[]> => {
  return await Payment.find({ userId });
};

const refundPayment = async (paymentId: string): Promise<TPayment | null> => {
  return await Payment.findOneAndUpdate(
    { paymentId },
    { isRefunded: true, refundDate: new Date(), paymentStatus: "refunded" },
    { new: true }
  );
};

export const paymentServices = {
  refundPayment,
  getPaymentsByUser,
  updatePaymentStatus,
  getPaymentById,
  createPayment,
};
