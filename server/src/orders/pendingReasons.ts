import { createHash } from "node:crypto";
import { prisma } from "../lib/prisma.js";

export function pendingReasonKey(reason: string): string {
  return createHash("sha256")
    .update(reason.trim().toLowerCase())
    .digest("hex");
}

/** Remember a pending reason so staff can reuse it next time. */
export async function rememberPendingReason(reason: string): Promise<void> {
  const trimmed = reason.trim();
  if (!trimmed) return;

  const reasonKey = pendingReasonKey(trimmed);
  const now = new Date();

  await prisma.pendingReasonSuggestion.upsert({
    where: { reasonKey },
    create: {
      reason: trimmed,
      reasonKey,
      usageCount: 1,
      lastUsedAt: now,
    },
    update: {
      reason: trimmed,
      usageCount: { increment: 1 },
      lastUsedAt: now,
    },
  });
}

export async function listPendingReasonSuggestions(limit = 12) {
  return prisma.pendingReasonSuggestion.findMany({
    orderBy: [{ usageCount: "desc" }, { lastUsedAt: "desc" }],
    take: limit,
    select: {
      id: true,
      reason: true,
      usageCount: true,
      lastUsedAt: true,
    },
  });
}
