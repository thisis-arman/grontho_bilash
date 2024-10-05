import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { authValidationsSchema } from "./auth.validations";
import { authControllers } from "./auth.controllers";

const router = express.Router();

router.post(
  "/login",
  validateRequest(authValidationsSchema.loginValidationSchema),
  authControllers.loginUser
);

export const authRoutes = router;
