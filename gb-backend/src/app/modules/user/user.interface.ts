import { Model } from "mongoose";

export interface TUser {
  name: string;
  email: string;
  contactNo: string;
  password: string;
  needsUpdateProfile: boolean;
  passwordChangedAt?: Date;
  role: "user" | "admin";
  status: "active" | "blocked";
  isDeleted: boolean;
}

export interface UserModel extends Model<TUser> {
  isUserExistsByEmail(email: string): Promise<TUser>;
  isPasswordMatched(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean>;

  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
}

export const USER_ROLE = {
  superAdmin: "superAdmin",
  user: "user",
  admin: "admin",
} as const;

export type TUserRoles = keyof typeof USER_ROLE;