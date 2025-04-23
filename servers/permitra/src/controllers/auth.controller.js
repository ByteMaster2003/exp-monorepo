import bcrypt from "bcryptjs";
import { UserModel } from "db-services/models";
import { catchAsync, ApiError, httpStatus } from "shared-utils";

import authService from "../services/auth.service.js";
import { tokenUtil, redisClient } from "../utils/index.js";

const register = catchAsync(async (req, res) => {
  const { app, state, name, email, password } = req.body;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists, please login!");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword
  });

  const authCode = await authService.generateAuthCode(newUser._id.toString(), app);
  return res.status(httpStatus.OK).json({
    success: true,
    code: authCode,
    app,
    state
  });
});

const login = catchAsync(async (req, res) => {
  const { app, state, email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, httpStatus[httpStatus.NOT_FOUND]);
  }

  if (!user.password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password not found, use OAuth providers!");
  }
  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Wrong credentials!");
  }

  const authCode = await authService.generateAuthCode(user._id.toString(), app);
  return res.status(httpStatus.OK).json({
    success: true,
    code: authCode,
    app,
    state
  });
});

const logout = catchAsync(async (req, res) => {
  const { id: userId, app } = req.user;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, httpStatus[httpStatus.NOT_FOUND]);
  }

  // Delete access and refresh token from db;
  const accessCacheKey = tokenUtil._getCacheKey("access", { userId, app });
  const refreshCacheKey = tokenUtil._getCacheKey("refresh", { userId, app });
  await redisClient.del(accessCacheKey, refreshCacheKey);
  res.clearCookie("refreshToken");

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Logged Out Successfully"
  });
});

const resetPasswordRequest = catchAsync(async (_req, _res) => {});

const resetPasswordConfirm = catchAsync(async (_req, _res) => {});

export default { register, login, logout, resetPasswordRequest, resetPasswordConfirm };
