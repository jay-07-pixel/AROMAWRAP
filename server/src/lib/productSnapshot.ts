import type { Prisma } from "@prisma/client";

export type ProductWithImages = Prisma.ProductGetPayload<{
  include: { images: true };
}>;

export function decimalToNumber(
  value: Prisma.Decimal | number | null | undefined
): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

export function getPrimaryImageUrl(product: ProductWithImages): string | null {
  const sorted = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted[0]?.imageUrl ?? null;
}
