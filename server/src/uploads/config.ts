export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const UPLOAD_SUBDIRS = {
  products: "products",
  users: "users",
  categories: "categories",
} as const;

export type UploadSubdir = keyof typeof UPLOAD_SUBDIRS;

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function mimeToExtension(mimeType: string): string | null {
  return MIME_TO_EXTENSION[mimeType] ?? null;
}

export function isAllowedExtension(extension: string): boolean {
  return ALLOWED_EXTENSIONS.includes(
    extension.toLowerCase() as (typeof ALLOWED_EXTENSIONS)[number]
  );
}
