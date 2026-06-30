import {
  addCartItem,
  clearCart as clearCartApi,
  getCart,
  removeCartItem,
  updateCartItem,
  type ApiCart,
} from "@/services/cartApiService";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export function mapApiCartToItems(cart: ApiCart): CartItem[] {
  return cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    price: item.price,
    image: item.image || "/placeholder.svg",
    quantity: item.quantity,
  }));
}

export const getUserCart = async (): Promise<CartItem[]> => {
  try {
    const cart = await getCart();
    return mapApiCartToItems(cart);
  } catch (error) {
    console.error("Error getting cart:", error);
    throw error;
  }
};

export const addItemToCart = async (
  productId: string,
  quantity = 1
): Promise<CartItem[]> => {
  const cart = await addCartItem(productId, quantity);
  return mapApiCartToItems(cart);
};

export const updateCartItemQuantity = async (
  itemId: string,
  quantity: number
): Promise<CartItem[]> => {
  const cart = await updateCartItem(itemId, quantity);
  return mapApiCartToItems(cart);
};

export const removeItemFromCart = async (
  itemId: string
): Promise<CartItem[]> => {
  const cart = await removeCartItem(itemId);
  return mapApiCartToItems(cart);
};

export const clearUserCart = async (): Promise<CartItem[]> => {
  try {
    const cart = await clearCartApi();
    return mapApiCartToItems(cart);
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};
