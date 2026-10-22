import { model, Schema } from "mongoose";
import { TUser, UserModel } from "./user.interface";
import bcrypt, { hash } from "bcrypt";
import config from "../../config";

export const userSchema = new Schema<TUser, UserModel>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, "অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দাও"],
    },
    contactNo: {
      type: String,
      required: true,
      match: [
        /^\+\d{1,4}\d{10,15}$/,
        "কান্ট্রি কোডসহ একটি সঠিক মোবাইল নম্বর দাও",
      ],
    },
    password: {
      type: String,
      required: true,
    },
    needsUpdateProfile: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Never serialise the password hash into an API response.
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  user.password = await bcrypt.hash(user.password, Number(config.salt_rounds));
  next();
});

userSchema.post("save", async function (doc, next) {
  doc.password = "";
  next();
});

// Case-insensitive, so "Name@Mail.com" and "name@mail.com" are the same
// account (older accounts may have been saved with capitals).
userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email: email?.trim() }).collation({
    locale: "en",
    strength: 2,
  });
};

userSchema.statics.isPasswordMatched = async function (
  plainPassword: string,
  hashedPassword: string
) {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Must stay synchronous: the auth middleware uses the result directly in a
// condition, and a Promise there is always truthy.
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number
) {
  const passwordChangedTime =
    Math.floor(new Date(passwordChangedTimestamp).getTime() / 1000);
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const User = model<TUser, UserModel>("User", userSchema);
