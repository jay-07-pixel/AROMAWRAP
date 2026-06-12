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
const img8 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Sandalwood%20Front.png?alt=media&token=a7ee7aaa-993f-41ac-b35a-392635fedce5";
const img9 = "/products/oudh-premium-dhoop.jpg";
const img10 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/mannat%20front.png?alt=media&token=0e407864-da64-4bc4-9133-12b64810ab89";
const img11 = "/products/mahadev-dhoop.jpg";
const img12 = "/products/sai-baba-dhoop.jpg";
const img13 = "/products/tornado-dhoop.jpg";
const img14 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/devi%20dhoop%20front.png?alt=media&token=a944733d-d1eb-4f1e-91d4-3e724d45946a";
const img15 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Lavender%20Main.jpg?alt=media&token=7af415cb-0550-413f-bc21-ef85d99f08e8";
const img16 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Mogra%20Main.jpg?alt=media&token=7a784f6f-6917-484a-98c1-d1a7dd7f617f";
const img17 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Mahadev%20dhoop%20front.jpeg?alt=media&token=669c8f3a-2d99-4253-b38e-2f9a968f0998";
const img18 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Saibaba%20Dhoop%20Front.jpeg?alt=media&token=430ed46d-f7d3-4a17-ac41-a0482804e870";
const img19 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Tornado%20Dhoop%20Front.jpeg?alt=media&token=3297f953-b5fa-41af-b62b-e9198d3a4e36";

// Sample products for different categories
const categoryProducts = {
  "agarbatti": [
    {
      id: "premium-sandalwood-agarbatti-new",
      name: "Premium Sandalwood Agarbatti",
      price: 150,
      image: img8,
      badge: "New",
    },
    {
      id: "prod-1",
      name: "Lavender",
      price: 2,
      originalPrice: 449,
      image: img15,
      badge: "New",
    },
    {
      id: "prod-2",
      name: "Mogra",
      price: 399,
      originalPrice: 499,
      image: img16,
      badge: "Premium",
    },
  ],
  "sandalwood-dhoop": [
    {
      id: "sandalwood-dhoop-1",
      name: "AromaWrap Devi Premium Dhoop",
      price: 399,
      originalPrice: 499,
      image: img14,
      badge: "Premium",
    },
    {
      id: "delux-dhoop",
      name: "AromaWrap Mannat Delux Dhoop",
      price: 449,
      originalPrice: 549,
      image: img10,
      badge: "Premium",
    },
    {
      id: "mahadev-dhoop",
      name: "AromaWrap Mahadev Dhoop",
      price: 399,
      originalPrice: 499,
      image: img17,
      badge: "New",
    },
    {
      id: "sai-baba-dhoop",
      name: "AromaWrap Sai Baba Dhoop Premium Dhoop Cones",
      price: 379,
      originalPrice: 479,
      image: img18,
      badge: "Bestseller",
    },
    {
      id: "tornado-dhoop",
      name: "AromaWrap Tornado Dhoop Premium Dhoop Cones",
      price: 429,
      originalPrice: 529,
      image: img19,
      badge: "Premium",
    },
  ],
};

// Related products for "You May Also Like" section
const relatedProducts = [
  {
    id: "related-1",
    name: "AromaWrap Devi Premium Dhoop",
    price: 399,
    originalPrice: 499,
    image: "/placeholder.svg",
    badge: "Premium",
  },
  {
    id: "related-2",
    name: "AromaWrap Mahadev Dhoop",
    price: 399,
    originalPrice: 499,
    image: img17,
    badge: "New",
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
      "agarbatti": "Agarbatti",
      "sandalwood-dhoop": "Dhoop",
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

      <Footer />
    </div>
  );
};

export default CategoryPage;
