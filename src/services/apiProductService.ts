import { apiFetch } from "@/lib/api";

export type ProductSort = "newest" | "price-low" | "price-high" | "name-asc";

export interface ApiProductImage {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  stock: number;
  rating: number | null;
  reviewsCount: number | null;
  image: string | null;
  images: ApiProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListProductsParams {
  category?: string;
  search?: string;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

type ListProductsResponse = {
  success: true;
  data: {
    items: ApiProduct[];
    pagination: ProductPagination;
  };
};

type ProductResponse = {
  success: true;
  data: ApiProduct;
};

function buildQueryString(params: ListProductsParams): string {
  const searchParams = new URLSearchParams();

  if (params.category) searchParams.set("category", params.category);
  if (params.search) searchParams.set("search", params.search);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function fetchProducts(
  params: ListProductsParams = {}
): Promise<ListProductsResponse["data"]> {
  const data = await apiFetch<ListProductsResponse>(
    `/api/products${buildQueryString(params)}`
  );
  return data.data;
}

export async function fetchProductById(id: string): Promise<ApiProduct> {
  const data = await apiFetch<ProductResponse>(`/api/products/${id}`);
  return data.data;
}

export async function fetchProductBySlug(slug: string): Promise<ApiProduct> {
  const data = await apiFetch<ProductResponse>(
    `/api/products/slug/${encodeURIComponent(slug)}`
  );
  return data.data;
}

export interface CreateProductRequest {
  name: string;
  slug?: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  badge?: string | null;
  stock?: number;
  rating?: number | null;
  reviewsCount?: number | null;
  images: Array<{ imageUrl: string; sortOrder?: number }>;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

type DeleteProductResponse = {
  success: true;
  data: { id: string };
};

export async function createProductApi(
  body: CreateProductRequest
): Promise<ApiProduct> {
  const data = await apiFetch<ProductResponse>("/api/products", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return data.data;
}

export async function updateProductApi(
  id: string,
  body: UpdateProductRequest
): Promise<ApiProduct> {
  const data = await apiFetch<ProductResponse>(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return data.data;
}

export async function deleteProductApi(id: string): Promise<void> {
  await apiFetch<DeleteProductResponse>(`/api/products/${id}`, {
    method: "DELETE",
  });
}
