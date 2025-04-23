/* eslint-disable camelcase */
import axios from "axios";
import { UserModel } from "db-services/models";
import { nanoid } from "nanoid";
import { ApiError, catchAsync, httpStatus } from "shared-utils";

import { AppConfig, Logger } from "../config/index.js";
import authService from "../services/auth.service.js";
import { tokenUtil, redisClient } from "../utils/index.js";

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
        pictures: [userInfo.data.picture],
        picture: userInfo.data.picture,
        isEmailVerified: userInfo.data.email_verified,
        authProviders: ["google"],
        apps: [stateData.app]
      });
    } else {
      if (!user.authProviders.includes("google")) {
        user = await UserModel.findOneAndUpdate(
          { email: user.email },
          {
            $push: { authProviders: "google" },
            $set: {
              pictures: [...user?.pictures, userInfo.data.picture],
              picture: userInfo.data.picture
            }
          }
        );
      }
      if (!user.apps.includes(stateData.app)) {
        user = await UserModel.findOneAndUpdate(
          { email: user.email },
          { $push: { apps: stateData.app } }
        );
      }
    }

    const authCode = await authService.generateAuthCode(user._id.toString(), stateData.app);
    res.redirect(`${clientRedirects[stateData.app]}?code=${authCode}&state=${stateData.nonce}`);
  } catch (error) {
    Logger.error(`GET /google/authorize: ${error.stack}`);
    res.redirect(`${permitra_error_redirect}?error=${error.message}`);
  }
};

const authorizeGitHub = async (req, res) => {
  const { app, state } = req.query;

  try {
    // Save the auth state
    const stateId = nanoid();
    const jsonString = JSON.stringify({ app, nonce: state, id: stateId });
    await redisClient.setex(`github_oauth_state:${stateId}`, 600, jsonString);

    const params = new URLSearchParams({
      client_id: AppConfig.GITHUB.CLIENT_ID,
      redirect_uri: oauthRedirects.github,
      scope: "user",
      state: jsonString
    });

    const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
    res.redirect(url);
  } catch (error) {
    Logger.error(`GET /github/authorize: ${error.stack}`);
    res.redirect(`${permitra_error_redirect}?error=${error.message}`);
  }
};

const githubCallback = async (req, res) => {
  const { code, state } = req.query;

  try {
    const stateData = JSON.parse(state);

    // verify state
    const githubOauthStateKey = `github_oauth_state:${stateData.id}`;
    const storedState = await redisClient.get(githubOauthStateKey);
    if (!storedState) {
      return res.redirect(`${permitra_error_redirect}&error=Expired Session!`);
    } else {
      await redisClient.del(githubOauthStateKey);
    }

    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: AppConfig.GITHUB.CLIENT_ID,
        client_secret: AppConfig.GITHUB.SECRET_KEY,
        code,
        redirect_uri: oauthRedirects.github
      },
      {
        headers: { Accept: "application/json" }
      }
    );

    const userInfo = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
    });

    let user = await UserModel.findOne({ email: userInfo.data.email });
    if (!user) {
      user = await UserModel.create({
        githubUserName: userInfo.data.login,
        name: userInfo.data.name,
        email: userInfo.data.email,
        pictures: [userInfo.data.avatar_url],
        picture: userInfo.data.avatar_url,
        isEmailVerified: true,
        authProviders: ["github"],
        apps: [stateData.app]
      });
    } else {
      if (!user.authProviders.includes("github")) {
        user = await UserModel.findOneAndUpdate(
          { email: user.email },
          {
            $push: { authProviders: "github" },
            $set: {
              githubUserName: userInfo.data.login,
              pictures: [...user?.pictures, userInfo.data.avatar_url],
              picture: userInfo.data.avatar_url
            }
          }
        );
      }
      if (!user.apps.includes(stateData.app)) {
        user = await UserModel.findOneAndUpdate(
          { email: user.email },
          { $push: { apps: stateData.app } }
        );
      }
    }

    const authCode = await authService.generateAuthCode(user._id.toString(), stateData.app);
    res.redirect(`${clientRedirects[stateData.app]}?code=${authCode}&state=${stateData.nonce}`);
  } catch (error) {
    Logger.error(`GET /github/authorize: ${error.stack}`);
    res.redirect(`${permitra_error_redirect}?error=${error.message}`);
  }
};

const exchangeTokenWithCode = catchAsync(async (req, res) => {
  const { app, code } = req.body;

  const state = await redisClient.get(`auth_code:${app}:${code}`);
  if (!state) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired code!");
  }

  // Remove auth code
  await redisClient.del(`auth_code:${code}`);
  const stateData = JSON.parse(state);

  const user = await UserModel.findById(stateData.id);

  // Sign new pair of tokens
  const {
    accessToken,
    refreshToken: newRefreshToken,
    userData
  } = await authService.signAccessAndRefreshTokens(user, app);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "None",
    maxAge: AppConfig.AUTH.ACCESS_TOKEN_EXPIRY * 1000
  });
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "None",
    maxAge: AppConfig.AUTH.REFRESH_TOKEN_EXPIRY * 1000
  });

  return res.status(httpStatus.OK).json({
    success: true,
    accessToken,
    user: userData
  });
});

const getUserInfo = catchAsync(async (req, res) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid access token");
  }

  const userData = await tokenUtil.verifyAccessToken(accessToken);
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
  const { keys } = await tokenUtil.verifyRefreshToken(refreshToken);

  // Get user data
  const user = await UserModel.findById(keys?.userId);

  // Sign new pair of tokens
  const {
    accessToken,
    refreshToken: newRefreshToken,
    userData
  } = await authService.signAccessAndRefreshTokens(user, keys?.app);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "None",
    maxAge: AppConfig.AUTH.ACCESS_TOKEN_EXPIRY * 1000
  });
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "None",
    maxAge: AppConfig.AUTH.REFRESH_TOKEN_EXPIRY * 1000
  });

  return res.status(httpStatus.OK).json({
    success: true,
    accessToken,
    user: userData
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
