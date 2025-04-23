import fs from "fs";

import dotenv from "dotenv";

export const loadEnvs = (rootEnvPath, localEnvPath) => {
  // Load root env
  const rootEnv = fs.existsSync(rootEnvPath) ? dotenv.parse(fs.readFileSync(rootEnvPath)) : {};

  // Load local env
  const localEnv = fs.existsSync(localEnvPath) ? dotenv.parse(fs.readFileSync(localEnvPath)) : {};

  // Merge with local taking precedence
  return { ...rootEnv, ...localEnv };
};
