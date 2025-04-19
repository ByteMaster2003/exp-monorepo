import { createCustomLogger } from "custom-logger";

import { AppConfig } from "./env.config.js";
import { redisClient } from "../utils/index.js";

/**
 * Application logger instance for general logging
 * @type {{
 *   Logger: import('winston').Logger,
 *   SocketLogger: import('winston').Logger
 * }}
 * @example
 * Logger.info('Application started');
 * Logger.error('Error occurred', new Error('Something went wrong'));
 * Logger.debug('Debug information');
 */
export const { Logger, SocketLogger } = createCustomLogger(
  AppConfig.NODE_ENV,
  AppConfig.PROJECT_NAME,
  redisClient,
  AppConfig.REDIS.LOG_STREAM,
  AppConfig.REDIS.SOCKET_LOG_STREAM
);
