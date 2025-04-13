import mongoose from "mongoose";

import { BootstrapLogger } from "./config/logger.config.js";

/**
 * MongoDB connection manager class
 * @class DatabaseConnection
 */
export class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.options = {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      retryReads: true,
      bufferCommands: false,
      connectTimeoutMS: 10000
    };

    // Setup connection error handler
    if (mongoose.connection) {
      mongoose.connection.on("error", (err) => {
        BootstrapLogger.error("Connection error: %s", err.message);
        process.exit(1);
      });
    }
  }

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
  async connect(MONGO_URI) {
    if (!this.connection) {
      this.connection = await mongoose.connect(MONGO_URI, this.options).catch((err) => {
        if (err.code === "ETIMEDOUT") {
          BootstrapLogger.error("Connection timed out! %s", err.message);
        } else {
          BootstrapLogger.error("Connection error: %s", err.message);
        }
        throw err; // Re-throw the error after logging
      });
      BootstrapLogger.info("Database connection established.");
    }

    return this.connection;
  }

  /**
   * Closes the database connection
   * @async
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      BootstrapLogger.info("Database connection closed.");
    }
  }
}
