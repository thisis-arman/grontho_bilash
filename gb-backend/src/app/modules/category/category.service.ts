import { TDepartment, TEducationCategory, TFaculty,  } from "./category.interface";
import { Department, EducationCategory, Faculty } from "./category.model";

const createLevelIntoDB = async (level: TEducationCategory) => {
  const data = await EducationCategory.create(level);
  return data;
};
const createFacultyIntoDB = async (faculty: TFaculty) => {
  const data = await Faculty.create(faculty);
  return data;
};

const createDepartmentIntoDB = async (data: TDepartment) => {
  const department = await Department.create(data);
  return department;
};

export default {
  createLevelIntoDB,
  createFacultyIntoDB,
  createDepartmentIntoDB,
};
