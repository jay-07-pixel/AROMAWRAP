import { prisma } from "../lib/prisma.js";

const wishlistInclude = { items: { orderBy: { createdAt: "desc" as const } } };

export async function getOrCreateWishlist(userId: string) {
  const existing = await prisma.wishlist.findUnique({
    where: { userId },
    include: wishlistInclude,
  });

  if (existing) return existing;

  return prisma.wishlist.create({
    data: { userId },
    include: wishlistInclude,
  });
}

export async function getWishlistForUser(userId: string) {
  return getOrCreateWishlist(userId);
}

export async function findWishlistItemForUser(userId: string, itemId: string) {
  return prisma.wishlistItem.findFirst({
    where: {
      id: itemId,
      wishlist: { userId },
    },
  });
}
