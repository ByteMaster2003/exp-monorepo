import { RateLimiter } from "shared-utils";

import { AppConfig } from "../config/index.js";

export const rateLimiter = new RateLimiter(AppConfig.NODE_ENV);
