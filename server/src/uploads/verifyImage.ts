import fs from "fs/promises";

type DetectedMime = "image/jpeg" | "image/png" | "image/webp";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function detectImageMime(buffer: Buffer): DetectedMime | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (PNG_SIGNATURE.every((byte, idx) => buffer[idx] === byte)) {
    return "image/png";
  }

  // WEBP: "RIFF" + 4 bytes size + "WEBP"
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

/**
 * Verifies that a saved upload's actual file bytes match a real JPG/PNG/WEBP
 * image and match the claimed MIME type.
 */
export async function verifyUploadedImageFile(
  filePath: string,
  claimedMime: string
): Promise<boolean> {
  const handle = await fs.open(filePath, "r");
  try {
    const header = Buffer.alloc(16);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    if (bytesRead < 12) return false;
    const detected = detectImageMime(header.subarray(0, bytesRead));
    return detected !== null && detected === claimedMime;
  } finally {
    await handle.close();
  }
}
