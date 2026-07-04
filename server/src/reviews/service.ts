import { prisma } from "../lib/prisma.js";
import type { SubmitReviewInput } from "./schemas.js";

const reviewInclude = {
  user: {
    select: { displayName: true },
  },
} as const;

export async function syncProductRating(productId: string): Promise<void> {
  const aggregate = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: aggregate._count.id > 0 ? aggregate._avg.rating : null,
      reviewsCount: aggregate._count.id,
    },
  });
}

export async function listProductReviews(
  productId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where: { productId } }),
    prisma.review.findMany({
      where: { productId },
      include: reviewInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    items: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getUserReviewForProduct(
  productId: string,
  userId: string
) {
  return prisma.review.findUnique({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
    include: reviewInclude,
  });
}

function normalizeComment(comment?: string): string | null {
  const trimmed = comment?.trim();
  return trimmed ? trimmed : null;
}

export async function submitProductReview(
  productId: string,
  userId: string,
  input: SubmitReviewInput
) {
  const comment = normalizeComment(input.comment);

  const review = await prisma.review.upsert({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
    create: {
      productId,
      userId,
      rating: input.rating,
      title: input.title ?? null,
      comment,
    },
    update: {
      rating: input.rating,
      title: input.title ?? null,
      ...(input.comment !== undefined
        ? { comment: normalizeComment(input.comment) }
        : {}),
    },
    include: reviewInclude,
  });

  await syncProductRating(productId);

  return review;
}
