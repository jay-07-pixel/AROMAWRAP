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

// Sample products for different categories
const categoryProducts = {
  "sandalwood-dhoop": [
    {
      id: "sandalwood-dhoop-1",
      name: "Premium Sandalwood Dhoop - Traditional (Pack of 20)",
      price: 399,
      originalPrice: 499,
      image: "/src/assets/product-1.jpg",
      badge: "Bestseller",
    },
    {
      id: "sand-dhoop-2", 
      name: "Classic Sandalwood Dhoop - Handcrafted (Pack of 15)",
      price: 299,
      originalPrice: 399,
      image: "/src/assets/product-2.jpg",
      badge: "New",
    },
    {
      id: "sand-dhoop-3",
      name: "Pure Sandalwood Dhoop - Organic (Pack of 25)",
      price: 549,
      originalPrice: 699,
      image: "/src/assets/product-3.jpg",
      badge: "Premium",
    },
  ],
  "rose-dhoop": [
    {
      id: "rose-dhoop-1",
      name: "Fragrant Rose Dhoop - Aromatic (Pack of 20)",
      price: 349,
      originalPrice: 449,
      image: "/src/assets/product-1.jpg",
      badge: "Popular",
    },
    {
      id: "rose-dhoop-2",
      name: "Delicate Rose Dhoop - Traditional (Pack of 15)",
      price: 279,
      originalPrice: 349,
      image: "/src/assets/product-2.jpg",
    },
  ],
  "jasmine-dhoop": [
    {
      id: "jas-dhoop-1",
      name: "Sweet Jasmine Dhoop - Natural (Pack of 20)",
      price: 329,
      originalPrice: 429,
      image: "/src/assets/product-3.jpg",
      badge: "Limited",
    },
    {
      id: "jas-dhoop-2",
      name: "Premium Jasmine Dhoop - Handcrafted (Pack of 15)",
      price: 399,
      originalPrice: 499,
      image: "/src/assets/product-4.jpg",
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
    image: "/src/assets/product-1.jpg",
    badge: "Bestseller",
  },
  {
    id: "related-2",
    name: "Rose Petal Incense Cones - Aromatic (Pack of 20)",
    price: 249,
    originalPrice: 329,
    image: "/src/assets/product-2.jpg",
    badge: "New",
  },
  {
    id: "related-3",
    name: "Jasmine Essence Dhoop - Natural (Pack of 15)",
    price: 199,
    originalPrice: 279,
    image: "/src/assets/product-3.jpg",
    badge: "Popular",
  },
  {
    id: "related-4",
    name: "Lavender Bliss Agarbatti - Premium (Pack of 10)",
    price: 349,
    originalPrice: 449,
    image: "/src/assets/product-4.jpg",
    badge: "Limited",
  },
  {
    id: "related-5",
    name: "Mogra Magic Incense - Handcrafted (Pack of 18)",
    price: 279,
    originalPrice: 359,
    image: "/src/assets/product-1.jpg",
  },
  {
    id: "related-6",
    name: "Tulsi Basil Dhoop - Organic (Pack of 25)",
    price: 229,
    originalPrice: 299,
    image: "/src/assets/product-2.jpg",
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
  const products = categoryProducts[category as keyof typeof categoryProducts] || [];

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
      <section className="bg-background py-6">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <button 
              onClick={() => navigate("/")}
              className="hover:text-foreground transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button 
              onClick={() => navigate("/")}
              className="hover:text-foreground transition-colors"
            >
              Collections
            </button>
            <span>/</span>
            <span className="text-foreground font-medium">{categoryName}</span>
          </div>
          
          {/* Page Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {categoryName}
          </h1>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-4 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left Side - Filters */}
            <div className="flex-1">
              {/* Filter Label */}
              <div className="mb-3">
                <span className="text-sm font-medium text-foreground">Filter:</span>
              </div>
              
              {/* Filter Row 1 */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Select value={filters.price} onValueChange={(value) => handleFilterChange('price', value)}>
                  <SelectTrigger className="w-28 h-9 border-gray-300 text-sm">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.price.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filters.brand} onValueChange={(value) => handleFilterChange('brand', value)}>
                  <SelectTrigger className="w-28 h-9 border-gray-300 text-sm">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.brand.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filters.size} onValueChange={(value) => handleFilterChange('size', value)}>
                  <SelectTrigger className="w-28 h-9 border-gray-300 text-sm">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.size.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filters.productType} onValueChange={(value) => handleFilterChange('productType', value)}>
                  <SelectTrigger className="w-32 h-9 border-gray-300 text-sm">
                    <SelectValue placeholder="Product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.productType.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filters.burningTime} onValueChange={(value) => handleFilterChange('burningTime', value)}>
                  <SelectTrigger className="w-32 h-9 border-gray-300 text-sm">
                    <SelectValue placeholder="Burning Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.burningTime.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filters.lengthOfStick} onValueChange={(value) => handleFilterChange('lengthOfStick', value)}>
                  <SelectTrigger className="w-36 h-9 border-gray-300 text-sm">
                    <SelectValue placeholder="Length of Stick" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.lengthOfStick.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filter Row 2 */}
              <div className="flex flex-wrap gap-2">
                <Select value={filters.typeOfBathi} onValueChange={(value) => handleFilterChange('typeOfBathi', value)}>
                  <SelectTrigger className="w-32 h-9 border-gray-300 text-sm">
                    <SelectValue placeholder="Type of bathi" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.typeOfBathi.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Right Side - Product Count and Sort */}
            <div className="flex items-center justify-between lg:justify-end gap-4">
              <span className="text-sm font-medium text-foreground">{products.length} products</span>
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-28 h-9 border-gray-300 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
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
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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
