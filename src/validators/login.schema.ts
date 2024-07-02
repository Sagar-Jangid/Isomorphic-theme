import { z } from 'zod';

// form zod validation schema
export const loginSchema = z.object({
  mobile: z.string().min(1, "Mobile number is required"),
  password: z.string().min(1, "Password is required"),
  lpassword:z.string().min(1, "Pin is required"),
  rememberMe: z.boolean().optional(),
});

// generate form types from zod validation schema
export type LoginSchema = z.infer<typeof loginSchema>;