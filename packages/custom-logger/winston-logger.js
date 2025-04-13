import winston from "winston";

import { RedisTransport } from "./transports.js";

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const socketLogFormat = winston.format.printf(({ timestamp, level, message, metadata, data }) => {
  const eventType = `[==================== ${message} ====================]`;
  let logMessage = `${timestamp} ${level}: ${eventType} ${JSON.stringify(metadata, null, 2)}\n`;

  if (data) {
    logMessage = `${logMessage}Data: ${JSON.stringify(data)}\n`;
  }

  return logMessage;
});

/**
 * Creates customized Winston logger instances for general and socket logging
 * @param {string} NODE_ENV - Node environment ('development' or 'production')
 * @param {Object} redisClient - Redis client instance for log transport
 * @param {string} streamName - Redis stream name for general logs
 * @param {string} socketStreamName - Redis stream name for socket logs
 * @returns {{
 *   Logger: import('winston').Logger,
 *   SocketLogger: import('winston').Logger
 * }} Object containing both logger instances
 *
 * @example
 * // Create loggers with Redis transport
 * const { Logger, SocketLogger } = createCustomLogger(
 *   'development',
 *   redisClient,
 *   'app:logs',
 *   'app:socket:logs'
 * );
 *
 * // Use general logger
 * Logger.info('Application started');
 * Logger.error('Error occurred', new Error('Database connection failed'));
 *
 * // Use socket logger with metadata
 * SocketLogger.info('WebSocket Connection', {
 *   metadata: { userId: '123', event: 'connect' },
 *   data: { timestamp: Date.now() }
 * });
 *
 * @description
 * Creates two Winston logger instances:
 * 1. General Logger: For application-wide logging
 * 2. Socket Logger: For WebSocket-specific logging with detailed metadata
 *
 * Both loggers:
 * - Use Redis streams for transport
 * - Support different log levels based on NODE_ENV
 * - Include timestamps in IST timezone
 * - Handle error objects automatically
 */
export function createCustomLogger(NODE_ENV, redisClient, streamName, socketStreamName) {
  const isDevEnv = NODE_ENV === "development";
  const level = isDevEnv ? "debug" : "info";
  const loggerTransports = [new RedisTransport({ streamName, redisClient })];
  const socketLoggerTransports = [
    new RedisTransport({ streamName: socketStreamName, redisClient })
  ];

  if (isDevEnv) {
    loggerTransports.push(
      new winston.transports.Console({
        stderrLevels: ["error"],
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
          })
        )
      })
    );
    socketLoggerTransports.push(
      new winston.transports.Console({
        stderrLevels: ["error"],
        format: winston.format.combine(winston.format.colorize(), socketLogFormat)
      })
    );
  }

  const Logger = winston.createLogger({
    level,
    format: winston.format.combine(
      enumerateErrorFormat(),
      winston.format.timestamp({
        format: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      }),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} ${level}: ${message}`;
      })
    ),
    transports: loggerTransports
  });

  const SocketLogger = winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp({
        format: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      }),
      socketLogFormat
    ),
    transports: socketLoggerTransports
  });

  return { Logger, SocketLogger };
}
