import express, { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { userControllers } from "./user.controller";
import { userValidationSchema } from "./user.validation";
import { Auth } from "../../middlewares/auth";
import { USER_ROLE } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(userValidationSchema.userZodSchema),
  userControllers.createUser
);
router.get(
  "/",
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  userControllers.getUsers
);
router.put(
  "/update-user/:id",
  Auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  userControllers.updateUserInfo
);

export const userRoutes = router;
