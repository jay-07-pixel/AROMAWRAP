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
import { useState } from "react";
import { useCart } from "@/context/CartContext";

// Sample product data - in real app this would come from API
const productData = {
  "sandalwood-dhoop-1": {
    id: "sandalwood-dhoop-1",
    name: "Premium Sandalwood Dhoop - Traditional (Pack of 20)",
    price: 399,
    originalPrice: 499,
    discount: 20,
    image: "/src/assets/product-1.jpg",
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
      "/src/assets/product-1.jpg",
      "/src/assets/product-2.jpg", 
      "/src/assets/product-3.jpg",
      "/src/assets/product-4.jpg"
    ]
  },
  "rose-dhoop-1": {
    id: "rose-dhoop-1",
    name: "Fragrant Rose Dhoop - Aromatic (Pack of 20)",
    price: 349,
    originalPrice: 449,
    discount: 22,
    image: "/src/assets/product-2.jpg",
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
      "/src/assets/product-2.jpg",
      "/src/assets/product-1.jpg",
      "/src/assets/product-3.jpg",
      "/src/assets/product-4.jpg"
    ]
  }
};

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const product = productData[productId as keyof typeof productData];

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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            <button 
              onClick={() => navigate(-1)}
              className="hover:text-foreground transition-colors"
            >
              Products
            </button>
            <span>/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Images */}
            <div className="lg:col-span-1 space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden max-w-md mx-auto lg:max-w-none">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto lg:max-w-none">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index 
                        ? 'border-primary' 
                        : 'border-gray-200 hover:border-gray-300'
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
            <div className="lg:col-span-2 space-y-6">
              {/* Back Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Products
              </Button>

              {/* Product Title */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 mb-4">
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
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">₹{product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                    <Badge className="bg-red-500 text-white">
                      {product.discount}% OFF
                    </Badge>
                  </>
                )}
              </div>

              {/* Badge */}
              {product.badge && (
                <Badge className="bg-primary text-white w-fit">
                  {product.badge}
                </Badge>
              )}

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>


              {/* Quantity Selector */}
              <div className="flex items-center gap-6">
                <span className="text-lg font-semibold">Quantity:</span>
                <div className="flex items-center gap-1 border-2 border-gray-300 rounded-xl bg-white shadow-sm">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-12 h-12 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-6 w-6" />
                  </Button>
                  <span className="px-6 py-3 min-w-[4rem] text-center text-xl font-bold text-primary">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => handleQuantityChange(1)}
                    className="w-12 h-12 hover:bg-gray-100"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
                <div className="flex gap-2">
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={isWishlisted ? "text-red-500 border-red-500" : ""}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>
                  <Button size="lg" variant="outline">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Truck className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">Free Shipping</div>
                    <div className="text-xs text-muted-foreground">On orders above ₹499</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <RotateCcw className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">Easy Returns</div>
                    <div className="text-xs text-muted-foreground">30 days return</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">Secure Payment</div>
                    <div className="text-xs text-muted-foreground">100% secure</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8">
              {[
                { id: "description", label: "Description" },
                { id: "specifications", label: "Specifications" },
                { id: "reviews", label: "Reviews" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'bg-white text-foreground hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg p-6">
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
      </section>

      <Footer />
    </div>
  );
};

export default ProductPage;
