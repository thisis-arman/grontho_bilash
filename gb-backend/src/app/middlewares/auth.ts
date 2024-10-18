import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../errors/AppError";

import config from "../config";
import { User } from "../modules/user/user.model";
import { TUserRoles } from "../modules/user/user.interface";
import catchAsync from "../utils/catchAsync";

export const Auth = (...requiredRoles: TUserRoles[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
      throw new AppError(httpStatus.NOT_FOUND, "token is not found.");
    }
    console.log("18", token);

    const decoded = jwt.verify(token, config.jwt_access_secret as string);

    if (!decoded) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    console.log("decoded => ", decoded);
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

    if (
      user.passwordChangedAt &&
      User.isJWTIssuedBeforePasswordChanged(
        user.passwordChangedAt,
        iat as number
      )
    ) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized !");
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized !");
    }

    req.user = decoded as JwtPayload & { role: string };
    next();
  });
};
