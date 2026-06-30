import type { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user: User | null;
    }

    interface Locals {
      validatedQuery?: unknown;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export {};
