import type { Review, User } from "@prisma/client";

type ReviewWithUser = Review & {
  user: Pick<User, "displayName">;
};

export function serializeReview(review: ReviewWithUser) {
  return {
    id: review.id,
    productId: review.productId,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    authorName: review.user.displayName,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}
