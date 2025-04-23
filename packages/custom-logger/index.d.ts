declare module "custom-logger" {
	import IORedis from "ioredis";

  /**
   * Creates customized Winston logger instances for general and socket logging
   * @param {string} NODE_ENV - Node environment ('development' or 'production')
   * @param {string} projectName - projectName
   * @param {IORedis} redisClient - Redis client instance for log transport
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
  function createCustomLogger(
    NODE_ENV: string,
    projectName: string,
    redisClient: IORedis,
    streamName: string,
    socketStreamName: string
  ): {
    Logger: import("winston").Logger;
    SocketLogger: import("winston").Logger;
  };

	interface BullMQTransportOptions {
		queueName: string,
		redisClient: IORedis
	}

	interface RedisTransportOptions {
		redisClient: IORedis,
		streamName: string,
		projectName: string
	}

	class BullMQTransport  {
		constructor(opts: BullMQTransportOptions);

		log(info: any, callback: any): Promise<any>;
	}

	class RedisTransport  {
		constructor(opts: RedisTransportOptions);

		log(info: any, callback: any): Promise<any>;
	}
}
