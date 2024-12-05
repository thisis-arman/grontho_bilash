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
const getSingleLevelFromDB = async (_id: string) => {
  const data = await EducationCategory.findOne({ _id })
    .populate({
      path: "faculties", // Populate faculties array
      populate: {
        path: "departments", // Further populate departments inside each faculty
      },
    })
    .exec();

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
const getFacultyFromDB = async (_id: string) => {
  console.log({_id});
  const data = await Faculty.findOne({ _id }).populate({
    path:'departments'
  });
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
const getDepartmentFromDB = async (_id:string) => {
  const departments = await Department.findOne({_id});
  return departments;
};

export default {
  createLevelIntoDB,
  getDepartmentFromDB,
  getLevelFromDB,
  getFacultyFromDB,
  getSingleLevelFromDB,
  createFacultyIntoDB,
  getFacultiesFromDB,
  createDepartmentIntoDB,
  getDepartmentsFromDB,
};
