import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Leaf, Award, Truck } from "lucide-react";

import categoryAgarbatti from "@/assets/category-agarbatti.jpg";
import categoryDhoop from "@/assets/category-dhoop.jpg";
import categoryPuja from "@/assets/category-puja.jpg";
import categoryCones from "@/assets/category-cones.jpg";
import categoryGifts from "@/assets/category-gifts.jpg";
import categoryAccessories from "@/assets/category-accessories.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const categories = [
    { title: "Premium Agarbatti", image: categoryAgarbatti },
    { title: "Dhoop Sticks", image: categoryDhoop },
    { title: "Puja Essentials", image: categoryPuja },
    { title: "Incense Cones", image: categoryCones },
    { title: "Gift Sets", image: categoryGifts },
    { title: "Accessories", image: categoryAccessories },
  ];

  const featuredProducts = [
    {
      name: "Lavender Bliss Agarbatti - Premium Collection (Pack of 12)",
      price: 299,
      originalPrice: 399,
      image: product1,
      badge: "Bestseller",
    },
    {
      name: "Sandalwood Essence Dhoop Sticks - Traditional (Pack of 20)",
      price: 349,
      originalPrice: 449,
      image: product2,
      badge: "New",
    },
    {
      name: "Jasmine Dreams Incense Cones - Aromatic Collection",
      price: 199,
      originalPrice: 279,
      image: product3,
    },
    {
      name: "Divine Puja Gift Set - Complete Essentials Kit",
      price: 799,
      originalPrice: 1099,
      image: product4,
      badge: "Limited",
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "Premium Quality",
      description: "Handcrafted with finest natural ingredients",
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "Sustainable and biodegradable materials",
    },
    {
      icon: Award,
      title: "Certified Products",
      description: "Quality tested and certified",
    },
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders above ₹499",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
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
            <Badge className="mb-4 bg-primary text-primary-foreground">New Arrivals</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Divine Fragrances for Sacred Moments
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200">
              Discover premium incense and puja essentials crafted with traditional wisdom and natural ingredients
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

      {/* Features Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground text-lg">Explore our wide range of premium products</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground text-lg">Handpicked favorites for you</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" variant="outline">View All Products</Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-accent to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Experience the Divine Difference
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of satisfied customers who trust SuganShoppee for their spiritual needs
          </p>
          <Button size="lg" variant="secondary" className="text-lg">
            Start Shopping
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
