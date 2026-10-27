import { z } from "zod";

/** bcrypt only uses the first 72 bytes of a password. */
const newPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password is too long");

export const registerSchema = z.object({
  email: z.string().trim().email().max(254),
  password: newPasswordSchema,
  displayName: z.string().trim().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(100),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email(),
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
  password: newPasswordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
