import { RdsConnectionManager } from "db-services";

import app from "./app.js";
import { AppConfig, Logger } from "./config/index.js";
import { dbConnection } from "./utils/index.js";

/** @type {import('http').Server | undefined} - HTTP server instance for the application */
let server;

// ConnectMongoDB and start Express Server
dbConnection.connect(AppConfig.MONGO_URI).then(() => {
  server = app.listen(AppConfig.PORT, () => {
    Logger.info({ message: `Listening on port ${AppConfig.PORT}` });
  });
});

const exitHandler = async () => {
  try {
    // Close HTTP server
    if (server) {
      Logger.info({ message: "Shutting down application..." });

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
  Logger.error({
    message: "Unexpected error",
    stack: error.stack
  });
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
