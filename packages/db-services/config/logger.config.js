import path from "path";

import winston from "winston";

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const BootstrapLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    enumerateErrorFormat(),
    winston.format.timestamp({
      format: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level}: ${message}`;
        })
      )
    }),
    new winston.transports.File({
      filename: path.join("logs", "db-bootstrap.log"),
      level: "info",
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

export { BootstrapLogger };
