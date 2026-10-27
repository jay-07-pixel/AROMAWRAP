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

/** Keeps saved cart prices in line with the catalogue, so the cart shows what checkout will charge. */
export async function getCartForUser(userId: string) {
  const cart = await getOrCreateCart(userId);
  if (cart.items.length === 0) return cart;

  const products = await prisma.product.findMany({
    where: { id: { in: cart.items.map((item) => item.productId) } },
    select: { id: true, name: true, price: true },
  });
  const productsById = new Map(products.map((product) => [product.id, product]));

  const stale = cart.items.filter((item) => {
    const product = productsById.get(item.productId);
    return product && (!product.price.equals(item.unitPrice) || product.name !== item.name);
  });
  if (stale.length === 0) return cart;

  await prisma.$transaction(
    stale.map((item) => {
      const product = productsById.get(item.productId)!;
      return prisma.cartItem.update({
        where: { id: item.id },
        data: { unitPrice: product.price, name: product.name },
      });
    })
  );

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
