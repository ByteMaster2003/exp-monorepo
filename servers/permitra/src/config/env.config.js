import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { loadEnvs } from "shared-utils";
import { ZodError } from "zod";

import { envSchema } from "../validations/env.validation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootEnvPath = join(__dirname, "./../../../../.shared.env");
const localEnvPath = join(__dirname, "./../../.env");
const combinedEnv = loadEnvs(rootEnvPath, localEnvPath);
Object.assign(process.env, combinedEnv);

let Vars = null;
try {
  Vars = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    const errorMessage = error.errors.map((err) => err.message).join(", ");
    throw new Error(`ENV Error: ${errorMessage}`);
  }
  throw new Error(error.message);
}

const AppConfig = {
  NODE_ENV: Vars.NODE_ENV || "development",
  PORT: Vars.PORT || 8080,
  MONGO_URI: Vars.MONGO_URI,
  PROJECT_NAME: Vars.PROJECT_NAME,
  ALLOWED_ORIGINS: Vars.ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()),
  AUTH: {
    ACCESS_TOKEN_SECRET: Vars.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY: 60 * 60,
    REFRESH_TOKEN_SECRET: Vars.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY: 30 * 24 * 60 * 60
  },
  REDIS: {
    URL: Vars.REDIS_URL,
    LOG_STREAM: Vars.REDIS_LOGGER_STREAM,
    SOCKET_LOG_STREAM: Vars.REDIS_SOCKET_LOG_STREAM,
    WORKER_BATCH_SIZE: parseInt(Vars.WORKER_BATCH_SIZE) || 100
  },
  ENCRYPTION: {
    KEY: Vars.ENCRYPTION_KEY,
    IV: Vars.ENCRYPTION_IV
  }
};

export { AppConfig };
