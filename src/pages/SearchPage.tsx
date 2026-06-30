import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import {
  listProducts,
  type ProductListItem,
} from "@/services/productService";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error("Error parsing recent searches:", error);
      }
    }
  }, []);

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);

    if (query.trim()) {
      saveRecentSearch(query);
    }
  }, [searchParams]);

  useEffect(() => {
    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
      setProducts([]);
      setIsLoading(false);
      setSearchError(null);
      setTotalResults(0);
      setTotalPages(1);
      return;
    }

    let active = true;

    const runSearch = async () => {
      setIsLoading(true);
      setSearchError(null);

      try {
        const { items, pagination } = await listProducts({
          search: query,
          sort: "newest",
          page,
          limit: 20,
        });

        if (!active) return;

        setProducts(items);
        setTotalPages(pagination.totalPages);
        setTotalResults(pagination.total);
      } catch (error) {
        console.error("Error searching products:", error);
        if (!active) return;
        setProducts([]);
        setSearchError("Failed to search products. Please try again.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    runSearch();

    return () => {
      active = false;
    };
  }, [searchParams, page]);

  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;

    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(
      0,
      5
    );
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const filteredProducts = products;
  const activeQuery = searchParams.get("q")?.trim() || "";

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
        {!activeQuery && (
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

        {activeQuery && (
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Showing{" "}
                  <span className="font-bold text-primary">{totalResults}</span>{" "}
                  results for{" "}
                  <span className="font-semibold">"{activeQuery}"</span>
                </p>
              </div>
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

        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : searchError ? (
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center shadow-sm">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              Search unavailable
            </h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              {searchError}
            </p>
            <Button
              onClick={() => navigate(`/search?q=${encodeURIComponent(activeQuery)}`)}
              className="bg-primary hover:bg-secondary"
            >
              Try Again
            </Button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
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
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : activeQuery ? (
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center shadow-sm">
            <div className="h-16 w-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              No products found
            </h3>
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
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              Search for products
            </h3>
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
