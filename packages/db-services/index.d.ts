declare module "db-services" {
  import mongoose from "mongoose";
  import IORedis from "ioredis";

  /**
   * MongoDB connection manager class
   * @class DatabaseConnection
   */
  class DatabaseConnection {
    constructor();

    /**
     * Establishes a connection to MongoDB using Mongoose
     * @async
     * @param {string} MONGO_URI - MongoDB connection string
     * @returns {Promise<mongoose.Connection>} Mongoose connection object
     * @throws {Error} If connection fails
     *
     * @example
     * // Connect to local MongoDB
     * try {
     *   const dbConnection = new DatabaseConnection(logger);
     *   const conn = await dbConnection.connect('mongodb://localhost:27017/mydb');
     *   console.log('Connected successfully');
     * } catch (error) {
     *   console.error('Connection failed:', error);
     * }
     *
     * @example
     * // Connect to MongoDB Atlas
     * const dbConnection = new DatabaseConnection(logger);
     * const uri = 'mongodb+srv://user:pass@cluster.mongodb.net/mydb';
     * await dbConnection.connect(uri);
     */
    connect(MONGO_URI: string): Promise<mongoose.Connection>;

    /**
     * Closes the database connection
     * @async
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
  }

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
  class RdsConnectionManager {
    constructor();

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
    getClient(redisUrl: string): Promise<IORedis>;

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
    closeAll(): Promise<void>;
  }
}
