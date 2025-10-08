import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, CheckCircle, Leaf, Star, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
}

export const ProductCard = ({ id, name, price, originalPrice, image, badge }: ProductCardProps) => {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ id, name, price, image });
  };

  const handleProductClick = () => {
    navigate(`/product/${id}`);
  };

  // Product features based on product type
  const getProductFeatures = () => {
    const features = [];
    if (name.toLowerCase().includes('agarbatti')) {
      features.push({ icon: Leaf, text: '100% Natural' });
      features.push({ icon: Star, text: 'Premium Quality' });
      features.push({ icon: CheckCircle, text: 'Handcrafted' });
    } else if (name.toLowerCase().includes('dhoop')) {
      features.push({ icon: Leaf, text: 'Bambooless' });
      features.push({ icon: Star, text: 'Traditional' });
      features.push({ icon: CheckCircle, text: 'Eco-Friendly' });
    } else if (name.toLowerCase().includes('cones')) {
      features.push({ icon: Leaf, text: 'Aromatic' });
      features.push({ icon: Star, text: 'Long Lasting' });
      features.push({ icon: CheckCircle, text: 'Easy to Use' });
    } else if (name.toLowerCase().includes('gift')) {
      features.push({ icon: Star, text: 'Complete Set' });
      features.push({ icon: CheckCircle, text: 'Premium Items' });
      features.push({ icon: Truck, text: 'Gift Ready' });
    } else {
      features.push({ icon: Leaf, text: 'Natural' });
      features.push({ icon: Star, text: 'Premium' });
      features.push({ icon: CheckCircle, text: 'Authentic' });
    }
    return features;
  };

  const features = getProductFeatures();

  return (
    <div 
      className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer animate-in fade-in zoom-in-95"
      onClick={handleProductClick}
      style={{
        animationDelay: `${Math.random() * 200}ms`,
        animationFillMode: 'backwards'
      }}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {/* Product Image */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        />
        
        {/* Discount Badge - Top Right */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md">
            {discount}% OFF
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="font-medium text-base text-gray-900 line-clamp-2 text-center">
          {name}
        </h3>
        
        {/* Combined Button and Pricing Box */}
        <div className="bg-yellow-500 hover:bg-yellow-600 rounded-lg p-4 transition-all duration-300 hover:scale-105 shadow-md">
          {/* Add to Cart Button */}
          <button 
            className="w-full text-white font-bold text-lg flex items-center justify-center gap-2 mb-3" 
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            ADD TO CART
          </button>
          
          {/* Pricing */}
          <div className="flex justify-center items-center gap-4">
            {originalPrice && (
              <div className="text-base text-white/80 line-through">
                ₹ {originalPrice.toLocaleString()}
              </div>
            )}
            <div className="text-xl font-bold text-white">
              ₹ {price.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
