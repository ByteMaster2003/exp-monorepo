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
 * Generates a 6-character base32 OTP
 * @returns {string} A formatted 6-character base32 string (e.g., 'T6Z-2KP')
 *
 * @example
 * const otp = await generateOTP();
 * console.log(otp); // outputs something like 'T6Z-2KP'
 */
const generateOTP = () => {
  const base32Chars = "234567ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes = crypto.randomBytes(6); // 6 bytes = 48 bits

  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += base32Chars[bytes[i] % 32];
  }

  return otp;
};

export default {
  generateMD5Hash,
  generateSHA256Hash,
  generateOTP
};
