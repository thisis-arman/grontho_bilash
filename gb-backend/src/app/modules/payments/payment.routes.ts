import express from "express";
import { paymentController } from "./payment.controllers";

const router = express.Router();


router.post("/create-payment-intent", paymentController.createPaymentIntents); 
router.post("/", paymentController.createPayment); 
router.get("/:id", paymentController.getPayment); 
router.get("/", paymentController.getPayments);
// router.delete("/:id", paymentController.deletePayment);
router.patch("/:id", paymentController.updatePayment); // Update payment status by ID

export const paymentRoutes = router;
