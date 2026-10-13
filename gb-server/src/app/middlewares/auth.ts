import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../errors/AppError";

import config from "../config";
import { User } from "../modules/user/user.model";
import { TUserRoles, USER_ROLE } from "../modules/user/user.interface";
import catchAsync from "../utils/catchAsync";

export const isAdminRole = (role?: string) =>
  role === USER_ROLE.admin || role === USER_ROLE.superAdmin;

export const Auth = (...requiredRoles: TUserRoles[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Accept both "<token>" (what the client sends) and "Bearer <token>".
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not logged in.");
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string
      ) as JwtPayload;
    } catch {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Your session has expired. Please log in again."
      );
    }

    const { email, iat } = decoded;
    const user = await User.isUserExistsByEmail(email);
    if (!user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "This user is not found !");
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
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Your session has expired. Please log in again."
      );
    }

    // Role comes from the database, not the token, so a demoted or
    // promoted user takes effect immediately.
    const role = user.role as TUserRoles;
    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized !");
    }

    req.user = { ...decoded, id: String(user._id), email: user.email, role };
    next();
  });
};
