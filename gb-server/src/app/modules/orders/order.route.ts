import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { orderController } from "./order.controllers";
import { zodValidationSchema } from "../book/book.validation";
import { orderValidations } from "./order.validation";
import { Auth } from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.interface";

const router = express.Router();

router.get(
  "/",
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  orderController.getOrders
);

router.post(
  "/create-order",
  validateRequest(orderValidations.createOrderSchema),
  orderController.createOrder
);

router.patch("/:orderId", orderController.updateOrder);

router.get("/:orderId", orderController.getOrder);

router.get("/orderbyuserid/:userid", orderController.getOrdersByUserId);

router.delete("/:orderId", orderController.deleteOrder);


export const orderRoutes = router;
