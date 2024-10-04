import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { userControllers } from "./user.controller";
import { userValidationSchema } from "./user.validation";

const router = express.Router();

router.post("/register",validateRequest(userValidationSchema.userZodSchema),userControllers.createUser);

export const userRoutes = router;
