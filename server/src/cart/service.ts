import { prisma } from "../lib/prisma.js";

const cartInclude = { items: { orderBy: { createdAt: "asc" as const } } };

export async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  if (existing) return existing;

  return prisma.cart.create({
    data: { userId },
    include: cartInclude,
  });
}

export async function getCartForUser(userId: string) {
  return getOrCreateCart(userId);
}

export async function findCartItemForUser(userId: string, itemId: string) {
  return prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cart: { userId },
    },
  });
}
