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
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <img
          src={heroBanner}
          alt="Divine Fragrances"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
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
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Fragrances For Divine Experiences
            </h2>
            <p className="text-muted-foreground text-lg">Handpicked fragrances for every occasion</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-12">
            {circularCategories.map((category, index) => (
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-accent to-accent/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMC00djJoMnYtMmgtMnptLTIgMHYyaDJ2LTJoLTJ6bTAgMHYtMmgtMnYyaDJ6bTAgMnYtMmgtMnYyaDJ6bTIgMHYtMmgydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-primary-foreground animate-in fade-in slide-in-from-bottom duration-700">
            Experience Nature's Divine Gift
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90 animate-in fade-in slide-in-from-bottom duration-700 delay-100">
            Pure, natural, and sacred - Made with traditional wisdom using cow dung and natural herbs
          </p>
          <Button size="lg" variant="secondary" className="text-lg animate-in fade-in zoom-in duration-700 delay-200">
            Start Shopping
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
