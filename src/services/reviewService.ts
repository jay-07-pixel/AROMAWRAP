import { ApiError } from "@/lib/api";
import {
  fetchMyProductReview,
  fetchProductReviews,
  submitProductReviewApi,
  type ApiReview,
  type ReviewPagination,
  type SubmitReviewRequest,
} from "@/services/apiReviewService";

export interface ProductReview {
  id: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReviewsResult {
  items: ProductReview[];
  pagination: ReviewPagination;
}

function mapReview(review: ApiReview): ProductReview {
  return {
    id: review.id,
    productId: review.productId,
    rating: review.rating,
    title: review.title ?? undefined,
    comment: review.comment ?? undefined,
    authorName: review.authorName,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

export async function listProductReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<ProductReviewsResult> {
  const data = await fetchProductReviews(productId, page, limit);
  return {
    items: data.items.map(mapReview),
    pagination: data.pagination,
  };
}

export async function getMyProductReview(
  productId: string
): Promise<ProductReview | null> {
  try {
    const review = await fetchMyProductReview(productId);
    return review ? mapReview(review) : null;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) {
      return null;
    }
    throw error;
  }
}

export async function submitProductReview(
  productId: string,
  input: SubmitReviewRequest
): Promise<ProductReview> {
  const review = await submitProductReviewApi(productId, input);
  return mapReview(review);
}

export function formatReviewDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function renderStarCount(rating: number, max = 5): number {
  return Math.min(max, Math.max(0, Math.round(rating)));
}
