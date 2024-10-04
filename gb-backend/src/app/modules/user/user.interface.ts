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
