import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  const status = (err as { status?: unknown }).status;
  if (typeof status === "number" && status >= 400 && status < 500) {
    res.status(status).json({
      success: false,
      error: status === 413 ? "Request is too large" : "Invalid request",
    });
    return;
  }

  console.error("[Unhandled error]", err);

  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
}
