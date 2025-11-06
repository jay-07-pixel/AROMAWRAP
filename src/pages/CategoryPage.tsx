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
import { useState } from "react";
// Product images served from public/products. Please place files there.
const img1 = "/products/IMG-20251017-WA0022.jpg";
const img2 = "/products/IMG-20251017-WA0023.jpg";
const img3 = "/products/IMG-20251017-WA0024.jpg";
const img4 = "/products/IMG-20251017-WA0033.jpg";
const img5 = "/products/IMG-20251017-WA0037.jpg";
const img6 = "/products/IMG-20251017-WA0025.jpg";
const img7 = "/products/IMG-20251017-WA0026.jpg";

// Sample products for different categories
const categoryProducts = {
  "sandalwood-dhoop": [
    {
      id: "sandalwood-dhoop-1",
      name: "Premium Sandalwood Dhoop - Traditional (Pack of 20)",
      price: 399,
      originalPrice: 499,
      image: img1,
      badge: "Bestseller",
    },
    {
      id: "sand-dhoop-2", 
      name: "Classic Sandalwood Dhoop - Handcrafted (Pack of 15)",
      price: 299,
      originalPrice: 399,
      image: img4,
      badge: "New",
    },
    {
      id: "sand-dhoop-3",
      name: "Pure Sandalwood Dhoop - Organic (Pack of 25)",
      price: 549,
      originalPrice: 699,
      image: img6,
      badge: "Premium",
    },
  ],
  "rose-dhoop": [
    {
      id: "rose-dhoop-1",
      name: "Fragrant Rose Dhoop - Aromatic (Pack of 20)",
      price: 349,
      originalPrice: 449,
      image: img2,
      badge: "Popular",
    },
    {
      id: "rose-dhoop-2",
      name: "Delicate Rose Dhoop - Traditional (Pack of 15)",
      price: 279,
      originalPrice: 349,
      image: img3,
    },
  ],
  "jasmine-dhoop": [
    {
      id: "jas-dhoop-1",
      name: "Sweet Jasmine Dhoop - Natural (Pack of 20)",
      price: 329,
      originalPrice: 429,
      image: img5,
      badge: "Limited",
    },
    {
      id: "jas-dhoop-2",
      name: "Premium Jasmine Dhoop - Handcrafted (Pack of 15)",
      price: 399,
      originalPrice: 499,
      image: img7,
      badge: "New",
    },
  ],
  // Add more categories as needed
};

// Related products for "You May Also Like" section
const relatedProducts = [
  {
    id: "related-1",
    name: "Premium Sandalwood Agarbatti - Traditional (Pack of 12)",
    price: 299,
    originalPrice: 399,
      image: img4,
    badge: "Bestseller",
  },
  {
    id: "related-2",
    name: "Rose Petal Incense Cones - Aromatic (Pack of 20)",
    price: 249,
    originalPrice: 329,
      image: img2,
    badge: "New",
  },
  {
    id: "related-3",
    name: "Jasmine Essence Dhoop - Natural (Pack of 15)",
    price: 199,
    originalPrice: 279,
      image: img3,
    badge: "Popular",
  },
  {
    id: "related-4",
    name: "Lavender Bliss Agarbatti - Premium (Pack of 10)",
    price: 349,
    originalPrice: 449,
      image: img5,
    badge: "Limited",
  },
  {
    id: "related-5",
    name: "Mogra Magic Incense - Handcrafted (Pack of 18)",
    price: 279,
    originalPrice: 359,
      image: img6,
  },
  {
    id: "related-6",
    name: "Tulsi Basil Dhoop - Organic (Pack of 25)",
    price: 229,
    originalPrice: 299,
      image: img2,
    badge: "Eco-Friendly",
  },
];

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

  // Get category name from URL parameter
  const getCategoryName = (categoryParam: string | undefined) => {
    if (!categoryParam) return "Products";
    
    // Convert URL parameter to display name
    const categoryMap: { [key: string]: string } = {
      "sandalwood-dhoop": "Sandalwood Dhoop",
      "rose-dhoop": "Rose Dhoop", 
      "jasmine-dhoop": "Jasmine Dhoop",
      "lavender-dhoop": "Lavender Dhoop",
      "mogra-dhoop": "Mogra Dhoop",
      "tulsi-dhoop": "Tulsi Dhoop",
      "premium-dhoop": "Premium Dhoop",
      "traditional-dhoop": "Traditional Dhoop",
    };
    
    return categoryMap[categoryParam] || categoryParam.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const categoryName = getCategoryName(category);
  const baseProducts = categoryProducts[category as keyof typeof categoryProducts] || [];

  // Apply filters
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

  const filteredProducts = applySorting(applyFilters(baseProducts));
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
      <section className="bg-background py-3 sm:py-4">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-2">
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#DC143C] mb-2">
            {categoryName}
          </h1>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-2 sm:py-3 bg-background border-b">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left Side - Filters */}
            <div className="flex-1">
              {/* Filter Label */}
              <div className="mb-2 sm:mb-3 md:mb-4">
                <span className="text-sm sm:text-base font-medium text-[#2E1A1A]">Filter:</span>
              </div>
              
              {/* Filter Row 1 */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                <Select value={filters.price} onValueChange={(value) => handleFilterChange('price', value)}>
                  <SelectTrigger className="w-full sm:w-32 md:w-36 h-10 sm:h-11 border-2 border-[#C75D5D] text-sm sm:text-base text-[#2E1A1A] hover:border-[#DC143C] transition-colors [&>svg]:text-[#2E1A1A] [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.price.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-base py-2">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filters.brand} onValueChange={(value) => handleFilterChange('brand', value)}>
                  <SelectTrigger className="w-full sm:w-32 md:w-36 h-10 sm:h-11 border-2 border-[#C75D5D] text-sm sm:text-base text-[#2E1A1A] hover:border-[#DC143C] transition-colors [&>svg]:text-[#2E1A1A] [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.brand.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-base py-2">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filters.size} onValueChange={(value) => handleFilterChange('size', value)}>
                  <SelectTrigger className="w-full sm:w-32 md:w-36 h-10 sm:h-11 border-2 border-[#C75D5D] text-sm sm:text-base text-[#2E1A1A] hover:border-[#DC143C] transition-colors [&>svg]:text-[#2E1A1A] [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.size.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-base py-2">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filters.productType} onValueChange={(value) => handleFilterChange('productType', value)}>
                  <SelectTrigger className="w-full sm:w-36 md:w-40 h-10 sm:h-11 border-2 border-[#C75D5D] text-sm sm:text-base text-[#2E1A1A] hover:border-[#DC143C] transition-colors [&>svg]:text-[#2E1A1A] [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5">
                    <SelectValue placeholder="Product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.productType.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-base py-2">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filters.burningTime} onValueChange={(value) => handleFilterChange('burningTime', value)}>
                  <SelectTrigger className="w-full sm:w-36 md:w-40 h-10 sm:h-11 border-2 border-[#C75D5D] text-sm sm:text-base text-[#2E1A1A] hover:border-[#DC143C] transition-colors [&>svg]:text-[#2E1A1A] [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5">
                    <SelectValue placeholder="Burning Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.burningTime.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-base py-2">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filters.lengthOfStick} onValueChange={(value) => handleFilterChange('lengthOfStick', value)}>
                  <SelectTrigger className="w-full sm:w-40 md:w-44 h-10 sm:h-11 border-2 border-[#C75D5D] text-sm sm:text-base text-[#2E1A1A] hover:border-[#DC143C] transition-colors [&>svg]:text-[#2E1A1A] [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5">
                    <SelectValue placeholder="Length of Stick" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.lengthOfStick.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-base py-2">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filter Row 2 */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Select value={filters.typeOfBathi} onValueChange={(value) => handleFilterChange('typeOfBathi', value)}>
                  <SelectTrigger className="w-full sm:w-36 md:w-40 h-10 sm:h-11 border-2 border-[#C75D5D] text-sm sm:text-base text-[#2E1A1A] hover:border-[#DC143C] transition-colors [&>svg]:text-[#2E1A1A] [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5">
                    <SelectValue placeholder="Type of bathi" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.typeOfBathi.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-base py-2">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-4 sm:py-6 md:py-8 bg-background">
        <div className="container mx-auto px-3 sm:px-4">
          {products.length > 0 ? (
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

      {/* You May Also Like Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              You May Also Like
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Discover more amazing products that complement your selection
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {relatedProducts.map((product, index) => (
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
          
          {/* View All Button */}
          <div className="text-center mt-8">
            <Button 
              size="sm" 
              variant="outline"
              className="group"
              onClick={() => navigate("/")}
            >
              View All Products
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CategoryPage;
