import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res, next) => {
  try {
    let database: "connected" | "disconnected" = "disconnected";

    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "connected";
    } catch {
      database = "disconnected";
    }

    res.json({
      success: true,
      status: "ok",
      timestamp: new Date().toISOString(),
      database,
    });
  } catch (error) {
    next(error);
  }
});
