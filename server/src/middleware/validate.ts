import type { NextFunction, Request, Response } from "express";
import type { ZodError, ZodTypeAny } from "zod";

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      const zodError = error as ZodError;
      const message = zodError.issues[0]?.message ?? "Invalid request body";
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  };
}

