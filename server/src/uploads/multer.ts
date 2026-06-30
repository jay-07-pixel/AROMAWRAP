import crypto from "crypto";
import path from "path";
import multer from "multer";
import type { Request } from "express";
import { env } from "../lib/env.js";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  isAllowedExtension,
  mimeToExtension,
  type UploadSubdir,
} from "./config.js";
import { getUploadSubdirPath } from "./paths.js";

function createFileFilter() {
  return (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ): void => {
    if (
      !ALLOWED_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_MIME_TYPES)[number]
      )
    ) {
      cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed"));
      return;
    }

    const extension = path.extname(file.originalname).toLowerCase();
    if (extension && !isAllowedExtension(extension)) {
      cb(new Error("Invalid file extension"));
      return;
    }

    if (!mimeToExtension(file.mimetype)) {
      cb(new Error("Invalid file type"));
      return;
    }

    cb(null, true);
  };
}

function createStorage(subdir: UploadSubdir) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, getUploadSubdirPath(subdir));
    },
    filename: (_req, file, cb) => {
      const extension = mimeToExtension(file.mimetype);

      if (!extension) {
        cb(new Error("Invalid file type"), "");
        return;
      }

      cb(null, `${crypto.randomUUID()}${extension}`);
    },
  });
}

function createUploader(subdir: UploadSubdir) {
  return multer({
    storage: createStorage(subdir),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: createFileFilter(),
  });
}

export const productImagesUpload = createUploader("products");
export const profileImageUpload = createUploader("users");

export function handleMulterError(
  error: unknown,
  fallbackMessage: string
): string {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return "File exceeds maximum size of 5MB";
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return "Unexpected file field";
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
