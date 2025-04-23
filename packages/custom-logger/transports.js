import { Queue } from "bullmq";
import Transport from "winston-transport";

/**
 * Custom Winston transport for BullMQ
 * @class BullMQTransport
 * @extends {Transport}
 */
class BullMQTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.queue = new Queue(opts.queueName, {
      connection: opts.redisClient,
      // Add retry configuration
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000
        }
      }
    });
    this.pendingLogs = [];
    this.isConnected = true;

    // Monitor connection status
    this.queue.on("error", () => {
      this.isConnected = false;
      this.startReconnection();
    });
  }

  async log(info, callback) {
    try {
      if (!this.isConnected) {
        // Store in memory if disconnected
        this.pendingLogs.push(info);
        return callback();
      }

      await this.queue.add("log", info);
      callback();
    } catch {
      // Store failed logs in memory
      this.pendingLogs.push(info);
      callback();
    }
  }

  async startReconnection() {
    while (!this.isConnected) {
      try {
        await this.queue.connect();
        this.isConnected = true;
        // Process pending logs
        await this.processPendingLogs();
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  async processPendingLogs() {
    while (this.pendingLogs.length > 0) {
      const log = this.pendingLogs.shift();

      try {
        await this.queue.add("log", log).catch(() => {
          this.pendingLogs.unshift(log);
        });
      } catch {
        // If failed, put the log back at the start of the queue
        this.pendingLogs.unshift(log);
        // Break the loop if we're disconnected again
        if (!this.isConnected) break;
      }
    }
  }
}

/**
 * Custom Winston transport for Redis Streams
 * @class RedisTransport
 * @extends {Transport}
 */
class RedisTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.redis = opts.redisClient;
    this.streamName = opts.streamName;
    this.projectName = opts.projectName;
    this.pendingLogs = [];
    this.isConnected = true;

    // Monitor Redis connection status
    this.redis.on("error", () => {
      this.isConnected = false;
      this.startReconnection();
    });

    this.redis.on("ready", () => {
      this.isConnected = true;
      this.processPendingLogs();
    });
  }

  /**
   * @param {Object} info - Log information
   * @param {Function} callback - Callback function
   */
  async log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    try {
      if (!this.isConnected) {
        // Store in memory if disconnected
        this.pendingLogs.push(info);
        return callback();
      }

      const args = [
        this.streamName,
        "*",
        "project",
        this.projectName,
        "timestamp",
        info.timestamp,
        "level",
        info.level,
        "message",
        info.message
      ];

      if (info.query) args.push("query", JSON.stringify(info.query));
      if (info.params) args.push("params", JSON.stringify(info.params));
      if (info.body) args.push("body", JSON.stringify(info.body));
      if (info.stack) args.push("stack", info.stack);
      if (info.metadata) args.push("metadata", JSON.stringify(info.metadata));
      if (info.data) args.push("data", JSON.stringify(info.data));

      await this.redis.xadd(...args);
      callback();
    } catch {
      // Store failed logs in memory
      this.pendingLogs.push(info);
      callback();
    }
  }

  /**
   * Attempts to reconnect to Redis
   * @private
   */
  async startReconnection() {
    while (!this.isConnected) {
      try {
        await this.redis.connect();
        this.isConnected = true;
        // Process pending logs after successful reconnection
        await this.processPendingLogs();
      } catch {
        // Wait 5 seconds before next retry
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Process logs that were stored during disconnection
   * @private
   */
  async processPendingLogs() {
    while (this.pendingLogs.length > 0) {
      const log = this.pendingLogs.shift();
      try {
        await this.redis.xadd(
          this.streamName,
          "*",
          "timestamp",
          log.timestamp,
          "level",
          log.level,
          "message",
          log.message
        );
      } catch {
        // If failed, put the log back at the start of the queue
        this.pendingLogs.unshift(log);
        // Break the loop if we're disconnected again
        if (!this.isConnected) break;
      }
    }
  }
}

export { BullMQTransport, RedisTransport };
