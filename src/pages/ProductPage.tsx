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
const img8 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Sandalwood%20Front.png?alt=media&token=a7ee7aaa-993f-41ac-b35a-392635fedce5";
const img9 = "/products/oudh-premium-dhoop.jpg";
const img10 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/mannat%20front.png?alt=media&token=0e407864-da64-4bc4-9133-12b64810ab89";
const img11 = "/products/mahadev-dhoop.jpg";
const img12 = "/products/sai-baba-dhoop.jpg";
const img13 = "/products/tornado-dhoop.jpg";
const img14 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/devi%20dhoop%20front.png?alt=media&token=a944733d-d1eb-4f1e-91d4-3e724d45946a";
const img15 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Lavender%20Main.jpg?alt=media&token=7af415cb-0550-413f-bc21-ef85d99f08e8";
const img15Back = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/lavender%20back%20.jpeg?alt=media&token=0b58e941-ab75-4be9-ad2d-2bddb3aca095";
const img16 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Mogra%20Main.jpg?alt=media&token=7a784f6f-6917-484a-98c1-d1a7dd7f617f";
const img17 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Mahadev%20dhoop%20front.jpeg?alt=media&token=669c8f3a-2d99-4253-b38e-2f9a968f0998";
const img17Back = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Mahadev%20dhoop%20Back.jpeg?alt=media&token=e1d7f366-4fd9-492d-84e8-e442b25a80bd";
const img18 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Saibaba%20Dhoop%20Front.jpeg?alt=media&token=430ed46d-f7d3-4a17-ac41-a0482804e870";
const img18Back = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Saibaba%20Dhoop%20Back.jpeg?alt=media&token=c7523107-163f-467d-a777-eb547fbb3f79";
const img19 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Tornado%20Dhoop%20Front.jpeg?alt=media&token=3297f953-b5fa-41af-b62b-e9198d3a4e36";
const img19Back = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Tornado%20Dhoop%20Back%20.jpeg?alt=media&token=49e5df44-d3cf-443a-8454-5c761f232a1d";

// Sample product data - in real app this would come from API
const productData = {
  "premium-sandalwood-agarbatti-new": {
    id: "premium-sandalwood-agarbatti-new",
    name: "Premium Sandalwood Agarbatti",
    price: 150,
    image: img8,
    badge: "New",
    rating: 4.7,
    reviews: 89,
    description: "Premium sandalwood agarbatti made with traditional methods. Perfect for spiritual rituals and meditation.",
    features: [
      "100% Natural Ingredients",
      "Traditional Handcrafted",
      "Eco-Friendly Packaging",
      "Long Burning Time",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "12 Sticks",
      "Burning Time": "45-60 minutes",
      "Length": "8 inches",
      "Weight": "100g",
      "Ingredients": "Sandalwood, Natural Herbs",
      "Certification": "FSSAI Approved"
    },
    images: [img8, img1, img4, img6]
  },
  "sandalwood-dhoop-1": {
    id: "sandalwood-dhoop-1",
    name: "AromaWrap Devi Premium Dhoop",
    price: 399,
    originalPrice: 499,
    image: img14,
    badge: "Premium",
    rating: 4.9,
    reviews: 168,
    description: "Invoke divine feminine energy with AromaWrap Devi Premium Dhoop. Crafted with sacred botanicals and pure resins, it delivers a luxurious fragrance that elevates meditation, puja, and relaxation rituals.",
    features: [
      "Handcrafted with sacred botanicals",
      "Long Burning Time (60+ minutes)",
      "Luxurious premium-grade fragrance",
      "Eco-friendly and smokeless burn",
      "FSSAI Certified ingredients"
    ],
    specifications: {
      "Pack Size": "20 Cones",
      "Burning Time": "60-75 minutes",
      "Type": "Premium Dhoop Cones",
      "Weight": "120g",
      "Ingredients": "Sacred Herbs, Resins, Natural Oils",
      "Certification": "FSSAI Approved"
    },
    images: [img14, img10, img11, img12]
  },
  "sand-dhoop-2": {
    id: "sand-dhoop-2",
    name: "Classic Sandalwood Dhoop - Handcrafted (Pack of 15)",
    price: 299,
    originalPrice: 399,
    image: img4,
    badge: "New",
    rating: 4.6,
    reviews: 95,
    description: "Classic sandalwood dhoop handcrafted with traditional techniques for a divine fragrance experience.",
    features: [
      "100% Natural Ingredients",
      "Handcrafted Quality",
      "Traditional Methods",
      "Eco-Friendly Packaging",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "15 Sticks",
      "Burning Time": "50-65 minutes",
      "Length": "7 inches",
      "Weight": "90g",
      "Ingredients": "Sandalwood, Natural Herbs",
      "Certification": "FSSAI Approved"
    },
    images: [img4, img1, img6, img7]
  },
  "sand-dhoop-3": {
    id: "sand-dhoop-3",
    name: "Pure Sandalwood Dhoop - Organic (Pack of 25)",
    price: 549,
    originalPrice: 699,
    image: img6,
    badge: "Premium",
    rating: 4.9,
    reviews: 156,
    description: "Pure organic sandalwood dhoop made with the finest natural ingredients. Premium quality for the most discerning customers.",
    features: [
      "100% Organic Ingredients",
      "Premium Quality",
      "Long Burning Time (75+ minutes)",
      "Eco-Friendly Packaging",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "25 Sticks",
      "Burning Time": "75-90 minutes",
      "Length": "9 inches",
      "Weight": "150g",
      "Ingredients": "Pure Sandalwood, Organic Herbs",
      "Certification": "FSSAI Approved"
    },
    images: [img6, img1, img4, img7]
  },
  "hero-prod-1": {
    id: "hero-prod-1",
    name: "Sandalwood Divine Agarbatti",
    price: 450,
    originalPrice: 599,
    image: img1,
    badge: "Bestseller",
    rating: 4.8,
    reviews: 142,
    description: "Pure sandalwood agarbatti with divine fragrance. Handcrafted with natural herbs for spiritual wellness.",
    features: [
      "100% Natural Ingredients",
      "Divine Fragrance",
      "Traditional Handcrafted",
      "Long Burning Time",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "15 Sticks",
      "Burning Time": "60-75 minutes",
      "Length": "9 inches",
      "Weight": "110g",
      "Ingredients": "Sandalwood, Natural Herbs",
      "Certification": "FSSAI Approved"
    },
    images: [img1, img4, img6, img7]
  },
  "hero-prod-2": {
    id: "hero-prod-2",
    name: "AromaWrap Devi Premium Dhoop",
    price: 399,
    originalPrice: 499,
    image: img14,
    badge: "Premium",
    rating: 4.9,
    reviews: 168,
    description: "Experience the opulence of AromaWrap Devi Premium Dhoop — a handcrafted blend that radiates serenity and devotion during rituals.",
    features: [
      "Handcrafted with sacred botanicals",
      "Long Burning Time (60+ minutes)",
      "Luxurious premium-grade fragrance",
      "Eco-friendly and smokeless burn",
      "FSSAI Certified ingredients"
    ],
    specifications: {
      "Pack Size": "20 Cones",
      "Burning Time": "60-75 minutes",
      "Type": "Premium Dhoop Cones",
      "Weight": "120g",
      "Ingredients": "Sacred Herbs, Resins, Natural Oils",
      "Certification": "FSSAI Approved"
    },
    images: [img14, img10, img11, img12]
  },
  "prod-1": {
    id: "prod-1",
    name: "Lavender",
    price: 2,
    originalPrice: 449,
    image: img15,
    badge: "New",
    rating: 4.7,
    reviews: 108,
    description: "Lavender dhoop sticks crafted with traditional methods. Perfect for daily puja and meditation.",
    features: [
      "100% Natural Ingredients",
      "Traditional Essence",
      "Long Burning Time",
      "Eco-Friendly Packaging",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "20 Sticks",
      "Burning Time": "55-70 minutes",
      "Length": "8 inches",
      "Weight": "115g",
      "Ingredients": "Lavender Essence, Natural Herbs",
      "Certification": "FSSAI Approved"
    },
    images: [img15, img15Back, img1, img6]
  },
  "prod-2": {
    id: "prod-2",
    name: "Mogra",
    price: 399,
    originalPrice: 499,
    image: img16,
    badge: "Premium",
    rating: 4.9,
    reviews: 168,
    description: "Mogra dhoop brings the enchanting fragrance of jasmine flowers to your home. Handcrafted with premium mogra essence for meditation, puja, and peaceful evenings.",
    features: [
      "Handcrafted with mogra essence",
      "Long Burning Time (60+ minutes)",
      "Luxurious premium-grade fragrance",
      "Eco-friendly and smokeless burn",
      "FSSAI Certified ingredients"
    ],
    specifications: {
      "Pack Size": "20 Cones",
      "Burning Time": "60-75 minutes",
      "Type": "Premium Dhoop Cones",
      "Weight": "120g",
      "Ingredients": "Mogra Essence, Natural Herbs, Resins",
      "Certification": "FSSAI Approved"
    },
    images: [img16, img10, img11, img12]
  },
  "prod-3": {
    id: "prod-3",
    name: "Premium Sandalwood Agarbatti",
    price: 150,
    image: img1,
    badge: "New",
    rating: 4.6,
    reviews: 76,
    description: "Premium sandalwood agarbatti made with traditional methods. Perfect for spiritual rituals and meditation.",
    features: [
      "100% Natural Ingredients",
      "Traditional Handcrafted",
      "Eco-Friendly Packaging",
      "Long Burning Time",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "12 Sticks",
      "Burning Time": "45-60 minutes",
      "Length": "8 inches",
      "Weight": "100g",
      "Ingredients": "Sandalwood, Natural Herbs",
      "Certification": "FSSAI Approved"
    },
    images: [img1, img4, img6, img7]
  },
  "prod-4": {
    id: "prod-4",
    name: "Pure Sandalwood Dhoop - Organic (Pack of 25)",
    price: 549,
    originalPrice: 699,
    image: img4,
    badge: "Premium",
    rating: 4.9,
    reviews: 156,
    description: "Pure organic sandalwood dhoop made with the finest natural ingredients. Premium quality for the most discerning customers.",
    features: [
      "100% Organic Ingredients",
      "Premium Quality",
      "Long Burning Time (75+ minutes)",
      "Eco-Friendly Packaging",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "25 Sticks",
      "Burning Time": "75-90 minutes",
      "Length": "9 inches",
      "Weight": "150g",
      "Ingredients": "Pure Sandalwood, Organic Herbs",
      "Certification": "FSSAI Approved"
    },
    images: [img4, img1, img6, img7]
  },
  "prod-5": {
    id: "prod-5",
    name: "Classic Sandalwood Dhoop - Handcrafted (Pack of 15)",
    price: 299,
    originalPrice: 399,
    image: img4,
    badge: "New",
    rating: 4.6,
    reviews: 95,
    description: "Classic sandalwood dhoop handcrafted with traditional techniques for a divine fragrance experience.",
    features: [
      "100% Natural Ingredients",
      "Handcrafted Quality",
      "Traditional Methods",
      "Eco-Friendly Packaging",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "15 Sticks",
      "Burning Time": "50-65 minutes",
      "Length": "7 inches",
      "Weight": "90g",
      "Ingredients": "Sandalwood, Natural Herbs",
      "Certification": "FSSAI Approved"
    },
    images: [img4, img1, img6, img7]
  },
  "prod-6": {
    id: "prod-6",
    name: "Sandalwood Divine Agarbatti",
    price: 450,
    originalPrice: 599,
    image: img1,
    badge: "Bestseller",
    rating: 4.8,
    reviews: 142,
    description: "Pure sandalwood agarbatti with divine fragrance. Handcrafted with natural herbs for spiritual wellness.",
    features: [
      "100% Natural Ingredients",
      "Divine Fragrance",
      "Traditional Handcrafted",
      "Long Burning Time",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "15 Sticks",
      "Burning Time": "60-75 minutes",
      "Length": "9 inches",
      "Weight": "110g",
      "Ingredients": "Sandalwood, Natural Herbs",
      "Certification": "FSSAI Approved"
    },
    images: [img1, img4, img6, img7]
  },
  "related-1": {
    id: "related-1",
    name: "AromaWrap Devi Premium Dhoop",
    price: 399,
    originalPrice: 499,
    image: img14,
    badge: "Premium",
    rating: 4.9,
    reviews: 168,
    description: "Sacred Devi dhoop cones with rich floral-resin notes that instantly sanctify your space. Perfect companion for meditation or festive rituals.",
    features: [
      "Handcrafted with sacred botanicals",
      "Long Burning Time (60+ minutes)",
      "Luxurious premium-grade fragrance",
      "Eco-friendly and smokeless burn",
      "FSSAI Certified ingredients"
    ],
    specifications: {
      "Pack Size": "20 Cones",
      "Burning Time": "60-75 minutes",
      "Type": "Premium Dhoop Cones",
      "Weight": "120g",
      "Ingredients": "Sacred Herbs, Resins, Natural Oils",
      "Certification": "FSSAI Approved"
    },
    images: [img14, img10, img11, img12]
  },
  "related-2": {
    id: "related-2",
    name: "Classic Sandalwood Dhoop - Handcrafted (Pack of 15)",
    price: 299,
    originalPrice: 399,
    image: img4,
    badge: "New",
    rating: 4.6,
    reviews: 95,
    description: "Classic sandalwood dhoop handcrafted with traditional techniques for a divine fragrance experience.",
    features: [
      "100% Natural Ingredients",
      "Handcrafted Quality",
      "Traditional Methods",
      "Eco-Friendly Packaging",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "15 Sticks",
      "Burning Time": "50-65 minutes",
      "Length": "7 inches",
      "Weight": "90g",
      "Ingredients": "Sandalwood, Natural Herbs",
      "Certification": "FSSAI Approved"
    },
    images: [img4, img1, img6, img7]
  },
  "oudh-premium-dhoop": {
    id: "oudh-premium-dhoop",
    name: "AromaWrap OUDH PREMIUM DHOOP",
    price: 499,
    originalPrice: 649,
    image: img9,
    badge: "Premium",
    rating: 4.9,
    reviews: 187,
    description: "Premium oudh dhoop from AromaWrap. Luxurious fragrance with exotic oudh essence. Handcrafted with traditional methods for an authentic and long-lasting aromatic experience.",
    features: [
      "100% Natural Ingredients",
      "Premium Oudh Essence",
      "Long Burning Time (70+ minutes)",
      "Luxurious Fragrance",
      "Eco-Friendly Packaging",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "20 Sticks",
      "Burning Time": "70-85 minutes",
      "Length": "9 inches",
      "Weight": "130g",
      "Ingredients": "Oudh Essence, Sandalwood, Natural Herbs",
      "Certification": "FSSAI Approved"
    },
    images: [img9, img1, img4, img6]
  },
  "delux-dhoop": {
    id: "delux-dhoop",
    name: "AromaWrap Mannat Delux Dhoop",
    price: 449,
    originalPrice: 549,
    image: img10,
    badge: "Premium",
    rating: 4.8,
    reviews: 142,
    description: "Premium delux dhoop from AromaWrap's Mannat collection. Handcrafted with traditional herbs and natural ingredients for a divine and long-lasting aromatic experience. Perfect for spiritual practices and meditation.",
    features: [
      "100% Natural Ingredients",
      "Premium Quality",
      "Long Burning Time (65+ minutes)",
      "Traditional Handcrafted",
      "Eco-Friendly Packaging",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "20 Cones",
      "Burning Time": "65-80 minutes",
      "Type": "Dhoop Cones",
      "Weight": "125g",
      "Ingredients": "Natural Herbs, Traditional Spices",
      "Certification": "FSSAI Approved"
    },
    images: [img10, img1, img4, img6]
  },
  "mahadev-dhoop": {
    id: "mahadev-dhoop",
    name: "AromaWrap Mahadev Dhoop",
    price: 399,
    originalPrice: 499,
    image: img17,
    badge: "New",
    rating: 4.7,
    reviews: 118,
    description: "Sacred Mahadev dhoop from AromaWrap, dedicated to Lord Shiva. Crafted with traditional herbs and natural ingredients, this premium dhoop creates a divine atmosphere perfect for puja and spiritual practices.",
    features: [
      "100% Natural Ingredients",
      "Sacred Fragrance",
      "Long Burning Time (60+ minutes)",
      "Traditional Handcrafted",
      "Eco-Friendly Packaging",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "20 Cones",
      "Burning Time": "60-75 minutes",
      "Type": "Dhoop Cones",
      "Weight": "120g",
      "Ingredients": "Natural Herbs, Sacred Spices",
      "Certification": "FSSAI Approved"
    },
    images: [img17, img17Back, img1, img6]
  },
  "sai-baba-dhoop": {
    id: "sai-baba-dhoop",
    name: "AromaWrap Sai Baba Dhoop Premium Dhoop Cones",
    price: 379,
    originalPrice: 479,
    image: img18,
    badge: "Bestseller",
    rating: 4.9,
    reviews: 203,
    description: "Premium Sai Baba dhoop cones from AromaWrap. Blessed with divine fragrance, these handcrafted dhoop cones are perfect for daily prayers, meditation, and creating a peaceful spiritual atmosphere.",
    features: [
      "100% Natural Ingredients",
      "Divine Fragrance",
      "Long Burning Time (55+ minutes)",
      "Premium Quality Cones",
      "Eco-Friendly Packaging",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "20 Cones",
      "Burning Time": "55-70 minutes",
      "Type": "Premium Dhoop Cones",
      "Weight": "115g",
      "Ingredients": "Natural Herbs, Traditional Spices",
      "Certification": "FSSAI Approved"
    },
    images: [img18, img18Back, img1, img6]
  },
  "tornado-dhoop": {
    id: "tornado-dhoop",
    name: "AromaWrap Tornado Dhoop Premium Dhoop Cones",
    price: 429,
    originalPrice: 529,
    image: img19,
    badge: "Premium",
    rating: 4.8,
    reviews: 165,
    description: "Premium Tornado dhoop cones from AromaWrap. With a unique swirling fragrance that fills your space, these premium dhoop cones offer an intense and long-lasting aromatic experience for your spiritual practices.",
    features: [
      "100% Natural Ingredients",
      "Intense Fragrance",
      "Long Burning Time (70+ minutes)",
      "Premium Quality Cones",
      "Eco-Friendly Packaging",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "20 Cones",
      "Burning Time": "70-85 minutes",
      "Type": "Premium Dhoop Cones",
      "Weight": "135g",
      "Ingredients": "Natural Herbs, Premium Spices",
      "Certification": "FSSAI Approved"
    },
    images: [img19, img19Back, img1, img6]
  },
  "prod-7": {
    id: "prod-7",
    name: "AromaWrap OUDH PREMIUM DHOOP",
    price: 499,
    originalPrice: 649,
    image: img9,
    badge: "Premium",
    rating: 4.9,
    reviews: 187,
    description: "Premium oudh dhoop from AromaWrap. Luxurious fragrance with exotic oudh essence. Handcrafted with traditional methods for an authentic and long-lasting aromatic experience.",
    features: [
      "100% Natural Ingredients",
      "Premium Oudh Essence",
      "Long Burning Time (70+ minutes)",
      "Luxurious Fragrance",
      "Eco-Friendly Packaging",
      "FSSAI Certified"
    ],
    specifications: {
      "Pack Size": "20 Sticks",
      "Burning Time": "70-85 minutes",
      "Length": "9 inches",
      "Weight": "130g",
      "Ingredients": "Oudh Essence, Sandalwood, Natural Herbs",
      "Certification": "FSSAI Approved"
    },
    images: [img9, img1, img4, img6]
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

  // Track recently viewed products — depend only on product.id to avoid infinite loop
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

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
            <div className="space-y-3 max-w-md mx-auto lg:max-w-sm">
              {/* Main Image */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl group max-h-96 bg-gray-100">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                />
                
              </div>
              
              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 bg-gray-100 ${
                      selectedImage === index 
                        ? 'border-primary shadow-md' 
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
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
