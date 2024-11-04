import { Schema, model, Types } from "mongoose";
import { TDepartment, TFaculty } from "./category.interface";

// Level Schema
const LevelSchema = new Schema({
  level: {
    type: String,
    required: true,
    
  },
  levelId: {
    type: String,
    required: true,
    unique: true,
  },
  faculty: {
    type: String,
    required: true,
  },
});

export const Level = model("Level", LevelSchema);

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
  department: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: false,
  },
  level: {
    type: Schema.Types.ObjectId,
    ref: "Level",
    required: true,
    },
  
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
  level: {
    type: Schema.Types.ObjectId,
    ref: "Level",
    required: true,
  },
  faculty: {
    type: Schema.Types.ObjectId,
    ref: "Faculty",
    required: true,
  },
});

export const Department = model("Department", DepartmentSchema);
