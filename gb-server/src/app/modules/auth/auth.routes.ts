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
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.user),
  authControllers.changePassword
);

export const authRoutes = router;
