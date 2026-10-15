import httpStatus from "http-status";
import config from "../../config";
import AppError from "../../errors/AppError";
import { otpServices } from "../otp/otp.services";
import { User } from "../user/user.model";
import { TLoginUser } from "./auth.interface";
import { createToken, verifyToken } from "./auth.utils";

// bcrypt hash of a random string; only used to spend the same time as a
// real password check when the email is unknown.
const DUMMY_HASH = "$2b$12$ml.7sLgGADrNBiRz4ANAEuJ7ofFizOrriMOHm1uB82L3e3rDuTEky";

const loginUser = async (payload: TLoginUser) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload.email);

  // Same message for "no such user" and "wrong password" so the login form
  // cannot be used to discover registered emails. The dummy comparison keeps
  // the response time the same in both cases.
  if (!user) {
    await User.isPasswordMatched(payload.password, DUMMY_HASH);
    throw new AppError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }
  // checking if the user is already deleted

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new Error("This user is deleted !");
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === "blocked") {
    throw new Error("This user is blocked ! !");
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(httpStatus.UNAUTHORIZED, "Incorrect email or password");

  //create token and sent to the  client

  const jwtPayload = {
    email: user.email,
    role: user.role,
    id: user._id,
    name: user.name
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needsUpdateProfile: user?.needsUpdateProfile,
  };
};

const refreshToken =async (token: string) => {
  let decoded;
  try {
    decoded = verifyToken(token, config.jwt_refresh_secret as string);
  } catch {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Your session has expired. Please log in again."
    );
  }
  const { email, iat } = decoded;

  const user = await User.isUserExistsByEmail(email);

  // Any of these means the session must end, so they are all 401s.
  if (
    !user ||
    user.isDeleted ||
    user.status === "blocked" ||
    (user.passwordChangedAt &&
      User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number))
  ) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Your session has expired. Please log in again."
    );
  }
    const jwtPayload = {
      email: user.email,
      role: user.role,
      id: user._id,
      name: user.name,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string
    );

    return {
      accessToken,
    };
};

const changePassword = async (email: string, oldPassword: string, newPassword: string) => {
  const user = await User.isUserExistsByEmail(email);
  if (!user) {
    throw new Error("This user is not found !");
  }
  if (user.isDeleted) {
    throw new Error("This user is deleted !");
  }
  if (user.status === "blocked") {
    throw new Error("This user is blocked !");
  }

  // Check if old password matches
  const isPasswordMatch = await User.isPasswordMatched(oldPassword, user.password);
  if (!isPasswordMatch) {
    throw new Error("Old password does not match!");
  }

  // Update password and passwordChangedAt (triggers the pre-save bcrypt hash middleware)
  (user as any).password = newPassword;
  (user as any).passwordChangedAt = new Date();
  await (user as any).save();
};

const forgotPassword = async (email: string) => {
  const user = await User.isUserExistsByEmail(email);
  if (!user || user.isDeleted || user.status === "blocked") return;

  await otpServices.createAndSendOtp(email);
};

const resetPassword = async (
  email: string,
  otp: string | number,
  newPassword: string
) => {
  const user = await User.isUserExistsByEmail(email);
  const result =
    user && !user.isDeleted && user.status !== "blocked"
      ? await otpServices.verifyOtp(email, otp)
      : null;

  if (!user || !result?.verified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired code");
  }

  // The code is single-use.
  await otpServices.consumeVerifiedEmail(email);

  (user as any).password = newPassword;
  (user as any).passwordChangedAt = new Date();
  await (user as any).save();
};

export const authServices = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
