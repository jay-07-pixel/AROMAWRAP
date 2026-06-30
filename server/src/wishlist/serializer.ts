import type { Prisma } from "@prisma/client";
import { decimalToNumber } from "../lib/productSnapshot.js";

export type WishlistWithItems = Prisma.WishlistGetPayload<{
  include: { items: true };
}>;

export function serializeWishlistItem(
  item: Prisma.WishlistItemGetPayload<object>
) {
  return {
    id: item.id,
    productId: item.productId,
    name: item.name,
    price: decimalToNumber(item.unitPrice) ?? 0,
    originalPrice: decimalToNumber(item.originalPrice),
    image: item.image,
    badge: item.badge,
    createdAt: item.createdAt,
  };
}

export function serializeWishlist(wishlist: WishlistWithItems) {
  return {
    id: wishlist.id,
    items: wishlist.items.map(serializeWishlistItem),
    totalItems: wishlist.items.length,
    updatedAt: wishlist.updatedAt,
  };
}
