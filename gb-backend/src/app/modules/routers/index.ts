import express, { Router } from "express";
import { userRoutes } from "../user/user.route";
import { otpRoutes } from "../otp/otp.route";
import { authRoutes } from "../auth/auth.routes";
import { bookRoutes } from "../book/book.route";
import { orderRoutes } from "../orders/order.route";

const router = Router();

const moduleRouter = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/otp",
    route: otpRoutes,
  },
  {
    path: "/orders",
    route: orderRoutes,
  },
  {
    path: "/books",
    route: bookRoutes,
  },
];

moduleRouter.forEach((route) => router.use(route.path, route.route));

export default router;
