import { TUser } from "./user.interface";
import { UserModel } from "./user.model";

const createUserIntoDB = (userInfo: TUser) => {
  const user = UserModel.create(userInfo);

  return user;
};


export const userServices = {
    createUserIntoDB,

}