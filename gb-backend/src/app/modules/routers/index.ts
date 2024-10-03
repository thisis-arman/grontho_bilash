import express, { Router } from "express";
import { userRoutes } from "../user/user.route";
import { otpRoutes } from "../otp/otp.route";

const router =Router();

const moduleRouter = [
  {
    path: "user",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: otpRoutes,
  },
];

moduleRouter.forEach((route) => router.use(route.path, route.route));

export default router;
