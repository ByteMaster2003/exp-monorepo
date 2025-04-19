import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      require: true
    },
    email: {
      type: String,
      require: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    phoneNumber: String,
    isPhoneNumberVerified: {
      type: Boolean,
      default: false
    },
    password: String
  },
  { timestamps: true }
);

export const UserModel = model("users", userSchema);
