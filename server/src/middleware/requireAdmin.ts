import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { requireAuth } from "./requireAuth.js";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== Role.ADMIN) {
      res.status(403).json({
        success: false,
        error: "Forbidden: admin access required",
      });
      return;
    }

    next();
  }).catch(next);
}
