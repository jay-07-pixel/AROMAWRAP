import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";

interface ProductShowcaseBoxProps {
  products: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    description: string;
  }[];
  relatedProducts: {
    id: string;
    name: string;
    image: string;
  }[];
  compact?: boolean;
}

export const ProductShowcaseBox = ({ products, relatedProducts, compact = false }: ProductShowcaseBoxProps) => {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const currentProduct = products[currentProductIndex];

  // Auto-rotate products every 6 seconds with swipe-up animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentProductIndex((prevIndex) => (prevIndex + 1) % products.length);
        setIsAnimating(false);
      }, 800); // Half of animation duration
    }, 6000);

    return () => clearInterval(interval);
  }, [products.length]);

  if (compact) {
    return (
      <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-white/20 w-[600px] h-96">
        <div className="flex h-full">
          {/* Left Side - Single Product Image with Swipe Animation */}
          <div className="w-1/2 pr-6">
            <div className="relative h-full overflow-hidden">
              <div 
                className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
                  isAnimating ? 'transform -translate-y-full' : 'transform translate-y-0'
                }`}
              >
                <div className="bg-black rounded-lg overflow-hidden h-full">
                  <img
                    src={currentProduct.image}
                    alt={currentProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Next product image sliding in from bottom */}
              <div 
                className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
                  isAnimating ? 'transform translate-y-0' : 'transform translate-y-full'
                }`}
              >
                <div className="bg-black rounded-lg overflow-hidden h-full">
                  <img
                    src={products[(currentProductIndex + 1) % products.length].image}
                    alt={products[(currentProductIndex + 1) % products.length].name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Main Product Details */}
          <div className="w-1/2 pl-6 flex flex-col justify-between">
            {/* Breadcrumbs */}
            <div className="text-sm text-gray-700 font-sans mb-3 drop-shadow-sm">
              Shop &gt; {currentProduct.name}
            </div>

            {/* Price */}
            <div className="text-xl font-bold text-gray-900 font-sans mb-3 drop-shadow-sm">
              ₹{currentProduct.price}
              {currentProduct.originalPrice && (
                <span className="text-lg text-gray-600 line-through ml-3">
                  ₹{currentProduct.originalPrice}
                </span>
              )}
            </div>

            {/* Product Name */}
            <h2 className="text-xl font-bold text-gray-900 font-serif mb-3 drop-shadow-sm">
              {currentProduct.name}
            </h2>

            {/* Description */}
            <p className="text-gray-800 font-sans text-sm leading-relaxed mb-4 flex-1 drop-shadow-sm">
              {currentProduct.description}
            </p>

            {/* Quantity and Add to Cart */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label htmlFor="quantity" className="text-gray-900 font-sans text-sm drop-shadow-sm">
                  Quantity:
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  defaultValue="1"
                  className="w-16 h-8 text-sm border-input focus:border-primary focus:ring-primary"
                />
              </div>

              <Button className="w-full bg-[#DC143C] hover:bg-[#801030] text-white font-sans py-2 text-sm transition-colors duration-300">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Section - Single Product Image with Swipe Animation */}
        <div className="space-y-8">
          <h3 className="text-3xl font-bold text-gray-900 font-serif drop-shadow-sm">Featured Product</h3>
          <div className="relative h-96 overflow-hidden rounded-lg">
            <div 
              className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
                isAnimating ? 'transform -translate-y-full' : 'transform translate-y-0'
              }`}
            >
              <div className="bg-black rounded-lg overflow-hidden h-full">
                <img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Next product image sliding in from bottom */}
            <div 
              className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
                isAnimating ? 'transform translate-y-0' : 'transform translate-y-full'
              }`}
            >
              <div className="bg-black rounded-lg overflow-hidden h-full">
                <img
                  src={products[(currentProductIndex + 1) % products.length].image}
                  alt={products[(currentProductIndex + 1) % products.length].name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Main Product Details */}
        <div className="space-y-8">
          {/* Breadcrumbs */}
          <div className="text-base text-gray-700 font-sans drop-shadow-sm">
            Shop &gt; {currentProduct.name}
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-gray-900 font-sans drop-shadow-sm">
            ₹{currentProduct.price}
            {currentProduct.originalPrice && (
              <span className="text-xl text-gray-600 line-through ml-3">
                ₹{currentProduct.originalPrice}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h2 className="text-4xl font-bold text-gray-900 font-serif drop-shadow-sm">
            {currentProduct.name}
          </h2>

          {/* Description */}
          <p className="text-gray-800 font-sans text-lg leading-relaxed drop-shadow-sm">
            {currentProduct.description}
          </p>

          {/* Quantity and Add to Cart */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="quantity" className="text-gray-900 font-sans text-lg drop-shadow-sm">
                Quantity:
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                defaultValue="1"
                className="w-24 h-10 text-lg border-input focus:border-primary focus:ring-primary"
              />
            </div>

            <Button className="w-full bg-[#DC143C] hover:bg-[#801030] text-white font-sans py-4 text-xl transition-colors duration-300">
              <ShoppingCart className="mr-3 h-6 w-6" />
              Add to Cart
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};
