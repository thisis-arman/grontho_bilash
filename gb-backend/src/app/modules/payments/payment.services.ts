// payment.services.ts
import { Payment } from "./payment.model";
import { TPayment } from "./payment.interface";
import config from "../../config";
const stripe = require("stripe")(config.stripe_sk);

const calculateOrderAmount = (items: { amount: number }[]) => {
  let total = 0;
  items.forEach((item) => {
    total += item.amount;
  });
  return total;
};

const createPaymentIntent = async ({
  amount,
  currency,
}: {
  amount: number;
  currency: string;
}) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
  });
  console.log("paymentIntent_________", paymentIntent);

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntent:paymentIntent.id,
  };
};

const createPayment = async (paymentData: TPayment): Promise<TPayment> => {
  const payment = new Payment(paymentData);
  return await payment.save();
};

const getPayments = async () => {
  const payments = await Payment.find();
  return payments;
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

const getPaymentsByUser = async (email: string): Promise<TPayment[]> => {
  return await Payment.find({ email });
};

const refundPayment = async (paymentId: string): Promise<TPayment | null> => {
  return await Payment.findOneAndUpdate(
    { paymentId },
    { isRefunded: true, refundDate: new Date(), paymentStatus: "refunded" },
    { new: true }
  );
};

export const paymentServices = {
  createPaymentIntent,
  refundPayment,
  getPayments,
  getPaymentsByUser,
  updatePaymentStatus,
  getPaymentById,
  createPayment,
};
