import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { CircularCategoryCard } from "@/components/CircularCategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Recycle, Heart, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useState, useEffect } from "react";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
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
const img10 = "/products/delux-dhoop.jpg";
const img11 = "/products/mahadev-dhoop.jpg";
const img12 = "/products/sai-baba-dhoop.jpg";
const img13 = "/products/tornado-dhoop.jpg";
const img14 = "/products/devi-dhoop.jpg";
const img15 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Lavender%20Main.jpg?alt=media&token=7af415cb-0550-413f-bc21-ef85d99f08e8";
const img16 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Mogra%20Main.jpg?alt=media&token=7a784f6f-6917-484a-98c1-d1a7dd7f617f";
const img17 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Mahadev%20dhoop%20front.jpeg?alt=media&token=669c8f3a-2d99-4253-b38e-2f9a968f0998";
const img19 = "https://firebasestorage.googleapis.com/v0/b/aromawarap.firebasestorage.app/o/Tornado%20Dhoop%20Front.jpeg?alt=media&token=3297f953-b5fa-41af-b62b-e9198d3a4e36";
import circularBestsellers from "@/assets/circular-bestsellers.jpg";
import circularDhoop from "@/assets/circular-dhoop.jpg";

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
    { title: "Agarbatti", image: circularBestsellers }, // Using bestsellers as placeholder
    { title: "Bambooless Incense", image: circularDhoop },
  ];

  const bestSellers = [
    {
      id: "prod-1",
      name: "Lavender",
      price: 349,
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
    {
      id: "mahadev-dhoop",
      name: "AromaWrap Mahadev Dhoop",
      price: 399,
      originalPrice: 499,
      image: img17,
      badge: "New",
    },
    {
      id: "tornado-dhoop",
      name: "AromaWrap Tornado Dhoop Premium Dhoop Cones",
      price: 429,
      originalPrice: 529,
      image: img19,
      badge: "Premium",
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
      <section className="pt-2 pb-6 sm:pt-3 sm:pb-8 bg-background">
        <div className="container mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 text-primary">
              Best Sellers
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
                Recently Viewed
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
    </div>
  );
};

export default Index;
