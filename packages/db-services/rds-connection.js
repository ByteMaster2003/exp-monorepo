import IORedis from "ioredis";

import { BootstrapLogger } from "./config/logger.config.js";

/**
 * Redis connection manager class
 * Manages multiple Redis client instances with automatic connection reuse
 * @class RedisConnectionManager
 *
 * @example
 * // Import the singleton instance
 * import { RdsConnectionManager } from './rds-connection';
 *
 * // Get Redis client for specific URL
 * const client1 = await RdsConnectionManager.getClient('redis://localhost:6379/0');
 * await client1.set('key', 'value');
 *
 * // Same URL returns existing instance
 * const client2 = await RdsConnectionManager.getClient('redis://localhost:6379/0');
 * const value = await client2.get('key');
 *
 * // Different URL creates new instance
 * const client3 = await RdsConnectionManager.getClient('redis://localhost:6379/1');
 *
 * // Close all connections when done
 * await RdsConnectionManager.closeAll();
 */
class RedisConnectionManager {
  /**
   * Creates a new RedisConnectionManager instance
   * Initializes an empty Map to store client instances
   */
  constructor() {
    /**
     * Map to store Redis client instances
     * @private
     * @type {Map<string, IORedis>}
     */
    this.clients = new Map();
  }

  /**
   * Gets an existing Redis client or creates a new one for the given URL
   * @param {string} redisUrl - Redis connection URL (e.g., 'redis://localhost:6379/0')
   * @returns {Promise<IORedis>} Redis client instance
   * @throws {Error} If connection fails
   *
   * @example
   * // Connect to Redis
   * try {
   *   const client = await RdsConnectionManager.getClient('redis://localhost:6379/0');
   *
   *   // Use the client
   *   await client.set('user:1', JSON.stringify({ name: 'John' }));
   *   const user = await client.get('user:1');
   *
   *   // Multiple calls with same URL return the same instance
   *   const sameClient = await RdsConnectionManager.getClient('redis://localhost:6379/0');
   *   console.log(client === sameClient); // true
   * } catch (error) {
   *   console.error('Redis connection failed:', error);
   * }
   */
  async getClient(redisUrl) {
    // Check if client already exists
    if (this.clients.has(redisUrl)) {
      BootstrapLogger.info(`Reusing existing Redis connection for ${redisUrl}`);
      return this.clients.get(redisUrl);
    }

    // Create new client
    const client = new IORedis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      retryStrategy(times) {
        return Math.min(times * 50, 2000);
      }
    });

    // Attach event listeners
    client.on("ready", () => {
      BootstrapLogger.info(`Redis connected successfully to ${redisUrl}`);
    });

    client.on("error", (error) => {
      BootstrapLogger.error(`Redis connection error for ${redisUrl}: ${error.message}`);
    });

    client.on("end", () => {
      BootstrapLogger.warn(`Redis connection ended for ${redisUrl}`);
      // Remove client from map when connection ends
      this.clients.delete(redisUrl);
    });

    // Store client in map
    this.clients.set(redisUrl, client);

    // Wait for connection to be ready
    await client.connect().catch((error) => {
      BootstrapLogger.error(`Failed to connect to Redis at ${redisUrl}: ${error.message}`);
      throw error;
    });

    return client;
  }

  /**
   * Closes all active Redis connections and clears the client map
   * @returns {Promise<void>}
   * @throws {Error} If any connection fails to close properly
   *
   * @example
   * // Close all Redis connections gracefully
   * try {
   *   await RdsConnectionManager.closeAll();
   *   console.log('All Redis connections closed');
   * } catch (error) {
   *   console.error('Failed to close Redis connections:', error);
   * }
   */
  async closeAll() {
    const closePromises = Array.from(this.clients.values()).map((client) =>
      client
        .quit()
        .catch((error) => BootstrapLogger.error(`Error closing Redis connection: ${error.message}`))
    );

    await Promise.all(closePromises);
    this.clients.clear();
  }
}

/**
 * Singleton instance of RedisConnectionManager
 * @type {RedisConnectionManager}
 */
export const RdsConnectionManager = new RedisConnectionManager();
