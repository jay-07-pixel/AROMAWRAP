import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getUserCart, saveCart, clearUserCart } from "@/services/cartService";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();

  // Load cart from Firestore (only for logged-in users)
  useEffect(() => {
    const loadCart = async () => {
      if (!loading) {
        setIsLoadingCart(true);
        if (user) {
          // Logged-in user: Load from Firestore
          try {
            const cartItems = await getUserCart(user.uid);
            setItems(cartItems);
          } catch (error) {
            console.error('Error loading cart from Firestore:', error);
            setItems([]);
          }
        } else {
          // No user logged in: Clear cart
          setItems([]);
        }
        setIsInitialized(true);
        setIsLoadingCart(false);
      }
    };

    loadCart();
  }, [user, loading]);

  // Save cart to Firestore whenever items change
  useEffect(() => {
    const syncCart = async () => {
      // Don't save during initial load or when user is not logged in
      if (isInitialized && user && !isLoadingCart) {
        try {
          await saveCart(user.uid, items);
        } catch (error) {
          console.error('Error syncing cart to Firestore:', error);
        }
      }
    };

    syncCart();
  }, [items, user, isInitialized, isLoadingCart]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      });
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/account';
      }, 1500);
      return;
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      
      if (existingItem) {
        toast({
          title: "Updated cart",
          description: `${item.name} quantity increased`,
        });
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      
      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart`,
      });
      
      return [...prevItems, { ...item, quantity: 1 }];
    });
    
    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    setItems([]);
    if (user) {
      try {
        await clearUserCart(user.uid);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
