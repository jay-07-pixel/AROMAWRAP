import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.session.userId;

  if (!userId) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    req.session.userId = undefined;
    res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
    return;
  }

  req.user = user;
  next();
}
