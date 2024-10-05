import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { orderController } from "./order.controllers";
import { zodValidationSchema } from "../book/book.validation";
import { orderValidations } from "./order.validation";

const router = express.Router();

// Route to create a new order
router.post(
  "/create-order",
  validateRequest(orderValidations.createOrderSchema),
  orderController.createOrder
);

// Route to update an existing order by its orderId
router.patch(
  "/:orderId",
  orderController.updateOrder
);

// Route to get an order by its orderId
router.get("/:orderId", orderController.getOrder);

// Route to delete an order by its orderId
router.delete("/:orderId", orderController.deleteOrder);

// Route to get all orders
router.get("/orders", orderController.getOrders);

export const orderRoutes = router;
