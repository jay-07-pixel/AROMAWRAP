import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { updateProfileSchema } from "../profile/schemas.js";
import { serializeProfile } from "../profile/serializer.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";

export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get("/", async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: serializeProfile(req.user!),
    });
  } catch (error) {
    next(error);
  }
});

profileRouter.patch("/", validateBody(updateProfileSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: req.body,
    });

    res.json({
      success: true,
      data: serializeProfile(user),
    });
  } catch (error) {
    next(error);
  }
});
