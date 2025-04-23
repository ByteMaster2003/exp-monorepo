declare module "db-services/models" {
  import { Model, Schema } from "mongoose";

  // User related types
  interface IUser {
    name: string;
    email: string;
    isEmailVerified: boolean;
    phoneNumber?: string;
    isPhoneNumberVerified: boolean;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }

  // Log related types
  interface ILog {
    project: string;
    timestamp: Date;
    level: "info" | "error" | "debug" | "warn";
    message: string;
    query?: string;
    params?: string;
    body?: string;
    stack?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  // Export both models and schemas
  export const UserModel: Model<IUser>;
  export const userSchema: Schema<IUser>;

  export const LogModel: Model<ILog>;
  export const logSchema: Schema<ILog>;
}
