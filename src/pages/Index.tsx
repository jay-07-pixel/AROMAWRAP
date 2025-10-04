import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CircularCategoryCard } from "@/components/CircularCategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Recycle, Heart, Truck } from "lucide-react";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import heroBanner from "@/assets/hero-natural.jpg";
import circularBestsellers from "@/assets/circular-bestsellers.jpg";
import circularAgarbatti from "@/assets/circular-agarbatti.jpg";
import circularPuja from "@/assets/circular-puja.jpg";
import circularDhoop from "@/assets/circular-dhoop.jpg";
import circularCones from "@/assets/circular-cones.jpg";
import circularKarpure from "@/assets/circular-karpure.jpg";
import circularHavan from "@/assets/circular-havan.jpg";
import circularAccessories from "@/assets/circular-accessories.jpg";

const Index = () => {
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

  const bestSellers = [
    {
      id: "prod-1",
      name: "Lavender Bliss Agarbatti - Premium Natural Collection (Pack of 12)",
      price: 299,
      originalPrice: 399,
      image: product1,
      badge: "Bestseller",
    },
    {
      id: "prod-2",
      name: "Sandalwood Essence Dhoop Sticks - Traditional (Pack of 20)",
      price: 349,
      originalPrice: 449,
      image: product2,
      badge: "New",
    },
    {
      id: "prod-3",
      name: "Jasmine Dreams Incense Cones - Aromatic Collection",
      price: 199,
      originalPrice: 279,
      image: product3,
    },
    {
      id: "prod-4",
      name: "Divine Puja Gift Set - Complete Essentials Kit",
      price: 799,
      originalPrice: 1099,
      image: product4,
      badge: "Limited",
    },
    {
      id: "prod-5",
      name: "Rose Garden Agarbatti - Natural Fragrance (Pack of 10)",
      price: 249,
      originalPrice: 329,
      image: product1,
    },
    {
      id: "prod-6",
      name: "Tulsi Basil Dhoop Cones - Sacred Collection",
      price: 179,
      originalPrice: 249,
      image: product3,
      badge: "Bestseller",
    },
    {
      id: "prod-7",
      name: "Mogra Magic Incense Sticks - Evening Collection",
      price: 279,
      originalPrice: 349,
      image: product2,
    },
    {
      id: "prod-8",
      name: "Camphor Pure Karpure - Natural Havan (Pack of 50)",
      price: 399,
      originalPrice: 499,
      image: product4,
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
      <CartDrawer />
      <Header />

      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden -mt-4 shadow-2xl border-b-2 border-gray-200">
        <img
          src={heroBanner}
          alt="Divine Fragrances"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="relative container mx-auto px-4 h-full flex items-center pt-8">
          <div className="max-w-2xl text-white">
            <Badge className="mb-4 bg-accent text-accent-foreground">100% Natural</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Natural Fragrances from Mother Earth
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200">
              Handcrafted with pure cow dung and natural herbs - Experience the divine power of nature's gift
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="text-lg">
                Shop Now
              </Button>
              <Button size="lg" variant="outline" className="text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                Explore Collections
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Circular Categories Section */}
      <section className="py-16 bg-background border-t-2 border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Fragrances For Divine Experiences
            </h2>
            <p className="text-muted-foreground text-lg">Handpicked fragrances for every occasion</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-12">
            {circularCategories.slice(0, 6).map((category, index) => (
              <CircularCategoryCard key={index} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Best Sellers</h2>
            <p className="text-muted-foreground text-lg">Our most loved natural fragrances</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" variant="outline" className="group">
              View All Products
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </div>
        </div>
      </section>


      {/* Enhanced Features Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-primary/5 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-primary/10 rounded-full animate-ping"></div>
          <div className="absolute bottom-10 right-1/4 w-28 h-28 bg-primary/5 rounded-full animate-pulse"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
              Why Choose Us?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the difference with our commitment to quality, nature, and tradition
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Card Container */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Floating Particles */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full animate-ping"></div>
                  <div className="absolute bottom-4 left-4 w-1 h-1 bg-primary/40 rounded-full animate-pulse"></div>
                  
                  {/* Icon Container with Enhanced Effects */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden">
                      {/* Icon Background Animation */}
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <feature.icon className="h-10 w-10 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    {/* Glow Effect */}
                    <div className="absolute inset-0 w-20 h-20 mx-auto bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Hover Indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary text-sm">→</span>
                    </div>
                  </div>
                  
                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-colors duration-500"></div>
                </div>
                
                 {/* Connection Line (for desktop) */}
                 {index < features.length - 1 && (
                   <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/30 transform -translate-y-1/2"></div>
                 )}
              </div>
            ))}
          </div>
          
          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full border border-primary/20">
              <span className="text-sm font-medium text-primary">✨ Trusted by thousands of customers</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
