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
router.post(
  "/refresh-token",
  validateRequest(authValidationsSchema.refreshTokenValidationSchema),
  authControllers.refreshToken
);
router.post(
  "/forgot-password",
  authControllers.refreshToken
);
router.post(
  "/change-password",
  authControllers.refreshToken
);

export const authRoutes = router;
