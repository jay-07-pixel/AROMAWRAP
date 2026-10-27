import type { Request } from "express";
import rateLimit, { ipKeyGenerator, type Options } from "express-rate-limit";

const MINUTE = 60 * 1000;

function limiter(windowMs: number, limit: number, message: string, extra: Partial<Options> = {}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, error: message },
    ...extra,
  });
}

function emailKey(req: Request): string {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  return email || ipKeyGenerator(req.ip ?? "");
}

/** Every API request, per IP. Generous enough for normal browsing. */
export const apiLimiter = limiter(15 * MINUTE, 600, "Too many requests. Please try again shortly.");

/** Login attempts per IP; successful logins do not count. */
export const loginLimiter = limiter(15 * MINUTE, 10, "Too many login attempts. Please try again in 15 minutes.", {
  skipSuccessfulRequests: true,
});

/** Login attempts per email across all IPs, to slow down distributed password guessing. */
export const loginEmailLimiter = limiter(60 * MINUTE, 20, "Too many login attempts for this account. Please try again later.", {
  keyGenerator: emailKey,
  skipSuccessfulRequests: true,
});

export const registerLimiter = limiter(60 * MINUTE, 5, "Too many accounts created. Please try again later.");

/** Reset-code emails, per IP and per email address. */
export const forgotPasswordLimiter = limiter(60 * MINUTE, 5, "Too many reset requests. Please try again later.");
export const forgotPasswordEmailLimiter = limiter(60 * MINUTE, 3, "Too many reset requests for this email. Please try again later.", {
  keyGenerator: emailKey,
});

/** Reset-code guesses, per IP and per email address. */
export const resetPasswordLimiter = limiter(15 * MINUTE, 10, "Too many attempts. Please try again in 15 minutes.");
export const resetPasswordEmailLimiter = limiter(15 * MINUTE, 5, "Too many attempts for this email. Please request a new code later.", {
  keyGenerator: emailKey,
});

export const writeLimiter = limiter(15 * MINUTE, 30, "Too many submissions. Please try again later.");

export const uploadLimiter = limiter(15 * MINUTE, 30, "Too many uploads. Please try again later.");
