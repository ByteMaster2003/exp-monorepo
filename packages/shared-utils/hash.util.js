import crypto from "crypto";

/**
 * Generates an MD5 hash from the input string
 * @param {string} inputString - The string to be hashed
 * @returns {string} The generated MD5 hash in hexadecimal format
 * @example
 * const hash = generateMD5Hash('hello world');
 * console.log(hash); // outputs '5eb63bbbe01eeed093cb22bb8f5acdc3'
 */
const generateMD5Hash = (inputString) => {
  const md5Hash = crypto.createHash("md5").update(inputString).digest("hex");
  return md5Hash;
};

/**
 * Generates a SHA256 hash from the input string
 * @param {string} inputString - The string to be hashed
 * @returns {string} The generated SHA256 hash in hexadecimal format
 * @example
 * const hash = generateSHA256Hash('hello world');
 * console.log(hash); // outputs 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
 */
const generateSHA256Hash = (inputString) => {
  const sha256Hash = crypto.createHash("sha256").update(inputString).digest("hex");
  return sha256Hash;
};

/**
 * Generates a 6-digit OTP using user ID and current timestamp
 * @param {string|number} userId - The user identifier
 * @returns {Promise<string>} A 6-digit OTP string padded with zeros if necessary
 *
 * @example
 * const otp = await generateOTP('user123');
 * console.log(otp); // outputs something like '123456'
 */
const generateOTP = async (userId) => {
  const randomBytes = crypto.randomBytes(3);
  const timestamp = Date.now();
  const bufferData = Buffer.concat([
    randomBytes,
    Buffer.from(userId.toString()),
    Buffer.from(timestamp.toString())
  ]);

  const hash = crypto.createHash("sha256");
  const combinedHash = hash.update(bufferData);
  const finalHash = combinedHash.digest("hex");

  const OTP = parseInt(finalHash, 16) % 1000000;
  const OTPString = OTP.toString().padEnd(6, "0");

  return OTPString;
};

export default {
  generateMD5Hash,
  generateSHA256Hash,
  generateOTP
};
