declare module "ui/utils" {
  export interface RequestHeaders {
    "Content-Type"?: string;
    [key: string]: string | undefined;
  }

  export function POST<T = any>(uri: string, payload: any, headers?: RequestHeaders): Promise<T>;

  export function GET<T = any>(uri: string, headers?: RequestHeaders): Promise<T>;

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
  export function validatePayloadWithSchema(
    schema: ZodSchema,
    data: object
  ): Object<{ data: object; error: string }>;
}
