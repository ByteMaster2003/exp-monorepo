import { z } from "zod";

const passwordSchema = z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/, {
  message:
    "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
});

const registerSchema = {
  query: z.object({}),
  params: z.object({}),
  body: z.object({
    app: z.enum(["control-deck", "restify"]),
    state: z.string().nanoid("Invalid State!"),
    name: z.string(),
    email: z.string().email("Invalid email!"),
    password: passwordSchema
  })
};

const loginSchema = {
  query: z.object({}),
  params: z.object({}),
  body: z.object({
    app: z.enum(["control-deck", "restify"]),
    state: z.string().nanoid("Invalid State!"),
    email: z.string().email("Invalid Email!"),
    password: z.string().min(8, "Invlid Password!")
  })
};

const logoutSchema = {
  query: z.object({}),
  params: z.object({}),
  body: z.object({})
};

const resetPasswordRequestSchema = {
  query: z.object({}),
  params: z.object({}),
  body: z.object({
    email: z.string().email("Invalid Email")
  })
};

const resetPasswordConfirmSchema = {
  query: z.object({}),
  params: z.object({}),
  body: z.object({
    otp: z
      .string()
      .toUpperCase()
      .regex(/^[2-7A-Z]{6}$/, {
        message: "Invalid OTP"
      }),
    password: passwordSchema
  })
};

const oauthRedirect = {
  query: z.object({
    app: z.enum(["control-deck", "restify"], { message: "Unknown App!" }),
    state: z.string().nanoid()
  }),
  params: z.object({})
};

const exchangeTokenWithCode = {
  query: z.object({}),
  params: z.object({}),
  body: z.object({
    app: z.enum(["control-deck", "restify"], { message: "Unknown App!" }),
    code: z.string({ message: "code is required!" }).nanoid("Invalid code!")
  })
};

const refreshTokens = {
  query: z.object({}),
  params: z.object({}),
  body: z.object({})
};

export default {
  registerSchema,
  loginSchema,
  logoutSchema,
  resetPasswordRequestSchema,
  resetPasswordConfirmSchema,
  oauthRedirect,
  exchangeTokenWithCode,
  refreshTokens
};
