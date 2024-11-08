import { TDepartment, TEducationCategory, TFaculty,  } from "./category.interface";
import { Department, EducationCategory, Faculty } from "./category.model";

const createLevelIntoDB = async (level: TEducationCategory) => {
  const data = await EducationCategory.create(level);
  return data;
};
const getLevelFromDB = async () => {
  const data = await EducationCategory.find();
  return data;
};
const createFacultyIntoDB = async (faculty: TFaculty) => {
  const data = await Faculty.create(faculty);
  return data;
};
const getFacultiesFromDB= async () => {
  const data = await Faculty.find();
  return data;
};

const createDepartmentIntoDB = async (data: TDepartment) => {
  const department = await Department.create(data);
  return department;
};
const getDepartmentsFromDB = async () => {
  const departments = await Department.find();
  return departments;
};

export default {
  createLevelIntoDB,
  getLevelFromDB,
  createFacultyIntoDB,
  getFacultiesFromDB,
  createDepartmentIntoDB,
  getDepartmentsFromDB,
};
