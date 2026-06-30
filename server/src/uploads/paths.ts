import fs from "fs/promises";
import path from "path";
import { env } from "../lib/env.js";
import { UPLOAD_SUBDIRS, type UploadSubdir } from "./config.js";

export function toPublicUrl(subdir: UploadSubdir, filename: string): string {
  return `/uploads/${UPLOAD_SUBDIRS[subdir]}/${filename}`;
}

export function isLocalUploadUrl(
  url: string,
  subdir: UploadSubdir
): boolean {
  return url.startsWith(`/uploads/${UPLOAD_SUBDIRS[subdir]}/`);
}

export function resolveUploadFilePath(
  publicUrl: string,
  subdir: UploadSubdir
): string | null {
  const prefix = `/uploads/${UPLOAD_SUBDIRS[subdir]}/`;

  if (!publicUrl.startsWith(prefix)) {
    return null;
  }

  const filename = publicUrl.slice(prefix.length);

  if (
    !filename ||
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("..")
  ) {
    return null;
  }

  const allowedRoot = path.resolve(env.uploadDir, UPLOAD_SUBDIRS[subdir]);
  const resolved = path.resolve(allowedRoot, filename);

  if (
    resolved !== allowedRoot &&
    !resolved.startsWith(`${allowedRoot}${path.sep}`)
  ) {
    return null;
  }

  return resolved;
}

export async function deleteUploadFile(
  publicUrl: string,
  subdir: UploadSubdir
): Promise<boolean> {
  const filePath = resolveUploadFilePath(publicUrl, subdir);

  if (!filePath) {
    return false;
  }

  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return false;
    }
    throw error;
  }
}

export function getUploadSubdirPath(subdir: UploadSubdir): string {
  return path.join(env.uploadDir, UPLOAD_SUBDIRS[subdir]);
}
