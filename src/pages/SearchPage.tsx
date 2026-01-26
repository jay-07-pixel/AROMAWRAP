import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// Product images served from public/products. Please place files there.
const img1 = "/products/IMG-20251017-WA0022.jpg";
const img2 = "/products/IMG-20251017-WA0023.jpg";
const img3 = "/products/IMG-20251017-WA0024.jpg";
const img4 = "/products/IMG-20251017-WA0033.jpg";
const img5 = "/products/IMG-20251017-WA0037.jpg";
const img6 = "/products/IMG-20251017-WA0025.jpg";
const img7 = "/products/IMG-20251017-WA0026.jpg";
const img8 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Sandalwood%20Front.png?alt=media&token=a7ee7aaa-993f-41ac-b35a-392635fedce5";
const img9 = "/products/oudh-premium-dhoop.jpg";
const img10 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/mannat%20front.png?alt=media&token=0e407864-da64-4bc4-9133-12b64810ab89";
const img11 = "/products/mahadev-dhoop.jpg";
const img12 = "/products/sai-baba-dhoop.jpg";
const img13 = "/products/tornado-dhoop.jpg";
const img14 = "/products/devi-dhoop.jpg";
const img17 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Mahadev%20dhoop%20front.jpeg?alt=media&token=669c8f3a-2d99-4253-b38e-2f9a968f0998";
const img18 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Saibaba%20Dhoop%20Front.jpeg?alt=media&token=430ed46d-f7d3-4a17-ac41-a0482804e870";
const img19 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Tornado%20Dhoop%20Front.jpeg?alt=media&token=3297f953-b5fa-41af-b62b-e9198d3a4e36";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Default products for search
  const defaultProducts = [
    {
      id: "sandalwood-dhoop-1",
      name: "AromaWrap Devi Premium Dhoop",
      price: 399,
      originalPrice: 499,
      image: img14,
      badge: "Premium",
      category: "Dhoop",
    },
    {
      id: "delux-dhoop",
      name: "AromaWrap Mannat Delux Dhoop",
      price: 449,
      originalPrice: 549,
      image: img10,
      badge: "Premium",
      category: "Dhoop",
    },
    {
      id: "mahadev-dhoop",
      name: "AromaWrap Mahadev Dhoop",
      price: 399,
      originalPrice: 499,
      image: img17,
      badge: "New",
      category: "Dhoop",
    },
    {
      id: "sai-baba-dhoop",
      name: "AromaWrap Sai Baba Dhoop Premium Dhoop Cones",
      price: 379,
      originalPrice: 479,
      image: img18,
      badge: "Bestseller",
      category: "Dhoop",
    },
    {
      id: "tornado-dhoop",
      name: "AromaWrap Tornado Dhoop Premium Dhoop Cones",
      price: 429,
      originalPrice: 529,
      image: img19,
      badge: "Premium",
      category: "Dhoop",
    },
    {
      id: "premium-sandalwood-agarbatti-new",
      name: "Premium Sandalwood Agarbatti",
      price: 150,
      image: img8,
      badge: "New",
      category: "Agarbatti",
    },
  ];

  // Load admin products and recent searches
  useEffect(() => {
    const storedProducts = localStorage.getItem("adminProducts");
    if (storedProducts) {
      try {
        setAdminProducts(JSON.parse(storedProducts));
      } catch (error) {
        console.error("Error parsing admin products:", error);
      }
    }

    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error("Error parsing recent searches:", error);
      }
    }
  }, []);

  // Update search query from URL
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      saveRecentSearch(query);
    }
  }, [searchParams]);

  // Save recent search
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Filter products based on search query
  const allProducts = [...adminProducts, ...defaultProducts];
  const filteredProducts = searchQuery.trim()
    ? allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.badge?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allProducts;

  const trendingSearches = [
    "Sandalwood Agarbatti",
    "Sandalwood Dhoop",
    "Premium Sandalwood",
    "Classic Sandalwood",
    "Sandalwood Collection",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Search Bar - Only show when no search query or show at top */}
        {!searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                  placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-20 h-12 text-base border-2 focus:border-primary rounded-lg"
                autoFocus
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                    className="absolute right-16 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-secondary h-8"
              >
                Search
              </Button>
            </div>
          </form>
        </motion.div>
        )}

        {/* Results Header */}
        {searchQuery && (
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Showing <span className="font-bold text-primary">{filteredProducts.length}</span> results for{" "}
                  <span className="font-semibold">"{searchQuery}"</span>
                </p>
              </div>
              {/* Search Bar in Results */}
              <form onSubmit={handleSearch} className="relative max-w-xs w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 h-9 text-sm border focus:border-primary rounded-md"
                  />
                  {searchQuery && (
                  <Button
                      type="button"
                    variant="ghost"
                    size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        navigate("/search");
                      }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  >
                      <X className="h-3 w-3" />
                  </Button>
                  )}
                </div>
              </form>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard {...product} />
                  </motion.div>
                ))}
              </motion.div>
        ) : searchQuery ? (
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center shadow-sm">
            <div className="h-16 w-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
                </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                  Try adjusting your search or browse our categories
                </p>
                <Button
                  onClick={() => navigate("/")}
              className="bg-primary hover:bg-secondary"
                >
                  Back to Home
                </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center shadow-sm">
            <div className="h-16 w-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
          </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Search for products</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Enter a search term above to find products
            </p>
        </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;


