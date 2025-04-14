import { createServer } from "http";

import { RdsConnectionManager } from "db-services";

import app from "./app.js";
import { AppConfig, Logger } from "./config/index.js";
import { logWorker, consumerCleanUp } from "./services/bullmq/consumer.js";
import { processLogStream, terminateLogProcessing } from "./services/bullmq/producer.js";
import { initializeSocket } from "./socket/index.js";
import { dbConnection } from "./utils/index.js";

/** @type {import('http').Server | undefined} - HTTP server instance for the application */
let server;
const port = AppConfig.PORT;
/** @type {import('http').Server} - HTTP server created from Express app */
const httpServer = createServer(app);

// Start log stream processor
processLogStream({ streamName: AppConfig.REDIS.LOG_STREAM, batchSize: 1000 }).catch((error) => {
  Logger.error("Failed to start log stream processor:", error);
  process.exit(1);
});
processLogStream({ streamName: AppConfig.REDIS.SOCKET_LOG_STREAM, batchSize: 1000 }).catch(
  (error) => {
    Logger.error("Failed to start socket log stream processor:", error);
    process.exit(1);
  }
);
logWorker.run();

// Initialize Socket Server
initializeSocket(httpServer);

// ConnectMongoDB and start Express Server
dbConnection.connect(AppConfig.MONGO_URI).then(() => {
  server = httpServer.listen(port, () => {
    Logger.info(`Listening on port ${port}`);
  });
});

const exitHandler = async () => {
  try {
    // Close HTTP server
    if (server) {
      Logger.info("Shutting down application...");

      // Terminate Workers and log processing
      await terminateLogProcessing();
      await consumerCleanUp();

      // Disconnect from database
      await dbConnection.disconnect();

      // Close the server gracefully
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Disconnect from Redis
      await RdsConnectionManager.closeAll();
    }

    process.exit(0);
  } catch {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  Logger.error(`Unexpected error: ${error.message}`);
  exitHandler();
};

let isSigIntCalled = false;
process.on("SIGINT", () => {
  if (isSigIntCalled) return;
  isSigIntCalled = true;
  exitHandler();
});
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);
