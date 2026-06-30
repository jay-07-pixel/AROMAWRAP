import type { Prisma } from "@prisma/client";
import { decimalToNumber } from "../lib/productSnapshot.js";

export type CartWithItems = Prisma.CartGetPayload<{
  include: { items: true };
}>;

export function serializeCartItem(
  item: Prisma.CartItemGetPayload<object>
) {
  const unitPrice = decimalToNumber(item.unitPrice) ?? 0;

  return {
    id: item.id,
    productId: item.productId,
    name: item.name,
    price: unitPrice,
    image: item.image,
    quantity: item.quantity,
    lineTotal: unitPrice * item.quantity,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function serializeCart(cart: CartWithItems) {
  const items = cart.items.map(serializeCartItem);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    id: cart.id,
    items,
    totalItems,
    totalPrice,
    updatedAt: cart.updatedAt,
  };
}
