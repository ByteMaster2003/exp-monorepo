import bcrypt from "bcryptjs";
import { UserModel } from "db-services/models";
import { catchAsync, ApiError, httpStatus } from "shared-utils";

import { tokenUtil, encryptionUtil, redisClient } from "../utils/index.js";

async function signTokensAndUpdateCookies(user) {
  // Sign access token with encrypted payload
  const accessTokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const encryptedATP = encryptionUtil.encrypt(JSON.stringify(accessTokenPayload));
  const accessToken = await tokenUtil.signAccessToken(user.id, {
    data: encryptedATP
  });

  // Sign refresh token with encrypted payload
  const refershTokenPayload = {
    id: user.id
  };
  const encryptedRTP = encryptionUtil.encrypt(JSON.stringify(refershTokenPayload));
  const refreshToken = await tokenUtil.signAccessToken(user.id, {
    data: encryptedRTP
  });

  return { accessToken, refreshToken };
}

const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists, please login!");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  let newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword
  });
  newUser = newUser.toJSON();

  // Sign token and save it to cookies
  const { accessToken, refreshToken } = await signTokensAndUpdateCookies(newUser, res);

  return res.status(httpStatus.CREATED).json({
    success: true,
    message: "Registered Successfully",
    data: newUser,
    accessToken,
    refreshToken
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  let user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, httpStatus[httpStatus.NOT_FOUND]);
  }
  user = user.toJSON();

  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Wrong credentials!");
  }

  const { accessToken, refreshToken } = await signTokensAndUpdateCookies(user, res);

  return res.status(httpStatus.OK).json({
    success: true,
    data: user,
    accessToken,
    refreshToken
  });
});

const logout = catchAsync(async (req, res) => {
  const { id: userId } = req.user;

  let user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, httpStatus[httpStatus.NOT_FOUND]);
  }
  user = user.toJSON();

  // Delete access and refresh token from db;
  const accessCacheKey = tokenUtil._getCacheKey("access", userId);
  const refreshCacheKey = tokenUtil._getCacheKey("refresh", userId);
  await redisClient.del(accessCacheKey, refreshCacheKey);

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Logged Out Successfully"
  });
});

const resetPasswordRequest = catchAsync(async (_req, _res) => {});

const resetPasswordConfirm = catchAsync(async (_req, _res) => {});

export default { register, login, logout, resetPasswordRequest, resetPasswordConfirm };
