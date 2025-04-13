/**
 * Custom error class for handling API errors with status codes
 * @extends Error
 * @class ApiError
 *
 * @example
 * // Create a 404 Not Found error
 * throw new ApiError(404, 'User not found');
 *
 * @example
 * // Create a 400 Bad Request error with custom stack
 * const error = new Error('Invalid input');
 * throw new ApiError(400, 'Validation failed', error.stack);
 *
 * @example
 * // Usage in async function
 * async function getUser(id) {
 *   const user = await User.findById(id);
 *   if (!user) {
 *     throw new ApiError(404, `User with id ${id} not found`);
 *   }
 *   return user;
 * }
 */
export class ApiError extends Error {
  /**
   * Creates an instance of ApiError
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {string} [stack=''] - Optional stack trace
   */
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
