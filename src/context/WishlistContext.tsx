import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  addItemToWishlist,
  clearUserWishlist,
  getUserWishlist,
  removeItemFromWishlist,
  type WishlistItem,
} from "@/services/wishlistService";

type WishlistTogglePayload = {
  id: string;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  badge?: string;
};

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistTogglePayload) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (item: WishlistTogglePayload) => void;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const { toast } = useToast();
  const { user, loading } = useAuth();

  useEffect(() => {
    const loadWishlist = async () => {
      if (!loading) {
        if (user) {
          try {
            const wishlistItems = await getUserWishlist();
            setItems(wishlistItems);
          } catch (error: unknown) {
            console.error("Error loading wishlist:", error);
            toast({
              title: "Error Loading Wishlist",
              description:
                error instanceof Error
                  ? error.message
                  : "Failed to load wishlist. Please try again.",
              variant: "destructive",
            });
            setItems([]);
          }
        } else {
          setItems([]);
        }
      }
    };

    loadWishlist();
  }, [user, loading]);

  const addItem = (item: WishlistTogglePayload) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your wishlist",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/account";
      }, 1500);
      return;
    }

    if (items.find((wishlistItem) => wishlistItem.productId === item.id)) {
      return;
    }

    void (async () => {
      try {
        const wishlistItems = await addItemToWishlist(item.id);
        setItems(wishlistItems);
        toast({
          title: "Added to wishlist ❤️",
          description: `${item.name} has been added to your wishlist`,
        });
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 409) {
          return;
        }
        console.error("Error adding to wishlist:", error);
        toast({
          title: "Error",
          description: "Failed to add item to wishlist. Please try again.",
          variant: "destructive",
        });
      }
    })();
  };

  const removeItem = (id: string) => {
    const item =
      items.find((wishlistItem) => wishlistItem.id === id) ||
      items.find((wishlistItem) => wishlistItem.productId === id);

    if (!item) {
      return;
    }

    void (async () => {
      try {
        const wishlistItems = await removeItemFromWishlist(item.id);
        setItems(wishlistItems);
        toast({
          title: "Removed from wishlist",
          description: `${item.name} has been removed from your wishlist`,
        });
      } catch (error) {
        console.error("Error removing wishlist item:", error);
        toast({
          title: "Error",
          description: "Failed to remove item. Please try again.",
          variant: "destructive",
        });
      }
    })();
  };

  const isInWishlist = (id: string) => {
    return items.some((item) => item.productId === id);
  };

  const toggleWishlist = (item: WishlistTogglePayload) => {
    if (isInWishlist(item.id)) {
      removeItem(item.id);
    } else {
      addItem(item);
    }
  };

  const clearWishlist = async () => {
    if (user) {
      try {
        const wishlistItems = await clearUserWishlist();
        setItems(wishlistItems);
      } catch (error) {
        console.error("Error clearing wishlist:", error);
        toast({
          title: "Error",
          description: "Failed to clear wishlist. Please try again.",
          variant: "destructive",
        });
        return;
      }
    } else {
      setItems([]);
    }

    toast({
      title: "Wishlist cleared",
      description: "All items have been removed from your wishlist",
    });
  };

  const totalItems = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
        totalItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
