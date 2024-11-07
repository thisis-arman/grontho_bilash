import { Schema, model, Types } from "mongoose";
import {
  TEducationCategory,
  TDepartment,
  TFaculty,
} from "./category.interface";

// EducationCategory Schema
const EducationCategorySchema = new Schema<TEducationCategory>({
  levelId: {
    type: String,
    required: true,
    unique: true,
  },
  levelName: {
    type: String,
    required: true,
  },
  faculties: [
    {
      type: Schema.Types.ObjectId,
      ref: "Faculty",
    },
  ],
});

export const EducationCategory = model(
  "EducationCategory",
  EducationCategorySchema
);

// Faculty Schema
const FacultySchema = new Schema<TFaculty>({
  facultyId: {
    type: String,
    required: true,
    unique: true,
  },
  faculty: {
    type: String,
    required: true,
  },
  facultyShorts: {
    type: String,
    required: true,
  },
  departments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
});

export const Faculty = model("Faculty", FacultySchema);

// Department Schema
const DepartmentSchema = new Schema<TDepartment>({
  deptId: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
  },
  deptShorts: {
    type: String,
    required: true,
  },
});

export const Department = model("Department", DepartmentSchema);
