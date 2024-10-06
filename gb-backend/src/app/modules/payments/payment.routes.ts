import express from "express";
import { paymentController } from "./payment.controllers";

const router = express.Router();

router.post("/", paymentController.createPayment); // Create a new payment
router.get("/:id", paymentController.getPayment); // Get a single payment by ID
router.get("/", paymentController.getPayments); // Get all payments
// router.delete("/:id", paymentController.deletePayment); // Delete a payment by ID (commented out)
router.patch("/:id", paymentController.updatePayment); // Update payment status by ID

export const paymentRoutes = router;
