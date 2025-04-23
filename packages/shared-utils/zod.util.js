import { ZodError } from "zod";

/**
 * Validate object with given schema
 * @param {import("zod").ZodSchema} schema - The Zod schema to validate against
 * @param {object} data - The data to validate
 * @returns {object} result - The validation result
 * @returns {object} [result.data] - The parsed and validated data (if validation succeeds)
 * @returns {string} [result.error] - The error message (if validation fails)
 *
 * @example
 * const userSchema = z.object({
 *   email: z.string().email(),
 *   age: z.number().min(18)
 * });
 *
 * const { data, error } = validatePayloadWithSchema(userSchema, {
 *   email: "test@example.com",
 *   age: 20
 * });
 *
 * if (error) {
 *   console.error(error); // "Invalid email, Age must be at least 18"
 * } else {
 *   console.log(data); // { email: "test@example.com", age: 20 }
 * }
 */
export const validatePayloadWithSchema = (schema, data) => {
  const result = {};

  try {
    result.data = schema.parse(data);
  } catch (error) {
    let errorMessage = "";
    if (error instanceof ZodError) {
      errorMessage = error.errors.map((err) => err.message).join(", ");
    } else {
      errorMessage = "Invalid Data";
    }
    result.error = errorMessage;
  }

  return result;
};
