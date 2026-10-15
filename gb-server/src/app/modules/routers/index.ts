import express, { Router } from "express";
import { userRoutes } from "../user/user.route";
import { otpRoutes } from "../otp/otp.route";
import { authRoutes } from "../auth/auth.routes";
import { bookRoutes } from "../book/product.route";
import { orderRoutes } from "../orders/order.route";
import { paymentRoutes } from "../payments/payment.routes";
import { categoryRoutes } from "../category/category.route";
import { blogRoutes } from "../blogs/blog.route";
import { suggestionRoutes } from "../suggestion/suggestion.route";
import { uploadRoutes } from "../upload/upload.route";
import { seoRoutes } from "../seo/seo.route";

const router = Router();

const moduleRouter = [
    {
    path: '/',
    route:categoryRoutes
  },
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
  {
    path: "/payments",
    route: paymentRoutes,
  },
  {
    path: "/blogs",
    route: blogRoutes,
  },
  {
    path: "/suggestions",
    route: suggestionRoutes,
  },
  {
    path: "/uploads",
    route: uploadRoutes,
  },
  {
    path: "/seo",
    route: seoRoutes,
  },

];

moduleRouter.forEach((route) => router.use(route.path, route.route));

export default router;
