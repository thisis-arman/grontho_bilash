import express from "express";
import { orderController } from "./order.controllers";
import { Auth } from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.interface";

const router = express.Router();

const anyUser = Auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin);

router.get(
  "/",
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  orderController.getOrders
);

// Payload is validated in the controller (the schema uses .refine(), which
// validateRequest's AnyZodObject signature does not accept).
router.post("/quote", orderController.getQuote);
router.post("/create-order", anyUser, orderController.createOrder);

router.get("/my-sales", anyUser, orderController.getMySales);

// Ownership is enforced in the service for everything below.
router.get("/orderbyuserid/:userid", anyUser, orderController.getOrdersByUserId);

router.get("/:orderId", anyUser, orderController.getOrder);

router.patch("/:orderId", anyUser, orderController.updateOrder);

router.delete("/:orderId", anyUser, orderController.deleteOrder);

export const orderRoutes = router;
