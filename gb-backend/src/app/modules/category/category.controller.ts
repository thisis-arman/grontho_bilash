import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import categoryService from "./category.service";

const createLevel = catchAsync(async (req, res) => {
  const result = await categoryService.createLevelIntoDB(req.body);
  console.log(result);
  sendResponse(res, {
    success: true,
    message: "Level created successfully",
    statusCode: 200,
    data: result,
  });
});
const getLevels = catchAsync(async (req, res) => {
  const result = await categoryService.getLevelFromDB();
  console.log(result);
  sendResponse(res, {
    success: true,
    message: "Levels retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

const createFaculty = catchAsync(async (req, res) => {
  const result = await categoryService.createFacultyIntoDB(req.body);
  sendResponse(res, {
    success: true,
    message: "Faculty created successfully",
    statusCode: 200,
    data: result,
  });
});
const getFaculties = catchAsync(async (req, res) => {
  const result = await categoryService.getFacultiesFromDB();
  sendResponse(res, {
    success: true,
    message: "Faculties retrieved successfully",
    statusCode: 200,
    data: result,
  });
});
const createDepartment = catchAsync(async (req, res) => {
  const result = await categoryService.createDepartmentIntoDB(req.body);
  sendResponse(res, {
    success: true,
    message: "Department created successfully",
    statusCode: 200,
    data: result,
  });
});

const getDepartments = catchAsync(async (req, res) => {
  const result = await categoryService.getDepartmentsFromDB();
  sendResponse(res, {
    success: true,
    message: "Departments retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

export default {
  createLevel,
  getLevels,
  createDepartment,
  getDepartments,
  createFaculty,
  getFaculties,
};
