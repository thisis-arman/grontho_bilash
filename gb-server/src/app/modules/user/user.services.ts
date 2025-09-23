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

const getUsersFromDB = async () => {
  const users = await User.find({ isDeleted: false });
  return users;
};

 const updateUserInfo = async (id: string, payload: Partial<TUser>) => {
  // whitelist editable fields
  const allowedFields = ['name', 'status', 'role', 'contactNo'];
  const dataToUpdate = pick(payload, allowedFields);

  if (Object.keys(dataToUpdate).length === 0) {
    throw new Error('No valid fields to update');
  }

  // using findOneAndUpdate for atomic update
  const updatedUser = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: dataToUpdate },
    { new: true, runValidators: true } // runValidators to enforce schema rules
  );

  if (!updatedUser) {
    throw new Error('User not found or deleted');
  }

  return updatedUser;
};

export const userServices = {
  createUserIntoDB,
  getUsersFromDB,
  updateUserInfo
};
