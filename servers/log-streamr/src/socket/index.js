import { Server } from "socket.io";

import { Logger } from "../config/index.js";
import { authSocketSession } from "../middlewares/index.js";

/** @type {import('socket.io').Server} */
// eslint-disable-next-line import/no-mutable-exports
export let SocketIO;
export const initializeSocket = (server) => {
  SocketIO = new Server(server, {
    cors: {
      origin: "http://localhost:5000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authenticate user
  SocketIO.use(authSocketSession);

  // Connection event
  SocketIO.on("connection", (socket) => {
    const userId = socket.user.id;
    Logger.info({ message: `User connected: ${userId}` });

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Register socket logger
    // socketLogger(io, socket);

    // Register events
    // notificationEvents(io, socket);

    socket.on("error", (error) => {
      Logger.error({
        message: "Socket error",
        stack: error.stack
      });
    });
  });

  Logger.info({ message: "Socket server initialized" });
  return SocketIO;
};
