import express from "express";
import { userRoutes } from "../user/user.route";

const router = express.Router();

const moduleRouter = [
  {
    path: "user",
    route: userRoutes,
  },
];

moduleRouter.forEach((route) => router.use(route.path, route.route));

export default router;
