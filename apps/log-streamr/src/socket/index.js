import { Server } from "socket.io";

import { Logger } from "../config/index.js";
import { authSocketSession } from "../middlewares/index.js";

/** @type {import('socket.io').Server} */
let io;
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authenticate user
  io.use(authSocketSession);

  // Connection event
  io.on("connection", (socket) => {
    const userId = socket.user.id;
    Logger.info(`User connected: ${userId}`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Register socket logger
    // socketLogger(io, socket);

    // Register events
    // notificationEvents(io, socket);

    socket.on("error", (error) => {
      Logger.error(`Socket error: ${error.message}`);
    });
  });

  Logger.info("Socket server initialized");
  return io;
};

export const SocketIO = io;
