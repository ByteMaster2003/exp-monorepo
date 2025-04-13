/**
 * Wraps an async Express route handler to automatically catch and forward errors to Express error handler
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<any>} fn - Express route handler function
 * @returns {import('express').RequestHandler} Express middleware function that handles async errors
 * @example
 * // Usage in route handler
 * router.get('/users', catchAsync(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
