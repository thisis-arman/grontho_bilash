import { Types } from "mongoose";

export type TBook = {
  user:Types.ObjectId,
  bookTitle: string;
  price: number;
  description: string;
  condition: "fresh" | "used";
  level: Types.ObjectId;
  faculty: string;
  department: string;
  isPublished: boolean;
  isContactNoHidden: boolean;
  isNegotiable: boolean;
  images: string[]; 
  publicationYear: number; 
  transactionDate?: Date; 
  location: string; 
  deliveryOption: "pickup"|"shipping";
  shippingCost?: number; 
};


type TLevel = {
  level: string; // ssc,hsc,bachelor,master
  levelId: string;
  faculty: string;
};
type TFaculty = {
  facultyId:string;
  faculty: string; // science,humanities,bba,bsc,bss
  facultyShorts:string; //bba, 
  department?: Types.ObjectId;// ,
  level:Types.ObjectId
}
type TDepartment = {
  deptId: string;
  department: string; //accounting,chemistry,english
  deptShorts: string;
  level: Types.ObjectId;
  faculty: Types.ObjectId;
};