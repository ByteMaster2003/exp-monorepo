import { EncryptionUtil } from "shared-utils";

import { AppConfig } from "../config/index.js";

export const encryptionUtil = new EncryptionUtil(AppConfig.ENCRYPTION.KEY, AppConfig.ENCRYPTION.IV);
