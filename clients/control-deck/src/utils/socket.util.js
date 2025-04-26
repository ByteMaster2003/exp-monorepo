import { io } from "socket.io-client";

import { AppConfig } from "../config.js";

export const socket = io(AppConfig.SERVERS.LOG_STREAMR, {
  autoConnect: false,
  reconnection: true,
  withCredentials: true,
  reconnectionAttempts: 5
});
