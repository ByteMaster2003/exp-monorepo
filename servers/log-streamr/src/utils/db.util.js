import { DatabaseConnection, RdsConnectionManager } from "db-services";

import { AppConfig } from "../config/index.js";

export const dbConnection = new DatabaseConnection();

/**
 * Redis client instance for caching and message queues
 * @type {import('ioredis').Redis}
 * @description
 * Shared Redis client instance used for:
 * - Caching authentication tokens
 * - Managing log streams
 * - BullMQ job queues
 *
 * @example
 * // Using the Redis client
 * await redisClient.set('key', 'value', 'EX', 3600);
 * const value = await redisClient.get('key');
 *
 * // Using with streams
 * await redisClient.xadd('stream:logs', '*', 'message', 'Log entry');
 */
export const redisClient = await RdsConnectionManager.getClient(AppConfig.REDIS.URL);
