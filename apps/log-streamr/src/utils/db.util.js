import { DatabaseConnection, RdsConnectionManager } from "db-services";

import { AppConfig } from "../config/index.js";

export const dbConnection = new DatabaseConnection();
export const redisClient = await RdsConnectionManager.getClient(AppConfig.REDIS.URL);
