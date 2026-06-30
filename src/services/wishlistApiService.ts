import { apiFetch } from "@/lib/api";

export interface ApiWishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  badge: string | null;
  createdAt: string;
}

export interface ApiWishlist {
  id: string;
  items: ApiWishlistItem[];
  totalItems: number;
  updatedAt: string;
}

type WishlistResponse = {
  success: true;
  data: ApiWishlist;
};

export async function getWishlist(): Promise<ApiWishlist> {
  const response = await apiFetch<WishlistResponse>("/api/wishlist");
  return response.data;
}

export async function addWishlistItem(productId: string): Promise<ApiWishlist> {
  const response = await apiFetch<WishlistResponse>("/api/wishlist/items", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
  return response.data;
}

export async function removeWishlistItem(itemId: string): Promise<ApiWishlist> {
  const response = await apiFetch<WishlistResponse>(
    `/api/wishlist/items/${itemId}`,
    {
      method: "DELETE",
    }
  );
  return response.data;
}

export async function clearWishlist(): Promise<ApiWishlist> {
  const response = await apiFetch<WishlistResponse>("/api/wishlist", {
    method: "DELETE",
  });
  return response.data;
}
