import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Filter, SortAsc, ChevronDown } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { listProducts, mapUiSortToApiSort, type ProductListItem } from "@/services/productService";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { useEffect, useMemo, useState } from "react";

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  
  // Filter states
  const [filters, setFilters] = useState({
    price: "all",
    brand: "all", 
    size: "all",
    productType: "all",
    burningTime: "all",
    lengthOfStick: "all",
    typeOfBathi: "all"
  });
  
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [baseProducts, setBaseProducts] = useState<ProductListItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      if (!category) {
        setBaseProducts([]);
        setIsLoadingProducts(false);
        return;
      }

      setIsLoadingProducts(true);
      setProductsError(null);

      try {
        const { items, pagination } = await listProducts({
          category,
          sort: mapUiSortToApiSort(sortBy),
          page,
          limit: 20,
        });

        if (!active) return;

        setBaseProducts(items);
        setTotalPages(pagination.totalPages);
      } catch (error) {
        console.error("Error loading category products:", error);
        if (!active) return;
        setBaseProducts([]);
        setProductsError("Failed to load products. Please try again.");
      } finally {
        if (active) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [category, sortBy, page]);

  useEffect(() => {
    setPage(1);
  }, [category, sortBy, filters]);
  const getCategoryName = (categoryParam: string | undefined) => {
    if (!categoryParam) return "Products";
    
    // Convert URL parameter to display name
    const categoryMap: { [key: string]: string } = {
      "agarbatti": "Agarbatti",
      "sandalwood-dhoop": "Dhoop",
    };
    
    return categoryMap[categoryParam] || categoryParam.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const categoryName = getCategoryName(category);
  const applyFilters = (products: any[]) => {
    return products.filter(product => {
      // Price filter
      if (filters.price !== "all") {
        const price = product.price;
        switch (filters.price) {
          case "under-500":
            if (price >= 500) return false;
            break;
          case "500-1000":
            if (price < 500 || price > 1000) return false;
            break;
          case "1000-2000":
            if (price < 1000 || price > 2000) return false;
            break;
          case "above-2000":
            if (price <= 2000) return false;
            break;
        }
      }

      // Brand filter (based on badge/name)
      if (filters.brand !== "all") {
        const productText = (product.name + " " + (product.badge || "")).toLowerCase();
        if (!productText.includes(filters.brand.toLowerCase())) return false;
      }

      return true;
    });
  };

  // Apply sorting
  const applySorting = (products: any[]) => {
    const sorted = [...products];
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "newest":
        return sorted.sort((a, b) => b.id.localeCompare(a.id));
      case "popular":
        return sorted.sort((a, b) => (b.badge === "Bestseller" ? 1 : -1));
      default:
        return sorted;
    }
  };

  const filteredProducts = useMemo(
    () => applySorting(applyFilters(baseProducts)),
    [baseProducts, filters, sortBy]
  );
  const products = filteredProducts;

  // Filter options
  const filterOptions = {
    price: [
      { value: "all", label: "All Prices" },
      { value: "under-500", label: "Under ₹500" },
      { value: "500-1000", label: "₹500 - ₹1000" },
      { value: "1000-2000", label: "₹1000 - ₹2000" },
      { value: "above-2000", label: "Above ₹2000" }
    ],
    brand: [
      { value: "all", label: "All Brands" },
      { value: "premium", label: "Premium" },
      { value: "traditional", label: "Traditional" },
      { value: "organic", label: "Organic" },
      { value: "handcrafted", label: "Handcrafted" }
    ],
    size: [
      { value: "all", label: "All Sizes" },
      { value: "small", label: "Small (10-15 sticks)" },
      { value: "medium", label: "Medium (15-20 sticks)" },
      { value: "large", label: "Large (20+ sticks)" }
    ],
    productType: [
      { value: "all", label: "All Types" },
      { value: "agarbatti", label: "Agarbatti" },
      { value: "dhoop", label: "Dhoop Sticks" },
      { value: "cones", label: "Incense Cones" },
      { value: "powder", label: "Incense Powder" }
    ],
    burningTime: [
      { value: "all", label: "All Burning Times" },
      { value: "30-min", label: "30 minutes" },
      { value: "45-min", label: "45 minutes" },
      { value: "60-min", label: "60 minutes" },
      { value: "90-min", label: "90+ minutes" }
    ],
    lengthOfStick: [
      { value: "all", label: "All Lengths" },
      { value: "short", label: "Short (6-8 inches)" },
      { value: "medium", label: "Medium (8-10 inches)" },
      { value: "long", label: "Long (10+ inches)" }
    ],
    typeOfBathi: [
      { value: "all", label: "All Types" },
      { value: "cow-dung", label: "Cow Dung" },
      { value: "charcoal", label: "Charcoal" },
      { value: "sandalwood", label: "Sandalwood" },
      { value: "mixed", label: "Mixed" }
    ]
  };

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" }
  ];

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      price: "all",
      brand: "all", 
      size: "all",
      productType: "all",
      burningTime: "all",
      lengthOfStick: "all",
      typeOfBathi: "all"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <CartDrawer />
      <Header />

      {/* Category Header */}
      <section className="bg-background pt-2 pb-1 sm:pt-3 sm:pb-2">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-1">
            <button 
              onClick={() => navigate("/")}
              className="text-[#C75D5D] hover:text-[#801030] transition-colors"
            >
              Home
            </button>
            <span className="text-[#C75D5D]/60">/</span>
            <button 
              onClick={() => navigate("/")}
              className="text-[#C75D5D] hover:text-[#801030] transition-colors"
            >
              Collections
            </button>
            <span className="text-[#C75D5D]/60">/</span>
            <span className="text-[#2E1A1A] font-semibold">{categoryName}</span>
          </div>
          
          {/* Page Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-1">
            {categoryName}
          </h1>
        </div>
      </section>

      {/* Products Grid */}
      <section className="pt-2 pb-4 sm:pt-3 sm:pb-6 bg-background">
        <div className="container mx-auto px-3 sm:px-4">
          {isLoadingProducts ? (
            <ProductGridSkeleton count={8} />
          ) : productsError ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Unable to load products</h3>
              <p className="text-muted-foreground mb-4 text-sm">{productsError}</p>
              <Button size="sm" onClick={() => setPage(1)}>
                Try Again
              </Button>
            </div>
          ) : products.length > 0 ? (
            <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-in fade-in slide-in-from-bottom"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
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
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                We're working on adding more products to this category.
              </p>
              <Button size="sm" onClick={() => navigate("/")}>
                Browse All Products
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CategoryPage;
