import { pick } from "../../utils/pick";
import { TUser } from "./user.interface";
import { User } from "./user.model";

const createUserIntoDB = async (userInfo: TUser) => {
  console.log(userInfo.name);
  const isUserExists = await User.isUserExistsByEmail(userInfo.email);

  if (isUserExists) {
    throw new Error(`User ${userInfo.email} already exists`);
  }

  const user = await User.create(userInfo);
  console.log({ user });
  return user;
};

const getLoggedInUserFromDB = async (email:string) => {
  const user = await User.findOne({email});
  return user;
};
const getUsersFromDB = async () => {
  const users = await User.find({ isDeleted: false });
  return users;
};

const updateUserInfo = async (
  id: string,
  payload: Record<string, any>,
  loggedInUserEmail: string,
  loggedInUserRole: string
) => {
  const userToUpdate = await User.findById(id);
  if (!userToUpdate || userToUpdate.isDeleted) {
    throw new Error("User not found or deleted");
  }

  // Security check: if role is 'user', they can only update their own profile
  if (loggedInUserRole === "user" && userToUpdate.email !== loggedInUserEmail) {
    throw new Error("You are not authorized to update this profile");
  }

  const allowedFields = loggedInUserRole === "user" ? ["name", "contactNo"] : ["name", "status", "role", "contactNo"];
  const dataToUpdate = pick(payload, allowedFields);

  if (Object.keys(dataToUpdate).length === 0) {
    throw new Error("No valid fields to update");
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: dataToUpdate },
    { new: true, runValidators: true } 
  );

  if (!updatedUser) {
    throw new Error("User not found or deleted");
  }

  return updatedUser;
};

const deleteUser = async (id: string, loggedInUserEmail: string, loggedInUserRole: string) => {
  const userToDelete = await User.findById(id);
  if (!userToDelete || userToDelete.isDeleted) {
    throw new Error("User not found or already deleted");
  }

  // Security check: if role is 'user', they can only delete their own profile
  if (loggedInUserRole === "user" && userToDelete.email !== loggedInUserEmail) {
    throw new Error("You are not authorized to deactivate this account");
  }

  const deletedUser = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );

  return deletedUser;
};

export const userServices = {
  createUserIntoDB,
  getUsersFromDB,
  updateUserInfo,
  getLoggedInUserFromDB,
  deleteUser
};
