import type { NextFunction, Request, Response } from "express";
import type { ZodError, ZodTypeAny } from "zod";

function handleValidationError(
  res: Response,
  error: unknown,
  fallbackMessage: string
): void {
  const zodError = error as ZodError;
  const message = zodError.issues[0]?.message ?? fallbackMessage;
  res.status(400).json({
    success: false,
    error: message,
  });
}

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      handleValidationError(res, error, "Invalid request body");
    }
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      res.locals.validatedQuery = schema.parse(req.query);
      next();
    } catch (error) {
      handleValidationError(res, error, "Invalid query parameters");
    }
  };
}

