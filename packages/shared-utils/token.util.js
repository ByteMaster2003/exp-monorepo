import jwt from "jsonwebtoken";
import { httpStatus } from "shared-utils";

import { ApiError } from "./api-error.util.js";
import hashUtil from "./hash.util.js";

/**
 * @typedef {Object} TokenConfig
 * @property {Object} access - Access token configuration
 * @property {string} access.secret - Secret for signing access tokens
 * @property {number} access.expiryInSeconds - Expiry time in seconds for access tokens
 * @property {string} access.cacheKey - Cache key template for access tokens
 * @property {Object} refresh - Refresh token configuration
 * @property {string} refresh.secret - Secret for signing refresh tokens
 * @property {number} refresh.expiryInSeconds - Expiry time in seconds for refresh tokens
 * @property {string} refresh.cacheKey - Cache key template for refresh tokens
 * @property {string} issuer - Token issuer name
 * @property {Object} redisClient - Redis client instance for caching
 * @property {import("./encryption.util.js").EncryptionUtil} encryptionUtil - instance of encryption util
 */

export class TokenUtil {
  /**
   * Creates an instance of TokenUtil
   * @param {TokenConfig} config - Token configuration object
   *
   * @example
   * const tokenUtil = new TokenUtil({
   *   access: {
   *     secret: process.env.ACCESS_TOKEN_SECRET,
   *     expiryInSeconds: 3600,
   *     cacheKey: 'access_token:{userId}'
   *   },
   *   refresh: {
   *     secret: process.env.REFRESH_TOKEN_SECRET,
   *     expiryInSeconds: 604800,
   *     cacheKey: 'refresh_token:{userId}'
   *   },
   *   issuer: "auth service",
   *   redisClient: redisInstance
   * });
   */
  constructor(config) {
    this.config = config;
    this.redis = config.redisClient;
    this.encryptionUtil = config.encryptionUtil;
  }

  /**
   * Generates cache key for given token type and userId
   * @private
   */
  _getCacheKey(type, options = {}) {
    /**@type {string} */
    let cacheKey = this.config[type].cacheKey || "";

    Object.keys(options).forEach((key) => {
      cacheKey = cacheKey.replace(`{${key}}`, options[key]);
    });

    return hashUtil.generateSHA256Hash(cacheKey);
  }

  /**
   * Signs an access token for a given user.
   * @param {Object} keys - ids which used to generate keys
   * @param {Object} [payload={}] - Additional claims to include in the token
   * @returns {Promise<string>} A promise that resolves with the signed access token
   *
   * @description
   * Generates a signed access token with configured secret and expiry time.
   * The token includes:
   * - expiresIn: from configuration
   * - issuer: from configuration
   * - audience: keys.userId
   */
  async signAccessToken(keys = {}, payload = {}) {
    const options = {
      expiresIn: this.config.access.expiryInSeconds,
      issuer: this.config.issuer,
      audience: keys?.userId
    };

    const encryptedPayload = this.encryptionUtil.encrypt(JSON.stringify(payload));
    const token = jwt.sign({ data: encryptedPayload }, this.config.access.secret, options);

    // Cache the token
    const cacheKey = this._getCacheKey("access", keys);
    await this.redis.set(cacheKey, token, "EX", this.config.access.expiryInSeconds);

    return token;
  }

  /**
   * Signs a refresh token for a given user.
   * @param {Object} keys - ids which used to generate keys
   * @param {Object} [payload={}] - Additional claims to include in the token
   * @returns {Promise<string>} A promise that resolves with the signed refresh token
   *
   * @description
   * Generates a signed refresh token with configured secret and expiry time.
   * The token includes:
   * - expiresIn: from configuration
   * - issuer: from configuration
   * - audience: userId
   */
  async signRefreshToken(keys = {}, payload = {}) {
    const options = {
      expiresIn: this.config.refresh.expiryInSeconds,
      issuer: this.config.issuer,
      audience: keys?.userId
    };

    const encryptedPayload = this.encryptionUtil.encrypt(JSON.stringify(payload));
    const token = jwt.sign({ data: encryptedPayload }, this.config.refresh.secret, options);

    // Cache the token
    const cacheKey = this._getCacheKey("refresh", keys);
    await this.redis.set(cacheKey, token, "EX", this.config.refresh.expiryInSeconds);

    return token;
  }

  /**
   * Verifies an access token
   * @param {string} accessToken - The access token to verify
   * @returns {Promise<Object>} A promise that resolves with the decoded token payload
   * @throws {ApiError} If the token is expired, invalid, or verification fails
   */
  async verifyAccessToken(accessToken) {
    try {
      const payload = jwt.verify(accessToken, this.config.access.secret);

      // decrypt data
      const encryptedString = this.encryptionUtil.decrypt(payload.data);
      const data = JSON.parse(encryptedString);

      // Verify against cache
      const cacheKey = this._getCacheKey("access", data?.keys);
      const cachedToken = await this.redis.get(cacheKey);

      if (accessToken !== cachedToken) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid access token");
      }

      return data;
    } catch (error) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        error.name === "JsonWebTokenError" ? "Invalid access token" : error.message
      );
    }
  }

  /**
   * Verifies a refresh token
   * @param {string} refreshToken - The refresh token to verify
   * @returns {Promise<Object>} A promise that resolves with the decoded token payload
   * @throws {ApiError} If the token is expired, invalid, or verification fails
   */
  async verifyRefreshToken(refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, this.config.refresh.secret);

      // decrypt data
      const encryptedString = this.encryptionUtil.decrypt(payload.data);
      const data = JSON.parse(encryptedString);

      // Verify against cache
      const cacheKey = this._getCacheKey("refresh", data?.keys);
      const cachedToken = await this.redis.get(cacheKey);

      if (refreshToken !== cachedToken) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
      }

      return data;
    } catch (error) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        error.name === "JsonWebTokenError" ? "Invalid refresh token" : error.message
      );
    }
  }
}
