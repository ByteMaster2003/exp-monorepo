import { z } from "zod";

const registerSchema = {
  query: z.object({}),
  params: z.object({}),
  body: z.object({})
};

const loginSchema = {
  query: z.object({}),
  params: z.object({}),
  body: z.object({})
};

const logoutSchema = {
  query: z.object({}),
  params: z.object({}),
  body: z.object({})
};

const resetPasswordRequestSchema = {
  query: z.object({}),
  params: z.object({}),
  body: z.object({})
};

const resetPasswordConfirmSchema = {
  query: z.object({}),
  params: z.object({}),
  body: z.object({})
};

export default {
  registerSchema,
  loginSchema,
  logoutSchema,
  resetPasswordRequestSchema,
  resetPasswordConfirmSchema
};
