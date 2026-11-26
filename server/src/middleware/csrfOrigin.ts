import type { NextFunction, Request, Response } from "express";
import { env } from "../lib/env.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function extractRefererOrigin(referer: string | undefined): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins(req: Request): Set<string> {
  const allowed = new Set(env.corsOrigins);
  const host = req.get("host");
  if (host) {
    const scheme = env.isProduction ? "https" : req.protocol;
    allowed.add(`${scheme}://${host}`);
  }
  return allowed;
}

/**
 * Defense-in-depth CSRF protection for cookie-authenticated API mutations.
 * Verifies that POST/PUT/PATCH/DELETE requests come from an allowed site origin.
 */
export function csrfOriginCheck(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }

  const allowedOrigins = getAllowedOrigins(req);
  const originHeader = req.get("origin");

  if (originHeader) {
    if (!allowedOrigins.has(originHeader)) {
      res.status(403).json({
        success: false,
        error: "Forbidden: invalid request origin",
      });
      return;
    }
    next();
    return;
  }

  const refererOrigin = extractRefererOrigin(req.get("referer"));
  if (refererOrigin) {
    if (!allowedOrigins.has(refererOrigin)) {
      res.status(403).json({
        success: false,
        error: "Forbidden: invalid request referer",
      });
      return;
    }
    next();
    return;
  }

  // In production, reject cookie-bearing state changes that omit both Origin and Referer.
  const hasSessionCookie =
    typeof req.headers.cookie === "string" &&
    req.headers.cookie.includes(`${env.sessionName}=`);

  if (env.isProduction && hasSessionCookie) {
    res.status(403).json({
      success: false,
      error: "Forbidden: missing request origin",
    });
    return;
  }

  next();
}
