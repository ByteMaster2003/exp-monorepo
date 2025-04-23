import z from "zod";

const listOfVariables = [
  "MONGO_URI",
  "REDIS_URL",
  "PROJECT_NAME",
  "ALLOWED_ORIGINS",
  "REDIS_LOGGER_STREAM",
  "REDIS_SOCKET_LOG_STREAM",
  "WORKER_BATCH_SIZE",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "ENCRYPTION_IV",
  "ENCRYPTION_KEY",

  // OAuth providers
  "GOOGLE_CLIENT_ID",
  "GOOGLE_SECRET_KEY",
  "GITHUB_CLIENT_ID",
  "GITHUB_SECRET_KEY",

  // Redirect URIs
  "PERMITRA_BASE_URI",
  "PERMITRA_ERR_URI",
  "CONTROL_DECK_AUTH_URI",
  "RESTIFY_AUTH_URI"
];

const schemaObject = {
  PORT: z.string().optional(),
  NODE_ENV: z.string().optional()
};

listOfVariables.forEach((variable) => {
  schemaObject[variable] = z.string({
    required_error: `${variable} is required!`
  });
});

export const envSchema = z.object(schemaObject);
