import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getUserWishlist, saveWishlist, clearUserWishlist } from "@/services/wishlistService";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  badge?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();

  // Load wishlist from Firestore (only for logged-in users)
  useEffect(() => {
    const loadWishlist = async () => {
      if (!loading) {
        setIsLoadingWishlist(true);
        if (user) {
          // Logged-in user: Load from Firestore
          try {
            const wishlistItems = await getUserWishlist(user.uid);
            setItems(wishlistItems);
          } catch (error) {
            console.error('Error loading wishlist:', error);
            setItems([]);
          }
        } else {
          // No user logged in: Clear wishlist
          setItems([]);
        }
        setIsInitialized(true);
        setIsLoadingWishlist(false);
      }
    };

    loadWishlist();
  }, [user, loading]);

  // Save wishlist to Firestore whenever items change
  useEffect(() => {
    const syncWishlist = async () => {
      // Don't save during initial load or when user is not logged in
      if (isInitialized && user && !isLoadingWishlist) {
        try {
          await saveWishlist(user.uid, items);
        } catch (error) {
          console.error('Error syncing wishlist:', error);
        }
      }
    };

    syncWishlist();
  }, [items, user, isInitialized, isLoadingWishlist]);

  const addItem = (item: WishlistItem) => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your wishlist",
        variant: "destructive",
      });
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/account';
      }, 1500);
      return;
    }

    setItems((prevItems) => {
      if (prevItems.find((i) => i.id === item.id)) {
        return prevItems;
      }
      
      toast({
        title: "Added to wishlist ❤️",
        description: `${item.name} has been added to your wishlist`,
      });
      
      return [...prevItems, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => {
      const item = prevItems.find((i) => i.id === id);
      if (item) {
        toast({
          title: "Removed from wishlist",
          description: `${item.name} has been removed from your wishlist`,
        });
      }
      return prevItems.filter((item) => item.id !== id);
    });
  };

  const isInWishlist = (id: string) => {
    return items.some((item) => item.id === id);
  };

  const toggleWishlist = (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeItem(item.id);
    } else {
      addItem(item);
    }
  };

  const clearWishlist = async () => {
    setItems([]);
    if (user) {
      try {
        await clearUserWishlist(user.uid);
      } catch (error) {
        console.error('Error clearing wishlist:', error);
      }
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


