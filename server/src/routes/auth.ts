import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { loginSchema, registerSchema } from "../auth/schemas.js";
import { env } from "../lib/env.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";

const SALT_ROUNDS = 10;

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: "Email is already registered",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        displayName,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        phone: true,
        photoUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    req.session.userId = user.id;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        phone: user.phone,
        photoUrl: user.photoUrl,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy((destroyError) => {
    if (destroyError) {
      res.status(500).json({
        success: false,
        error: "Failed to logout",
      });
      return;
    }

    res.clearCookie(env.sessionName);
    res.json({ success: true });
  });
});

authRouter.get("/me", async (req, res, next) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.json({ success: true, user: null });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        phone: true,
        photoUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      req.session.userId = undefined;
      res.json({ success: true, user: null });
      return;
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/session", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user?.id,
      email: req.user?.email,
      displayName: req.user?.displayName,
      phone: req.user?.phone,
      photoUrl: req.user?.photoUrl,
      role: req.user?.role,
      createdAt: req.user?.createdAt,
      updatedAt: req.user?.updatedAt,
    },
  });
});
