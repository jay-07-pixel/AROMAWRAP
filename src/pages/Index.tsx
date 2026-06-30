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
import { useEffect, useState } from "react";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { listProducts, type ProductListItem } from "@/services/productService";
import circularBestsellers from "@/assets/circular-bestsellers.jpg";
import circularDhoop from "@/assets/circular-dhoop.jpg";

const Index = () => {
  const [adminProducts, setAdminProducts] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("adminProducts");
      if (stored) return JSON.parse(stored) as any[];
    } catch (e) {
      console.error("Error parsing admin products:", e);
    }
    return [];
  });
  const [bestSellers, setBestSellers] = useState<ProductListItem[]>([]);
  const [isLoadingBestSellers, setIsLoadingBestSellers] = useState(true);
  const [bestSellersError, setBestSellersError] = useState<string | null>(null);
  const { products: recentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    let active = true;

    const loadBestSellers = async () => {
      setIsLoadingBestSellers(true);
      setBestSellersError(null);

      try {
        const { items } = await listProducts({
          sort: "newest",
          page: 1,
          limit: 4,
        });

        if (active) {
          setBestSellers(items);
        }
      } catch (error) {
        console.error("Error loading best sellers:", error);
        if (active) {
          setBestSellers([]);
          setBestSellersError("Failed to load products.");
        }
      } finally {
        if (active) {
          setIsLoadingBestSellers(false);
        }
      }
    };

    loadBestSellers();

    return () => {
      active = false;
    };
  }, []);

  const circularCategories = [
    { title: "Best Sellers", image: circularBestsellers },
    { title: "Agarbatti", image: circularBestsellers }, // Using bestsellers as placeholder
    { title: "Bambooless Incense", image: circularDhoop },
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
                  <ProductCard {...product} priority={index < 4} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Product Cards Section — minimal motion above the fold to cut Framer layout work (LCP) */}
      <section className="pt-2 pb-6 sm:pt-3 sm:pb-8 bg-background">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 text-primary">
              Best Sellers
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Our most loved products
            </p>
          </div>
          {isLoadingBestSellers ? (
            <ProductGridSkeleton count={4} />
          ) : bestSellersError ? (
            <div className="text-center py-8 text-muted-foreground">
              {bestSellersError}
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {bestSellers.map((product, index) => (
                <div key={product.id}>
                  <ProductCard
                    {...product}
                    lcp={index === 0}
                    priority={index < 6}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No products available right now.
            </div>
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
