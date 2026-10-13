import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { authValidationsSchema } from "./auth.validations";
import { authControllers } from "./auth.controllers";
import { Auth } from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.interface";

const router = express.Router();

router.post(
  "/login",
  validateRequest(authValidationsSchema.loginValidationSchema),
  authControllers.loginUser
);
// The refresh token travels in an httpOnly cookie, not the body.
router.post("/refresh-token", authControllers.refreshToken);
router.post(
  "/forgot-password",
  validateRequest(authValidationsSchema.forgotPasswordValidationSchema),
  authControllers.forgotPassword
);
router.post(
  "/reset-password",
  validateRequest(authValidationsSchema.resetPasswordValidationSchema),
  authControllers.resetPassword
);
router.post(
  "/change-password",
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.user),
  validateRequest(authValidationsSchema.changePasswordValidationSchema),
  authControllers.changePassword
);

export const authRoutes = router;
