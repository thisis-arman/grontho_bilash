import express, { Router } from "express";
import { userRoutes } from "../user/user.route";
import { otpRoutes } from "../otp/otp.route";

const router =Router();

const moduleRouter = [
  {
    path: "/auth",
    route: userRoutes,
  },
  {
    path: "/otp",
    route: otpRoutes,
  },
];

moduleRouter.forEach((route) => router.use(route.path, route.route));

export default router;
