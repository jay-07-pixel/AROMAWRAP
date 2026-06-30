import { apiFetch } from "@/lib/api";

export interface ApiCartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  lineTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCart {
  id: string;
  items: ApiCartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: string;
}

type CartResponse = {
  success: true;
  data: ApiCart;
};

export async function getCart(): Promise<ApiCart> {
  const response = await apiFetch<CartResponse>("/api/cart");
  return response.data;
}

export async function addCartItem(
  productId: string,
  quantity = 1
): Promise<ApiCart> {
  const response = await apiFetch<CartResponse>("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
  return response.data;
}

export async function updateCartItem(
  itemId: string,
  quantity: number
): Promise<ApiCart> {
  const response = await apiFetch<CartResponse>(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
  return response.data;
}

export async function removeCartItem(itemId: string): Promise<ApiCart> {
  const response = await apiFetch<CartResponse>(`/api/cart/items/${itemId}`, {
    method: "DELETE",
  });
  return response.data;
}

export async function clearCart(): Promise<ApiCart> {
  const response = await apiFetch<CartResponse>("/api/cart", {
    method: "DELETE",
  });
  return response.data;
}
