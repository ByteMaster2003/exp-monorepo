/// <reference path="./middlewares/index.d.ts" />

declare module "shared-utils" {
  import { RateLimitRequestHandler } from "express-rate-limit";
  import { HttpStatus } from "http-status";

  export const hashUtil: {
    /**
     * Generates an MD5 hash from the input string
     * @param {string} inputString - The string to be hashed
     * @returns {string} The generated MD5 hash in hexadecimal format
     * @example
     * const hash = generateMD5Hash('hello world');
     * console.log(hash); // outputs '5eb63bbbe01eeed093cb22bb8f5acdc3'
     */
    generateMD5Hash: (inputString: string) => string;

    /**
     * Generates a SHA256 hash from the input string
     * @param {string} inputString - The string to be hashed
     * @returns {string} The generated SHA256 hash in hexadecimal format
     * @example
     * const hash = generateSHA256Hash('hello world');
     * console.log(hash); // outputs 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
     */
    generateSHA256Hash: (inputString: string) => string;

    /**
     * Generates a 6-digit OTP using user ID and current timestamp
     * @param {string|number} userId - The user identifier
     * @returns {Promise<string>} A 6-digit OTP string padded with zeros if necessary
     *
     * @example
     * const otp = await generateOTP('user123');
     * console.log(otp); // outputs something like '123456'
     */
    generateOTP: (userId: string) => Promise<string>;
  };

  // Token Utility Types
  interface TokenConfig {
    access: {
      secret: string;
      expiryInSeconds: number;
      cacheKey: string;
    };
    refresh: {
      secret: string;
      expiryInSeconds: number;
      cacheKey: string;
    };
    issuer: string;
    redisClient: any; // Redis client type
  }

  export class TokenUtil {
    constructor(config: TokenConfig);
    signAccessToken(userId: string, payload?: object): Promise<string>;
    signRefreshToken(userId: string, payload?: object): Promise<string>;
    verifyAccessToken(accessToken: string): Promise<any>;
    verifyRefreshToken(refreshToken: string): Promise<any>;
  }

  // Rate Limiter Types
  export interface RateLimitConfig {
    windowMs: number;
    max: number;
  }

  export class RateLimiter {
    constructor(nodeEnv?: string);
    create(config?: RateLimitConfig): RateLimitRequestHandler;
    threePerHour(): RateLimitRequestHandler;
    threePerDay(): RateLimitRequestHandler;
    hundredPerHour(): RateLimitRequestHandler;
    fiveHundredPerHour(): RateLimitRequestHandler;
    fivePerMinute(): RateLimitRequestHandler;
    twentyPerMinute(): RateLimitRequestHandler;
  }

  // Environment Utility Types
  export function loadEnvs(rootEnvPath: string, localEnvPath: string): Record<string, string>;

  // Encryption Utility Types
  export class EncryptionUtil {
    constructor(encryptionKey: string, encryptionIv: string);
    encrypt(plainText: string): string;
    decrypt(encryptedHex: string): string;
  }

  // API Error Types
  export class ApiError extends Error {
    constructor(statusCode: number, message: string, stack?: string);
    statusCode: number;
  }

  // Catch Async Types
  type AsyncRequestHandler = (
    req: import("express").Request,
    res: import("express").Response,
    next: import("express").NextFunction
  ) => Promise<any>;

  export function catchAsync(fn: AsyncRequestHandler): import("express").RequestHandler;
  export const httpStatus: HttpStatus;

  export * from "shared-utils/middlewares";
}
