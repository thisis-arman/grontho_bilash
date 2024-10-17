import jwt, { JwtPayload }  from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../errors/AppError";

import config from "../config";
import { User } from "../modules/user/user.model";
import { TUserRoles } from "../modules/user/user.interface";
import catchAsync from "../utils/catchAsync";



export const auth =  (...requiredRoles:TUserRoles[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized.");
    }

    const decoded = jwt.verify(token, config.jwt_access_secret as string) as JwtPayload;
    const { email, role, iat, exp } = decoded;
    const user = await User.isUserExistsByEmail(email);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
    }

    if (user?.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, "User is deleted");
    }
    if (user.status == "blocked") {
      throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
      }
      
       if (requiredRoles && !requiredRoles.includes(role)) {
         throw new AppError(
           httpStatus.UNAUTHORIZED,
           "You are not authorized !"
         );
       }

       req.user = decoded as JwtPayload & { role: string };
       next();
  });
};
