import { nanoid } from "nanoid";

import { redisClient, tokenUtil } from "../utils/index.js";

const signAccessAndRefreshTokens = async (user, app) => {
  const userId = String(user._id);
  const keys = { userId, app };

  const userData = {
    id: userId,
    keys,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    picture: user.picture
  };
  const accessToken = await tokenUtil.signAccessToken(keys, userData);
  const refreshToken = await tokenUtil.signRefreshToken(keys, { id: userId, keys });

  return { accessToken, refreshToken, userData };
};

const generateAuthCode = async (userId, app) => {
  const authCode = nanoid(32);
  await redisClient.setex(`auth_code:${app}:${authCode}`, 60, JSON.stringify({ id: userId, app }));

  return authCode;
};

export default { signAccessAndRefreshTokens, generateAuthCode };
