import { Schema, model, connect } from "mongoose";

const userSchema = new Schema(
  {
    name: String,
    email: String
  },
  { timestamps: true }
);

const UserModel = model("users", userSchema);

async function ConnectDB() {
  return await connect("mongodb://localhost:27017/monorepo");
}

async function createUser(payload) {
  return await UserModel.create(payload);
}

async function getUsers() {
  return await UserModel.find();
}

export { UserModel, userSchema, createUser, getUsers, ConnectDB };
