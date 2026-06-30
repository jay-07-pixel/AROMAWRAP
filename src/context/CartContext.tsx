import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  addItemToCart,
  clearUserCart,
  getUserCart,
  removeItemFromCart,
  updateCartItemQuantity,
  type CartItem,
} from "@/services/cartService";

type AddToCartPayload = {
  id: string;
  name: string;
  price: number;
  image: string;
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: AddToCartPayload) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: (silent?: boolean) => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();

  useEffect(() => {
    const loadCart = async () => {
      if (!loading) {
        if (user) {
          try {
            const cartItems = await getUserCart();
            setItems(cartItems);
          } catch (error) {
            console.error("Error loading cart:", error);
            setItems([]);
          }
        } else {
          setItems([]);
        }
      }
    };

    loadCart();
  }, [user, loading]);

  const addItem = (item: AddToCartPayload) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/account";
      }, 1500);
      return;
    }

    const existingItem = items.find((cartItem) => cartItem.productId === item.id);

    void (async () => {
      try {
        const cartItems = await addItemToCart(item.id, 1);
        setItems(cartItems);

        if (existingItem) {
          toast({
            title: "Updated cart",
            description: `${item.name} quantity increased`,
          });
        } else {
          toast({
            title: "Added to cart",
            description: `${item.name} has been added to your cart`,
          });
        }

        setIsCartOpen(true);
      } catch (error) {
        console.error("Error adding item to cart:", error);
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive",
        });
      }
    })();
  };

  const removeItem = (id: string) => {
    void (async () => {
      try {
        const cartItems = await removeItemFromCart(id);
        setItems(cartItems);
        toast({
          title: "Removed from cart",
          description: "Item has been removed from your cart",
        });
      } catch (error) {
        console.error("Error removing cart item:", error);
        toast({
          title: "Error",
          description: "Failed to remove item. Please try again.",
          variant: "destructive",
        });
      }
    })();
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    void (async () => {
      try {
        const cartItems = await updateCartItemQuantity(id, quantity);
        setItems(cartItems);
      } catch (error) {
        console.error("Error updating cart quantity:", error);
        toast({
          title: "Error",
          description: "Failed to update quantity. Please try again.",
          variant: "destructive",
        });
      }
    })();
  };

  const clearCart = async (silent: boolean = false) => {
    if (user) {
      try {
        const cartItems = await clearUserCart();
        setItems(cartItems);
      } catch (error) {
        console.error("Error clearing cart:", error);
        if (!silent) {
          toast({
            title: "Error",
            description: "Failed to clear cart. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
    } else {
      setItems([]);
    }

    if (!silent) {
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export { useCart };
