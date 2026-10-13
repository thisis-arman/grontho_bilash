import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import {
  DepartmentZodSchema,
  EducationCategoryZodSchema,
  FacultyZodSchema,
} from "./category.validation";
import categoryController from "./category.controller";
import { Auth } from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.interface";

const adminOnly = Auth(USER_ROLE.admin, USER_ROLE.superAdmin);
// import { express } from 'express'
const router = Router();

router.post(
  "/level/create-level",
  adminOnly,
  validateRequest(EducationCategoryZodSchema),
  categoryController.createLevel
);
router.get("/levels", categoryController.getLevels);
router.get("/level", categoryController.getSingleLevels);
router.post(
  "/faculty/create-faculty",
  adminOnly,
  validateRequest(FacultyZodSchema),
  categoryController.createFaculty
);
router.get("/faculties", categoryController.getFaculties);
router.get("/faculty", categoryController.getFaculty);
router.post(
  "/department/create-department",
  adminOnly,
  validateRequest(DepartmentZodSchema),
  categoryController.createDepartment
);
router.get("/departments", categoryController.getDepartments);
router.get("/department", categoryController.getDepartment);

export const categoryRoutes = router;
