import type { Prisma } from "@prisma/client";
import {
  decimalToNumber,
  getPrimaryImageUrl,
} from "../lib/productSnapshot.js";

export type ProductWithImages = Prisma.ProductGetPayload<{
  include: { images: true };
}>;

export function serializeProduct(product: ProductWithImages) {
  const sortedImages = [...product.images].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    price: decimalToNumber(product.price),
    originalPrice: decimalToNumber(product.originalPrice),
    badge: product.badge,
    stock: product.stock,
    rating: product.rating,
    reviewsCount: product.reviewsCount,
    image: getPrimaryImageUrl(product),
    images: sortedImages.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      sortOrder: img.sortOrder,
    })),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
