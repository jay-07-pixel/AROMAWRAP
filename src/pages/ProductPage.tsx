import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  Plus,
  Minus,
  Check,
  ShoppingCart
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
// Product images served from public/products. Please place files there.
const img1 = "/products/IMG-20251017-WA0022.jpg";
const img2 = "/products/IMG-20251017-WA0023.jpg";
const img3 = "/products/IMG-20251017-WA0024.jpg";
const img4 = "/products/IMG-20251017-WA0033.jpg";
const img5 = "/products/IMG-20251017-WA0037.jpg";
const img6 = "/products/IMG-20251017-WA0025.jpg";
const img7 = "/products/IMG-20251017-WA0026.jpg";

// Sample product data - in real app this would come from API
const productData = {
  "sandalwood-dhoop-1": {
    id: "sandalwood-dhoop-1",
    name: "Premium Sandalwood Dhoop - Traditional (Pack of 20)",
    price: 399,
    originalPrice: 499,
    discount: 20,
    image: img1,
    badge: "Bestseller",
    rating: 4.8,
    reviews: 124,
    description: "Handcrafted with pure sandalwood and traditional herbs, this premium dhoop offers a long-lasting, aromatic experience. Made using ancient techniques passed down through generations.",
    features: [
      "100% Natural Ingredients",
      "Long Burning Time (60+ minutes)",
      "Traditional Handcrafted",
      "Eco-Friendly Packaging",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "20 Sticks",
      "Burning Time": "60-75 minutes",
      "Length": "8 inches",
      "Weight": "120g",
      "Ingredients": "Sandalwood, Natural Herbs",
      "Certification": "FSSAI Approved"
    },
    images: [
      img1,
      img4,
      img6,
      img7
    ]
  },
  "rose-dhoop-1": {
    id: "rose-dhoop-1",
    name: "Fragrant Rose Dhoop - Aromatic (Pack of 20)",
    price: 349,
    originalPrice: 449,
    discount: 22,
    image: img2,
    badge: "Popular",
    rating: 4.6,
    reviews: 89,
    description: "Experience the delicate fragrance of fresh roses with this aromatic dhoop. Perfect for meditation, relaxation, and creating a peaceful atmosphere.",
    features: [
      "Pure Rose Essence",
      "Aromatic Fragrance",
      "45+ Minutes Burning",
      "Natural Dyes Only",
      "Handcrafted Quality"
    ],
    specifications: {
      "Pack Size": "20 Sticks",
      "Burning Time": "45-60 minutes",
      "Length": "7 inches",
      "Weight": "100g",
      "Ingredients": "Rose Petals, Natural Herbs",
      "Certification": "FSSAI Approved"
    },
    images: [
      img2,
      img3,
      img5,
      img1
    ]
  }
};

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addProduct } = useRecentlyViewed();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const product = productData[productId as keyof typeof productData];

  // Track recently viewed products
  useEffect(() => {
    if (product) {
      addProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        badge: product.badge,
      });
    }
  }, [product, addProduct]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      image: product.image 
    });
  };

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <CartDrawer />
      <Header />

      {/* Breadcrumbs */}
      <section className="bg-background py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => navigate("/")}
              className="text-primary hover:text-secondary transition-colors"
            >
              Home
            </button>
            <span className="text-muted-foreground">/</span>
            <button 
              onClick={() => navigate("/")}
              className="text-primary hover:text-secondary transition-colors"
            >
              Collections
            </button>
            <span className="text-muted-foreground">/</span>
            <button 
              onClick={() => navigate(-1)}
              className="text-primary hover:text-secondary transition-colors"
            >
              Products
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-semibold">{product.name}</span>
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-6 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Images */}
            <div className="space-y-3 max-w-lg mx-auto lg:max-w-none">
              {/* Main Image */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-2xl group max-w-md mx-auto">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                />
                
                {/* Discount Badge */}
                {product.discount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                    {product.discount}% OFF
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index 
                        ? 'border-primary shadow-md' 
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              {/* Back Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-300 mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Products
              </Button>

              {/* Product Title & Rating */}
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-foreground">
                    {product.rating}
                  </span>
                  <span className="text-muted-foreground">
                    ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Price & Quantity Section */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4 border border-primary/10">
                <div className="flex items-center justify-between gap-6">
                  {/* Price Section */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-3xl font-bold text-primary">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-xl text-muted-foreground line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                      {product.badge && (
                        <Badge className="bg-primary text-white px-3 py-1 text-sm font-bold">
                          {product.badge}
                        </Badge>
                      )}
                    </div>
                    
                    {product.originalPrice && (
                      <div className="text-green-600 font-semibold text-sm">
                        You save ₹{product.originalPrice - product.price} ({product.discount}% OFF)
                      </div>
                    )}
                  </div>

                  {/* Quantity Section */}
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">Qty:</span>
                    <div className="flex items-center gap-1 border-2 border-primary/20 rounded-lg bg-white shadow-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-8 h-8 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed text-primary"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="px-3 py-1 min-w-[2.5rem] text-center text-base font-bold text-primary">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(1)}
                        className="w-8 h-8 hover:bg-primary/10 text-primary"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold py-3 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 min-w-0"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button 
                    size="lg" 
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 min-w-0"
                    onClick={() => {
                      // Add buy now functionality
                      handleAddToCart();
                      // Navigate to checkout or show success message
                      alert('Redirecting to checkout...');
                    }}
                  >
                    Buy Now
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`flex-1 py-2 rounded-lg transition-all duration-300 ${
                      isWishlisted 
                        ? "text-red-500 border-red-500 bg-red-50 hover:bg-red-100" 
                        : "border-primary/20 hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${isWishlisted ? 'fill-current' : ''}`} />
                    {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1 py-2 rounded-lg border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Product Details Tabs */}
              <div className="mt-6">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-3 mb-6 justify-center">
                  {[
                    { id: "description", label: "Description" },
                    { id: "specifications", label: "Specifications" },
                    { id: "reviews", label: "Reviews" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 rounded-lg font-semibold text-base transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-white text-foreground hover:bg-primary/10 hover:text-primary border border-gray-200 hover:border-primary/30'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
              {activeTab === "description" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {activeTab === "specifications" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b">
                        <span className="font-medium text-muted-foreground">{key}:</span>
                        <span className="text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{product.rating}</div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Based on {product.reviews} reviews
                        </div>
                      </div>
                    </div>
                    
                    {/* Sample Reviews */}
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <span className="font-medium">Amazing Quality!</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          "The fragrance is exactly as described. Long-lasting and creates a peaceful atmosphere. Highly recommended!"
                        </p>
                        <div className="text-xs text-muted-foreground mt-2">- Priya S.</div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(4)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                            <Star className="h-4 w-4 text-gray-300" />
                          </div>
                          <span className="font-medium">Good Value</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          "Good quality for the price. Packaging could be better but the product itself is great."
                        </p>
                        <div className="text-xs text-muted-foreground mt-2">- Raj K.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductPage;
