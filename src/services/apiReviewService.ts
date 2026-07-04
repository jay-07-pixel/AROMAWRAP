import { apiFetch } from "@/lib/api";

export interface ApiReview {
  id: string;
  productId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SubmitReviewRequest {
  rating: number;
  title?: string;
  comment?: string;
}

type ReviewsListResponse = {
  success: true;
  data: {
    items: ApiReview[];
    pagination: ReviewPagination;
  };
};

type ReviewResponse = {
  success: true;
  data: ApiReview | null;
};

type SingleReviewResponse = {
  success: true;
  data: ApiReview;
};

export async function fetchProductReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<ReviewsListResponse["data"]> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const data = await apiFetch<ReviewsListResponse>(
    `/api/products/${productId}/reviews?${params}`
  );
  return data.data;
}

export async function fetchMyProductReview(
  productId: string
): Promise<ApiReview | null> {
  const data = await apiFetch<ReviewResponse>(
    `/api/products/${productId}/reviews/me`
  );
  return data.data;
}

export async function submitProductReviewApi(
  productId: string,
  body: SubmitReviewRequest
): Promise<ApiReview> {
  const data = await apiFetch<SingleReviewResponse>(
    `/api/products/${productId}/reviews`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
  return data.data;
}
