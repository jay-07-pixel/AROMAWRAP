import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface RecentlyViewedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  badge?: string;
}

interface RecentlyViewedContextType {
  products: RecentlyViewedProduct[];
  addProduct: (product: RecentlyViewedProduct) => void;
  clearAll: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export const RecentlyViewedProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("recentlyViewed");
    if (stored) {
      try {
        setProducts(JSON.parse(stored));
      } catch (error) {
        console.error("Error parsing recently viewed:", error);
      }
    }
  }, []);

  // Save to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem("recentlyViewed", JSON.stringify(products));
  }, [products]);

  const addProduct = (product: RecentlyViewedProduct) => {
    setProducts((prev) => {
      // Remove if already exists to avoid duplicates
      const filtered = prev.filter((p) => p.id !== product.id);
      // Add to beginning and limit to 10 products
      return [product, ...filtered].slice(0, 10);
    });
  };

  const clearAll = () => {
    setProducts([]);
    localStorage.removeItem("recentlyViewed");
  };

  return (
    <RecentlyViewedContext.Provider value={{ products, addProduct, clearAll }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider");
  }
  return context;
}





