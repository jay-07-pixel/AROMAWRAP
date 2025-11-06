import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { CircularCategoryCard } from "@/components/CircularCategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { ProductShowcaseBox } from "@/components/ProductShowcaseBox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Recycle, Heart, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useState, useEffect } from "react";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { BackToTop } from "@/components/BackToTop";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";

// Product images served from public/products. Please place files there.
const img1 = "/products/IMG-20251017-WA0022.jpg";
const img2 = "/products/IMG-20251017-WA0023.jpg";
const img3 = "/products/IMG-20251017-WA0024.jpg";
const img4 = "/products/IMG-20251017-WA0033.jpg";
const img5 = "/products/IMG-20251017-WA0037.jpg";
const img6 = "/products/IMG-20251017-WA0025.jpg";
const img7 = "/products/IMG-20251017-WA0026.jpg";
import heroBanner from "@/assets/hero-gemini.png";
import circularBestsellers from "@/assets/circular-bestsellers.jpg";
import circularAgarbatti from "@/assets/circular-agarbatti.jpg";
import circularPuja from "@/assets/circular-puja.jpg";
import circularDhoop from "@/assets/circular-dhoop.jpg";
import circularCones from "@/assets/circular-cones.jpg";
import circularKarpure from "@/assets/circular-karpure.jpg";
import circularHavan from "@/assets/circular-havan.jpg";
import circularAccessories from "@/assets/circular-accessories.jpg";

const Index = () => {
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { products: recentlyViewed } = useRecentlyViewed();

  // Load admin products from localStorage
  useEffect(() => {
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      const storedProducts = localStorage.getItem("adminProducts");
      if (storedProducts) {
        try {
          const products = JSON.parse(storedProducts);
          setAdminProducts(products);
        } catch (error) {
          console.error("Error parsing admin products:", error);
        }
      }
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const circularCategories = [
    { title: "Best Sellers", image: circularBestsellers },
    { title: "Agarbatti", image: circularAgarbatti },
    { title: "Puja Essentials", image: circularPuja },
    { title: "Bambooless Incense", image: circularDhoop },
    { title: "Incense Cones", image: circularCones },
    { title: "Karpure", image: circularKarpure },
    { title: "Eco-Friendly Havan Cups", image: circularHavan },
    { title: "Puja Accessories", image: circularAccessories },
  ];

  // Hero section product showcase data
  const heroShowcaseData = {
    products: [
      {
        id: "hero-prod-1",
        name: "Sandalwood Divine Agarbatti",
        price: 450,
        originalPrice: 599,
        image: img1,
        description: "Pure sandalwood agarbatti with divine fragrance. Handcrafted with natural herbs for spiritual wellness.",
      },
      {
        id: "hero-prod-2",
        name: "Rose Garden Agarbatti",
        price: 299,
        originalPrice: 399,
        image: img2,
        description: "Fragrant rose agarbatti that fills your space with the essence of blooming roses. Perfect for meditation.",
      },
      {
        id: "hero-prod-3",
        name: "Jasmine Dreams Cones",
        price: 199,
        originalPrice: 279,
        image: img3,
        description: "Aromatic jasmine incense cones for a peaceful and relaxing atmosphere. Natural and eco-friendly.",
      },
      {
        id: "hero-prod-4",
        name: "Divine Puja Gift Set",
        price: 799,
        originalPrice: 1099,
        image: img4,
        description: "Complete puja essentials kit with premium agarbatti, dhoop, and accessories. Perfect for spiritual rituals.",
      },
    ],
    relatedProducts: [
      {
        id: "hero-related-1",
        name: "Rose Agarbatti",
        image: img2,
      },
      {
        id: "hero-related-2",
        name: "Jasmine Cones",
        image: img3,
      },
    ],
  };

  const bestSellers = [
    {
      id: "prod-1",
      name: "Lavender Bliss Agarbatti - Premium Natural Collection (Pack of 12)",
      price: 299,
      originalPrice: 399,
      image: img1,
      badge: "Bestseller",
    },
    {
      id: "prod-2",
      name: "Sandalwood Essence Dhoop Sticks - Traditional (Pack of 20)",
      price: 349,
      originalPrice: 449,
      image: img4,
      badge: "New",
    },
    {
      id: "prod-3",
      name: "Jasmine Dreams Incense Cones - Aromatic Collection",
      price: 199,
      originalPrice: 279,
      image: img2,
    },
    {
      id: "prod-4",
      name: "Divine Puja Gift Set - Complete Essentials Kit",
      price: 799,
      originalPrice: 1099,
      image: img3,
      badge: "Limited",
    },
    {
      id: "prod-5",
      name: "Rose Garden Agarbatti - Natural Fragrance (Pack of 10)",
      price: 249,
      originalPrice: 329,
      image: img5,
    },
    {
      id: "prod-6",
      name: "Tulsi Basil Dhoop Cones - Sacred Collection",
      price: 179,
      originalPrice: 249,
      image: img6,
      badge: "Bestseller",
    },
    {
      id: "prod-7",
      name: "Mogra Magic Incense Sticks - Evening Collection",
      price: 279,
      originalPrice: 349,
      image: img2,
    },
    {
      id: "prod-8",
      name: "Camphor Pure Karpure - Natural Havan (Pack of 50)",
      price: 399,
      originalPrice: 499,
      image: img7,
      badge: "New",
    },
  ];

  const features = [
    {
      icon: Leaf,
      title: "100% Natural",
      description: "Made from pure cow dung and natural ingredients",
    },
    {
      icon: Recycle,
      title: "Eco-Friendly",
      description: "Biodegradable and sustainable products",
    },
    {
      icon: Heart,
      title: "Traditional Wisdom",
      description: "Ancient formulas with modern quality",
    },
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders above ₹499",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <CartDrawer />
      <Header />

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden -mt-16 shadow-2xl border-b-2 border-gray-200"
      >
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          src={heroBanner}
          alt="Aromatic Bliss Festival 2025"
          className="absolute inset-0 w-full h-full object-contain"
        />
        
      </motion.section>

      {/* Mobile Product Showcase Box Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="lg:hidden py-16 bg-gradient-to-b from-gray-50 to-white relative"
      >
        <div className="container mx-auto px-4">
          <ProductShowcaseBox {...heroShowcaseData} />
        </div>
      </motion.section>

      {/* Admin Products Section */}
      {adminProducts.length > 0 && (
        <section className="py-6 sm:py-8 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-3 sm:px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-primary">
                ✨ New Arrivals
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Fresh additions to our collection
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
            >
              {adminProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Product Cards Section */}
      <section className="py-6 sm:py-8 bg-background">
        <div className="container mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-primary">
              🔥 Best Sellers
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Our most loved products
            </p>
          </motion.div>
          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
            >
              {bestSellers.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>


      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <section className="py-6 sm:py-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-3 sm:px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-primary">
                👁️ Recently Viewed
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Products you've recently checked out
              </p>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {recentlyViewed.slice(0, 5).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-8 sm:py-12 md:py-16 bg-background"
      >
        <div className="container mx-auto px-3 sm:px-4">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-primary"
            >
              Why Choose Us?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4"
            >
              Experience the difference with our commitment to quality, nature, and tradition
            </motion.p>
          </motion.div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5,
                  delay: index * 0.1 + 0.4,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className="group bg-muted/50 rounded-lg p-6 text-center hover:bg-muted transition-all duration-300 hover:shadow-lg"
              >
                {/* Icon */}
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5,
                    delay: index * 0.1 + 0.6,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="w-16 h-16 mx-auto mb-4 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </motion.div>
                
                {/* Content */}
                <motion.h3 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.7 }}
                  className="text-lg font-semibold text-foreground mb-2"
                >
                  {feature.title}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.8 }}
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
          
          {/* Trust Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 1 }}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 bg-accent/20 px-6 py-3 rounded-full border border-primary"
            >
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 1.2 }}
                className="text-sm font-medium text-primary"
              >
                ✨ Trusted by thousands of customers
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
