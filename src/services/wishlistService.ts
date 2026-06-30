import {
  addWishlistItem,
  clearWishlist as clearWishlistApi,
  getWishlist,
  removeWishlistItem,
  type ApiWishlist,
} from "@/services/wishlistApiService";

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  badge?: string;
}

export function mapApiWishlistToItems(wishlist: ApiWishlist): WishlistItem[] {
  return wishlist.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    price: item.price,
    image: item.image || "/placeholder.svg",
    originalPrice: item.originalPrice ?? undefined,
    badge: item.badge ?? undefined,
  }));
}

export const getUserWishlist = async (): Promise<WishlistItem[]> => {
  try {
    const wishlist = await getWishlist();
    return mapApiWishlistToItems(wishlist);
  } catch (error) {
    console.error("Error getting wishlist:", error);
    throw error;
  }
};

export const addItemToWishlist = async (
  productId: string
): Promise<WishlistItem[]> => {
  const wishlist = await addWishlistItem(productId);
  return mapApiWishlistToItems(wishlist);
};

export const removeItemFromWishlist = async (
  itemId: string
): Promise<WishlistItem[]> => {
  const wishlist = await removeWishlistItem(itemId);
  return mapApiWishlistToItems(wishlist);
};

export const clearUserWishlist = async (): Promise<WishlistItem[]> => {
  try {
    const wishlist = await clearWishlistApi();
    return mapApiWishlistToItems(wishlist);
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    throw error;
  }
};
