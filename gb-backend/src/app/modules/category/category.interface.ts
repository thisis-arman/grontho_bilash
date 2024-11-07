import { Types } from "mongoose";




export type TEducationCategory = {
  levelId: string;
  levelName: string;
  faculties: TFaculty[];
};

export type TFaculty = {
  facultyId: string;
  faculty: string; // science,humanities,bba,bsc,bss
  facultyShorts: string; //bba,
  departments: TDepartment[];
};

export type TDepartment = {
  deptId: string;
  department: string; //accounting,chemistry,english
  deptShorts: string;
};