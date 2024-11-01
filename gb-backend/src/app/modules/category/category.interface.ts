import { Types } from "mongoose";

export type TLevel = {
  level: string; // ssc,hsc,bachelor,master
  levelId: string;
  faculty: string;
};
export type TFaculty = {
  facultyId: string;
  faculty: string; // science,humanities,bba,bsc,bss
  facultyShorts: string; //bba,
  department?: Types.ObjectId; // ,
  level: Types.ObjectId;
};
export type TDepartment = {
  deptId: string;
  department: string; //accounting,chemistry,english
  deptShorts: string;
  level: Types.ObjectId;
  faculty: Types.ObjectId;
};
