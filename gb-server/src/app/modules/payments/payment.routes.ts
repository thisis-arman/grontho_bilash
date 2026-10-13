import express from "express";
import { paymentController } from "./payment.controllers";
import { Auth } from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.interface";

const router = express.Router();

// Card payments are not part of the live checkout yet (orders are COD /
// bKash), so the whole module is admin-only until it is wired up properly
// with server-side amounts.
router.use(Auth(USER_ROLE.admin, USER_ROLE.superAdmin));

router.post("/create-payment-intent", paymentController.createPaymentIntents);
router.post("/", paymentController.createPayment);
router.get("/:id", paymentController.getPayment);
router.get("/", paymentController.getPayments);
router.patch("/:id", paymentController.updatePayment); // Update payment status by ID

export const paymentRoutes = router;
