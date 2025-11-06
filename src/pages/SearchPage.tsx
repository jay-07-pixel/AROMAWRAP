import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, TrendingUp, Clock } from "lucide-react";
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

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Default products for search
  const defaultProducts = [
    {
      id: "prod-1",
      name: "Lavender Bliss Agarbatti - Premium Natural Collection (Pack of 12)",
      price: 299,
      originalPrice: 399,
      image: img1,
      badge: "Bestseller",
      category: "Agarbatti",
    },
    {
      id: "prod-2",
      name: "Sandalwood Essence Dhoop Sticks - Traditional (Pack of 20)",
      price: 349,
      originalPrice: 449,
      image: img4,
      badge: "New",
      category: "Dhoop",
    },
    {
      id: "prod-3",
      name: "Jasmine Dreams Incense Cones - Aromatic Collection",
      price: 199,
      originalPrice: 279,
      image: img2,
      category: "Cones",
    },
    {
      id: "prod-4",
      name: "Divine Puja Gift Set - Complete Essentials Kit",
      price: 799,
      originalPrice: 1099,
      image: img3,
      badge: "Limited",
      category: "Gift Set",
    },
    {
      id: "prod-5",
      name: "Rose Garden Agarbatti - Natural Fragrance (Pack of 10)",
      price: 249,
      originalPrice: 329,
      image: img5,
      category: "Agarbatti",
    },
    {
      id: "prod-6",
      name: "Tulsi Basil Dhoop Cones - Sacred Collection",
      price: 179,
      originalPrice: 249,
      image: img6,
      badge: "Bestseller",
      category: "Dhoop",
    },
    {
      id: "prod-7",
      name: "Mogra Magic Incense Sticks - Evening Collection",
      price: 279,
      originalPrice: 349,
      image: img2,
      category: "Agarbatti",
    },
    {
      id: "prod-8",
      name: "Camphor Pure Karpure - Natural Havan (Pack of 50)",
      price: 399,
      originalPrice: 499,
      image: img7,
      badge: "New",
      category: "Karpure",
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
    "Rose Dhoop",
    "Jasmine Cones",
    "Puja Gift Set",
    "Premium Collection",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 bg-gradient-to-br from-[#DC143C]/20 to-[#DC143C]/30 rounded-xl flex items-center justify-center">
              <Search className="h-6 w-6 text-[#DC143C]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#DC143C]">
                Search Products
              </h1>
              <p className="text-muted-foreground mt-1">
                Find your perfect incense and puja essentials
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-3xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products, categories, or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-24 h-14 text-lg border-2 focus:border-[#DC143C] rounded-xl shadow-md"
                autoFocus
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-20 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#DC143C] hover:bg-[#801030] h-10"
              >
                Search
              </Button>
            </div>
          </form>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-md mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#DC143C]" />
                    Recent Searches
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(search);
                        navigate(`/search?q=${encodeURIComponent(search)}`);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#DC143C]" />
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-[#DC143C] hover:text-white transition-colors"
                    onClick={() => {
                      setSearchQuery(search);
                      navigate(`/search?q=${encodeURIComponent(search)}`);
                    }}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              {searchQuery ? (
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <p className="text-lg">
                    Found <span className="font-bold text-[#DC143C]">{filteredProducts.length}</span> products for{" "}
                    <span className="font-semibold">"{searchQuery}"</span>
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <p className="text-lg">
                    Showing <span className="font-bold text-[#DC143C]">{filteredProducts.length}</span> products
                  </p>
                </div>
              )}
            </motion.div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
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
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-12 text-center shadow-md"
              >
                <div className="h-24 w-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or browse our categories
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="bg-[#DC143C] hover:bg-[#801030]"
                >
                  Back to Home
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;


