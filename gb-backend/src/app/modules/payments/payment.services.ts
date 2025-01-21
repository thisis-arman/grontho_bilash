// payment.services.ts
import { Payment } from "./payment.model";
import { TPayment } from "./payment.interface";
import config from "../../config";
const stripe = require("stripe")(config.stripe_sk
);


const calculateOrderAmount = (item) => {
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  let total = 0;
  item.forEach((item) => {
    total += item.amount;
  });
  return total;
};


const createPaymentIntent = async (item:Record<string,unknown>) => {
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(item),
    currency: "usd",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return({
    clientSecret: paymentIntent.client_secret,
    // [DEV]: For demo purposes only, you should avoid exposing the PaymentIntent ID in the client-side code.
    dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
  });
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
