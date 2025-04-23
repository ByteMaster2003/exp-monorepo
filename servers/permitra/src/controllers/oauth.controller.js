/* eslint-disable camelcase */
import axios from "axios";
import { UserModel } from "db-services/models";
import { nanoid } from "nanoid";
import { ApiError, catchAsync, httpStatus } from "shared-utils";

import { AppConfig, Logger } from "../config/index.js";
import authService from "../services/auth.service.js";
import { tokenUtil, redisClient, encryptionUtil } from "../utils/index.js";

const clientRedirects = {
  "control-deck": AppConfig.AUTH.CONTROL_DECK_AUTH_URI,
  restify: AppConfig.AUTH.RESTIFY_AUTH_URI
};
const oauthRedirects = {
  google: `${AppConfig.AUTH.PERMITRA_BASE_URI}/google/callback`,
  github: `${AppConfig.AUTH.PERMITRA_BASE_URI}/github/callback`
};
const permitra_error_redirect = AppConfig.AUTH.PERMITRA_ERR_URI;

const authorizeGoogle = async (req, res) => {
  const { app, state } = req.query;

  try {
    // Save the auth state
    const stateId = nanoid();
    const jsonString = JSON.stringify({ app, nonce: state, id: stateId });
    await redisClient.setex(`google_oauth_state:${stateId}`, 600, jsonString);

    const params = new URLSearchParams({
      client_id: AppConfig.GOOGLE.CLIENT_ID,
      redirect_uri: oauthRedirects.google,
      response_type: "code",
      scope: "openid email profile",
      state: jsonString
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.redirect(url);
  } catch (error) {
    Logger.error(`GET /google/authorize: ${error.stack}`);
    res.redirect(`${permitra_error_redirect}?error=${error.message}`);
  }
};

const googleCallback = async (req, res) => {
  const { code, state } = req.query;

  try {
    const stateData = JSON.parse(state);

    // verify state
    const googleOauthStateKey = `google_oauth_state:${stateData.id}`;
    const storedState = await redisClient.get(googleOauthStateKey);
    if (!storedState) {
      return res.redirect(`${permitra_error_redirect}&error=Expired Session!`);
    } else {
      await redisClient.del(googleOauthStateKey);
    }

    // Get tokens
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: AppConfig.GOOGLE.CLIENT_ID,
      client_secret: AppConfig.GOOGLE.SECRET_KEY,
      code,
      grant_type: "authorization_code",
      redirect_uri: oauthRedirects.google
    });

    // Get user info
    const userInfo = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
    });

    let user = await UserModel.findOne({ email: userInfo.data.email });
    if (!user) {
      user = await UserModel.create({
        name: userInfo.data.name,
        email: userInfo.data.email,
        picture: userInfo.data.picture,
        isEmailVerified: userInfo.data.email_verified,
        authProviders: ["google"]
      });
    } else {
      if (!user.authProviders.includes("google")) {
        user = await UserModel.updateOne(
          { email: user.email },
          { $push: { authProviders: "google" } }
        );
      }
      if (!user.apps.includes(stateData.app)) {
        user = await UserModel.updateOne({ email: user.email }, { $push: { apps: stateData.app } });
      }
    }

    const authCode = await authService.signTokenAndGenerateAuthCode(user, stateData.app);
    res.redirect(`${clientRedirects[stateData.app]}?code=${authCode}&state=${stateData.nonce}`);
  } catch (error) {
    Logger.error(`GET /google/authorize: ${error.stack}`);
    res.redirect(`${permitra_error_redirect}?error=${error.message}`);
  }
};

const authorizeGitHub = catchAsync(async (_req, _res) => {});
const githubCallback = catchAsync(async (_req, _res) => {});

const exchangeTokenWithCode = catchAsync(async (req, res) => {
  const { app, code } = req.body;

  const state = await redisClient.get(`auth_code:${code}`);
  if (!state) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired code!");
  }

  // Remove auth code
  await redisClient.del(`auth_code:${code}`);
  const stateData = JSON.parse(state);

  // Validate app and redirect
  if (app !== stateData.app) throw new ApiError(httpStatus.BAD_REQUEST, "App mismatch!");

  // Get access and refresh tokens
  const accessToken = await redisClient.get(tokenUtil._getCacheKey("access", stateData.id));
  const refreshToken = await redisClient.get(tokenUtil._getCacheKey("refresh", stateData.id));

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "None",
    maxAge: AppConfig.AUTH.REFRESH_TOKEN_EXPIRY
  });

  return res.status(httpStatus.OK).json({
    success: true,
    accessToken,
    refreshToken
  });
});

const getUserInfo = catchAsync(async (req, res) => {
  const accessToken = req.cookies.accessToken || req.headers?.authorization?.replace("Bearer ", "");

  if (!accessToken) throw new ApiError(httpStatus.BAD_REQUEST, "Access token not found!");

  const payload = await tokenUtil.verifyAccessToken(accessToken);
  const jsonString = encryptionUtil.decrypt(payload.data);
  const userData = JSON.parse(jsonString);

  return res.status(httpStatus.OK).json({
    success: true,
    user: userData
  });
});

const refreshTokens = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }

  // Verify refresh token
  const payload = await tokenUtil.verifyRefreshToken(refreshToken);
  const jsonString = encryptionUtil.decrypt(payload.data);
  const { id, app } = JSON.parse(jsonString);

  // Get user data
  const user = await UserModel.findById(id);

  // Sign new pair of tokens
  const {
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenPayload
  } = await authService.signTokenAndGenerateAuthCode(user, app, true);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "None",
    maxAge: AppConfig.AUTH.REFRESH_TOKEN_EXPIRY
  });

  return res.status(httpStatus.OK).json({
    success: true,
    accessToken,
    refreshToken: newRefreshToken,
    user: accessTokenPayload
  });
});

export default {
  authorizeGoogle,
  authorizeGitHub,
  googleCallback,
  githubCallback,
  exchangeTokenWithCode,
  getUserInfo,
  refreshTokens
};
