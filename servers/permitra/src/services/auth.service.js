import { nanoid } from "nanoid";

import { redisClient, tokenUtil, encryptionUtil } from "../utils/index.js";

const signTokenAndGenerateAuthCode = async (user, app, refresh = false) => {
  // Sign access and refresh tokens
  const userId = String(user._id);
  const accessTokenPayload = {
    id: userId,
    app,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    picture: user.picture
  };
  const encryptedPayload = encryptionUtil.encrypt(JSON.stringify(accessTokenPayload));
  const accessToken = await tokenUtil.signAccessToken(userId, { data: encryptedPayload });

  const refreshEncryptedPayload = encryptionUtil.encrypt(JSON.stringify({ id: userId, app }));
  const refreshToken = await tokenUtil.signRefreshToken(userId, {
    data: refreshEncryptedPayload
  });

  if (refresh) {
    return { accessToken, refreshToken, accessTokenPayload };
  }

  const authCode = nanoid(32);
  await redisClient.setex(`auth_code:${authCode}`, 60, JSON.stringify({ id: userId, app }));

  return authCode;
};

export default { signTokenAndGenerateAuthCode };
