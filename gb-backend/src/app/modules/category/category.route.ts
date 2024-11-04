import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { DepartmentZodSchema, FacultyZodSchema, LevelZodSchema } from './category.validation';
import categoryController from './category.controller';
// import { express } from 'express'
const router = Router();



router.post('/level/create-level', validateRequest(LevelZodSchema), categoryController.createLevel);
router.post('/faculty/create-faculty', validateRequest(FacultyZodSchema), categoryController.createFaculty);
router.post('/department/create-department', validateRequest(DepartmentZodSchema), categoryController.createDepartment);


export const categoryRoutes = router;