import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { isAdminRole } from "../../middlewares/auth";
import { pick } from "../../utils/pick";
import { otpServices } from "../otp/otp.services";
import { TUser } from "./user.interface";
import { User } from "./user.model";

const createUserIntoDB = async (userInfo: TUser) => {
  const isUserExists = await User.isUserExistsByEmail(userInfo.email);

  if (isUserExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      `${userInfo.email} ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে`
    );
  }

  // The email must have been verified by OTP; a client cannot skip that step
  // by calling this endpoint directly.
  await otpServices.consumeVerifiedEmail(userInfo.email);

  // Only these fields may come from the request. role/status are never
  // client-controlled at sign-up.
  const user = await User.create(
    pick(userInfo, ["name", "email", "contactNo", "password"])
  );
  return user;
};

const getLoggedInUserFromDB = async (
  email: string,
  loggedInUserEmail: string,
  loggedInUserRole: string
) => {
  if (email !== loggedInUserEmail && !isAdminRole(loggedInUserRole)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "এই প্রোফাইল দেখার অনুমতি তোমার নেই"
    );
  }
  const user = await User.findOne({ email });
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
    throw new Error("অ্যাকাউন্টটি খুঁজে পাওয়া যায়নি, অথবা মুছে ফেলা হয়েছে");
  }
  // Security check: if role is 'user', they can only update their own profile
  if (!isAdminRole(loggedInUserRole) && userToUpdate.email !== loggedInUserEmail) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "এই প্রোফাইল আপডেট করার অনুমতি তোমার নেই"
    );
  }

  const isSelf = userToUpdate.email === loggedInUserEmail;
  if (
    isSelf &&
    ((payload.role !== undefined && payload.role !== userToUpdate.role) ||
      payload.status === "blocked")
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "তুমি নিজের রোল পরিবর্তন বা নিজের অ্যাকাউন্ট ব্লক করতে পারবে না"
    );
  }

  const allowedFields = !isAdminRole(loggedInUserRole) ? ["name", "contactNo"] : ["name", "status", "role", "contactNo"];
  const dataToUpdate = pick(payload, allowedFields);
  //console.log({ dataToUpdate })

  if (Object.keys(dataToUpdate).length === 0) {
    throw new Error("আপডেট করার মতো কোনো সঠিক তথ্য দেওয়া হয়নি");
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: dataToUpdate },
    { new: true, runValidators: true }
  );
  //console.log({ updatedUser })
  if (!updatedUser) {
    throw new Error("অ্যাকাউন্টটি খুঁজে পাওয়া যায়নি, অথবা মুছে ফেলা হয়েছে");
  }

  return updatedUser;
};

const deleteUser = async (id: string, loggedInUserEmail: string, loggedInUserRole: string) => {
  const userToDelete = await User.findById(id);
  if (!userToDelete || userToDelete.isDeleted) {
    throw new Error("অ্যাকাউন্টটি খুঁজে পাওয়া যায়নি, অথবা আগেই মুছে ফেলা হয়েছে");
  }

  // Security check: if role is 'user', they can only delete their own profile
  if (!isAdminRole(loggedInUserRole) && userToDelete.email !== loggedInUserEmail) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "এই অ্যাকাউন্ট নিষ্ক্রিয় করার অনুমতি তোমার নেই"
    );
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
