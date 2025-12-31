import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, CheckCircle, Leaf, Star, Truck, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { QuickViewModal } from "@/components/QuickViewModal";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  description?: string;
}

export const ProductCard = ({ id, name, price, originalPrice, image, badge, description }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const inWishlist = isInWishlist(id);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(image);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ id, name, price, image });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist({ id, name, price, originalPrice, image, badge });
  };

  const handleProductClick = () => {
    navigate(`/product/${id}`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQuickViewOpen(true);
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
    <>
      <div 
        className="group bg-white rounded-lg overflow-hidden transition-all duration-300 cursor-pointer animate-in fade-in zoom-in-95 hover:scale-[1.02] flex flex-col h-full"
        onClick={handleProductClick}
        style={{
          animationDelay: `${Math.random() * 200}ms`,
          animationFillMode: 'backwards',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        }}
      >
        {/* Product Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden flex-shrink-0">
          {/* Product Image */}
          <img
            src={imageSrc}
            alt={name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            onError={() => setImageSrc('/placeholder.svg')}
          />
          
          {/* Quick View Button - Center (appears on hover) */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleQuickView}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-primary px-4 py-2 rounded-full shadow-xl font-semibold text-sm flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Quick View
          </motion.button>
          
          {/* Wishlist Button - Top Left */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleWishlist}
            className={`absolute top-2 left-2 sm:top-3 sm:left-3 p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-300 ${
              inWishlist 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${inWishlist ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      
      {/* Product Info - Flex to push to bottom */}
      <div className="p-2 sm:p-3 md:p-4 flex flex-col flex-grow">
        {/* Product Name - Fixed height */}
        <h3 className="font-medium text-xs sm:text-sm md:text-base text-gray-900 line-clamp-2 text-center min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center">
          {name}
        </h3>
        
        {/* Combined Button and Pricing Box - Fixed at bottom */}
        <div className="mt-auto rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4 transition-all duration-300 hover:scale-105 shadow-md bg-primary hover:bg-secondary">
          {/* Add to Cart Button */}
          <button 
            className="w-full text-white font-semibold sm:font-bold text-[10px] sm:text-xs md:text-sm lg:text-base flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3" 
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">ADD TO CART</span>
            <span className="sm:hidden">ADD</span>
          </button>
          
          {/* Pricing */}
          <div className="flex justify-center items-center gap-1 sm:gap-2 md:gap-4">
            {originalPrice && (
              <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-white/80 line-through">
                ₹{originalPrice.toLocaleString()}
              </div>
            )}
            <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white">
              ₹{price.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Quick View Modal */}
    <QuickViewModal
      isOpen={isQuickViewOpen}
      onClose={() => setIsQuickViewOpen(false)}
      product={{ id, name, price, originalPrice, image, badge, description }}
    />
  </>
  );
};
