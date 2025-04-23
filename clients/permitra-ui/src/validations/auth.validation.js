import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").min(3, "name must be at least 3 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .refine((value) => /[0-9]/.test(value), {
        message: "Password must contain at least one number"
      })
      .refine((value) => /[a-z]/.test(value), {
        message: "Password must contain at least one lowercase letter"
      })
      .refine((value) => /[A-Z]/.test(value), {
        message: "Password must contain at least one uppercase letter"
      })
      .refine((value) => /[\W]/.test(value), {
        message: "Password must contain at least one special character"
      }),
    confirmPassword: z.string().min(1, "Password is required")
  })
  .refine(
    (data) => {
      if (data.password !== data.confirmPassword) return false;
    },
    { message: "Password didn't match", path: ["confirmPassword"] }
  );

export const validateQuery = z.object({
  app: z.enum(["control-deck", "restify"], { message: "Invalid Client App!" }),
  state: z.string().nanoid("Invalid state")
});
