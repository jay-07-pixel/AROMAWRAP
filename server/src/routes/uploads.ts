import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { deleteProductImageSchema } from "../uploads/schemas.js";
import {
  deleteUploadFile,
  isLocalUploadUrl,
  resolveUploadFilePath,
  toPublicUrl,
} from "../uploads/paths.js";
import {
  handleMulterError,
  productImagesUpload,
  profileImageUpload,
} from "../uploads/multer.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";

export const uploadsRouter = Router();

uploadsRouter.post(
  "/products",
  requireAdmin,
  (req, res, next) => {
    productImagesUpload.array("images")(req, res, (error) => {
      if (error) {
        res.status(400).json({
          success: false,
          error: handleMulterError(error, "Failed to upload product images"),
        });
        return;
      }
      next();
    });
  },
  (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        error: "At least one image is required",
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: files.map((file) => ({
        url: toPublicUrl("products", file.filename),
      })),
    });
  }
);

uploadsRouter.delete(
  "/products",
  requireAdmin,
  validateBody(deleteProductImageSchema),
  async (req, res, next) => {
    try {
      const { url } = req.body;
      const filePath = resolveUploadFilePath(url, "products");

      if (!filePath) {
        res.status(400).json({
          success: false,
          error: "Invalid product image URL",
        });
        return;
      }

      const deleted = await deleteUploadFile(url, "products");

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: "Image not found",
        });
        return;
      }

      res.json({ success: true, data: { url } });
    } catch (error) {
      next(error);
    }
  }
);

uploadsRouter.post(
  "/profile",
  requireAuth,
  (req, res, next) => {
    profileImageUpload.single("image")(req, res, (error) => {
      if (error) {
        res.status(400).json({
          success: false,
          error: handleMulterError(error, "Failed to upload profile image"),
        });
        return;
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          error: "Profile image is required",
        });
        return;
      }

      const userId = req.user!.id;
      const url = toPublicUrl("users", file.filename);
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { photoUrl: true },
      });

      try {
        await prisma.user.update({
          where: { id: userId },
          data: { photoUrl: url },
        });
      } catch (error) {
        await deleteUploadFile(url, "users");
        throw error;
      }

      if (
        existingUser?.photoUrl &&
        isLocalUploadUrl(existingUser.photoUrl, "users")
      ) {
        await deleteUploadFile(existingUser.photoUrl, "users");
      }

      res.status(201).json({
        success: true,
        data: { url },
      });
    } catch (error) {
      next(error);
    }
  }
);
