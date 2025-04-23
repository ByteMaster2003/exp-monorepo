import { Schema, model } from "mongoose";

import { toJSON, paginate } from "../plugins/index.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      require: true
    },
    email: {
      type: String,
      require: true,
      unique: true
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
    password: String,
    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User"
    },
    picture: String,
    authProviders: {
      type: [String],
      default: []
    },
    apps: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

const UserModel = model("users", userSchema);

export { UserModel, userSchema };
