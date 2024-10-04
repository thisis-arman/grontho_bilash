import { model, Schema } from "mongoose";
import { TUser } from "./user.interface";



export const userSchema =new Schema<TUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    contactNo: {
      type: String,
      required: true,
      match: [/^\d{10,15}$/, "Please enter a valid contact number"],
    },
    password: {
      type: String,
      required: true,
    },
    needsUpdateProfile: {
      type: Boolean,
      default: true, 
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false, 
    },
  },
  {
    timestamps: true, 
  }
);



export const UserModel = model<TUser>("User",userSchema)