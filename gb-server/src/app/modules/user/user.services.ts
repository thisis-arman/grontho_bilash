import { TUser } from "./user.interface";
import { User } from "./user.model";

const createUserIntoDB = async (userInfo: TUser) => {
  console.log(userInfo.name);
  const isUserExists = await User.isUserExistsByEmail(userInfo.email);

  if (isUserExists) {
    throw new Error(`User ${userInfo.email} already exists`);
  }

  const user = await User.create(userInfo);
  console.log({user});
  return user;
};

const getUsersFromDB = async () => {
  const users = await User.find({isDeleted:false});
  return users;
};

const updateUserInfo= async(id:string)=>{
  const user= await User.find({_id:id, isDeleted:false});
  if(!user){
    return "User not found!";
  }
  return user;
}

export const userServices = {
  createUserIntoDB,
  getUsersFromDB,
};
