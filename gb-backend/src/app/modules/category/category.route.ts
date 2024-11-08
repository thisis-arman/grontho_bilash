import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import {
  DepartmentZodSchema,
  EducationCategoryZodSchema,
  FacultyZodSchema,
} from "./category.validation";
import categoryController from "./category.controller";
// import { express } from 'express'
const router = Router();

router.post(
  "/level/create-level",
  validateRequest(EducationCategoryZodSchema),
  categoryController.createLevel
);
router.get("/levels", categoryController.getLevels);
router.post("/faculty/create-faculty",validateRequest(FacultyZodSchema),categoryController.createFaculty);
router.get("/faculties", categoryController.getFaculties);
router.post("/department/create-department",validateRequest(DepartmentZodSchema),categoryController.createDepartment);
router.get("/departments", categoryController.getDepartments);

export const categoryRoutes = router;
