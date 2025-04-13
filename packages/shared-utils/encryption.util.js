import crypto from "crypto";

/**
 * Utility class for encryption and decryption using AES-128-CBC
 * @class EncryptionUtil
 * @description
 * This class provides methods to encrypt and decrypt data using AES-128-CBC algorithm.
 * It requires a 16-character encryption key and 16-character initialization vector (IV).
 *
 * @example
 * // Initialize EncryptionUtil
 * const encryptionUtil = new EncryptionUtil(
 *   'my-16-char-key123',  // Must be exactly 16 characters
 *   'my-16-char-iv123'    // Must be exactly 16 characters
 * );
 *
 * // Encrypt data
 * const sensitiveData = 'My secret message';
 * const encrypted = encryptionUtil.encrypt(sensitiveData);
 * console.log(encrypted); // outputs something like '7b9c8d2a...'
 *
 * // Decrypt data
 * const decrypted = encryptionUtil.decrypt(encrypted);
 * console.log(decrypted); // outputs 'My secret message'
 *
 * @example
 * // Using with environment variables (ensure they are 16 characters)
 * const encryptionUtil = new EncryptionUtil(
 *   process.env.ENCRYPTION_KEY,  // Must be exactly 16 characters
 *   process.env.ENCRYPTION_IV    // Must be exactly 16 characters
 * );
 *
 * // Error handling
 * try {
 *   const encrypted = encryptionUtil.encrypt('sensitive data');
 *   const decrypted = encryptionUtil.decrypt(encrypted);
 * } catch (error) {
 *   console.error('Encryption/Decryption failed:', error.message);
 * }
 */
export class EncryptionUtil {
  /**
   * Creates an instance of EncryptionUtil
   * @param {string} encryptionKey - Exactly 16 character encryption key
   * @param {string} encryptionIv - Exactly 16 character initialization vector
   * @throws {Error} If encryption key or IV is not provided or not 16 characters
   */
  constructor(encryptionKey, encryptionIv) {
    if (!encryptionKey || !encryptionIv) {
      throw new Error("Encryption key and IV are required");
    }
    if (encryptionKey.length !== 16 || encryptionIv.length !== 16) {
      throw new Error("Both encryption key and IV must be exactly 16 characters");
    }
    this.key = Buffer.from(encryptionKey, "utf8");
    this.iv = Buffer.from(encryptionIv, "utf8");
  }

  /**
   * Encrypt plain text using AES-CBC
   * @param {string} plainText - Text to encrypt
   * @returns {string} Hex encoded encrypted string
   * @throws {Error} If encryption fails
   * @example
   * const encrypted = encryptionUtil.encrypt('Hello World');
   * // encrypted = '7b9c8d2a...'
   */
  encrypt(plainText) {
    try {
      const cipher = crypto.createCipheriv("aes-128-cbc", this.key, this.iv);
      let encrypted = cipher.update(plainText, "utf8", "hex");
      encrypted += cipher.final("hex");
      return encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt hex encoded encrypted text
   * @param {string} encryptedHex - Hex encoded encrypted text
   * @returns {string} Decrypted plain text
   * @throws {Error} If decryption fails or input is invalid
   * @example
   * const decrypted = encryptionUtil.decrypt('7b9c8d2a...');
   * // decrypted = 'Hello World'
   */
  decrypt(encryptedHex) {
    try {
      const decipher = crypto.createDecipheriv("aes-128-cbc", this.key, this.iv);
      let decrypted = decipher.update(encryptedHex, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted.trim();
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}
