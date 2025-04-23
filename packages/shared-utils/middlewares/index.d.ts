import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

declare module "shared-utils/middlewares" {
  interface ValidationSchema {
    params?: AnyZodObject;
    query?: AnyZodObject;
    body?: AnyZodObject;
  }

  /**
   * Express middleware to validate request using Zod schemas
   * @param {ValidationSchema} schema - Object containing Zod schemas for params, query and body
   * @returns {(req: Request, res: Response, next: NextFunction) => void} Express middleware function
   *
   * @throws {ApiError} Throws BAD_REQUEST error if validation fails
   *
   * @example
   * const userSchema = {
   *   body: z.object({
   *     email: z.string().email(),
   *     password: z.string().min(6)
   *   })
   * };
   *
   * router.post('/users', validate(userSchema), createUser);
   */
  export function validate(
    schema: ValidationSchema
  ): (req: Request, res: Response, next: NextFunction) => void;

  export interface ValidationError {
    field: string;
    message: string;
  }
}
