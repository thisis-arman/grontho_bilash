import { TDepartment, TFaculty, TLevel } from "./category.interface";
import { Department, Level } from "./category.model";

const createLevelIntoDB = async (level: TLevel) => {
  const data = await Level.create(level);
  return data;
};
const createFacultyIntoDB = async (faculty: TFaculty) => {
  const data = await Level.create(faculty);
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
