import { TokenUtil } from "shared-utils";

import { redisClient } from "./db.util.js";
import { AppConfig } from "../config/index.js";

export const tokenUtil = new TokenUtil({
  access: {
    secret: AppConfig.AUTH.ACCESS_TOKEN_SECRET,
    expiryInSeconds: AppConfig.AUTH.ACCESS_TOKEN_EXPIRY,
    cacheKey: "auth:access:{userId}"
  },
  refresh: {
    secret: AppConfig.AUTH.REFRESH_TOKEN_SECRET,
    expiryInSeconds: AppConfig.AUTH.REFRESH_TOKEN_EXPIRY,
    cacheKey: "auth:refresh:{userId}"
  },
  issuer: "log-streamr",
  redisClient
});
