import express, { Router } from "express";
import { userRoutes } from "../user/user.route";
import { otpRoutes } from "../otp/otp.route";
import { authRoutes } from "../auth/auth.routes";

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
];

moduleRouter.forEach((route) => router.use(route.path, route.route));

export default router;
