import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  UPLOADED_PROFILE_PHOTO,
  updateProfileSchema,
  type UpdateProfileInput,
} from "../profile/schemas.js";
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
    const { displayName, phone, photoUrl } = req.body as UpdateProfileInput;

    if (
      photoUrl &&
      photoUrl !== req.user!.photoUrl &&
      !UPLOADED_PROFILE_PHOTO.test(photoUrl)
    ) {
      res.status(400).json({
        success: false,
        error: "Upload the photo instead of linking it",
      });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { displayName, phone, photoUrl },
    });

    res.json({
      success: true,
      data: serializeProfile(user),
    });
  } catch (error) {
    next(error);
  }
});
