import { ApiError, catchAsync, httpStatus } from "shared-utils";

import { Logger } from "../config/index.js";
import { tokenUtil, redisClient } from "../utils/index.js";

export const verifyAccess = catchAsync(async (req, _, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies.accessToken;

  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, httpStatus[httpStatus.UNAUTHORIZED]);
  }

  const payload = await tokenUtil.verifyAccessToken(token);
  req.user = payload;
  next();
});

function getCookieValue(cookieString, key) {
  const match = cookieString?.match(new RegExp(`${key}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const authSocketSession = async (socket, next) => {
  // Check accessToken in query params, headers, and auth (priority order)

  const accessToken =
    getCookieValue(socket.handshake.headers?.cookie, "accessToken") || // Check cookies
    socket.handshake.query?.token || // Check query params
    socket.handshake.headers?.token || // Check headers
    socket.handshake.auth?.token; // Check auth object

  if (!accessToken) {
    return next(new Error("Authentication error"));
  }

  // Verify the accessToken
  try {
    const payload = await tokenUtil.verifyAccessToken(accessToken);
    const userId = payload.id;
    const userSocketKey = `socket:user:${userId}`;

    // Use Redis SETNX (SET if Not eXists) with expiry
    const lockAcquired = await redisClient.set(userSocketKey, socket.id, "EX", 30, "NX");

    if (!lockAcquired) {
      return next(new Error("User already connected from another device"));
    }

    // Store user data
    socket.user = payload;

    // Setup periodic refresh of the lock
    const refreshInterval = setInterval(async () => {
      await redisClient.expire(userSocketKey, 30);
    }, 20000); // Refresh every 20 seconds

    socket.on("disconnect", async () => {
      // Clear interval on disconnect
      clearInterval(refreshInterval);
      await redisClient.del(userSocketKey);

      // Leave users personal room on disconnect
      socket.leave(`user:${userId}`);
      Logger.info({
        message: `User disconnected: ${socket.user.id}`
      });
    });
    next();
  } catch (error) {
    return next(error);
  }
};
