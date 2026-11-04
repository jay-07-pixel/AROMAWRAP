import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, CheckCircle, Leaf, Star, Truck, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { QuickViewModal } from "@/components/QuickViewModal";
import { isDhoopCategory, isProductPurchasable } from "@/lib/productAvailability";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  description?: string;
  category?: string;
  slug?: string;
  rating?: number;
  reviews?: number;
  /** Request earlier fetch; use for first screen of grids */
  priority?: boolean;
  /** First / LCP product on home: eager + high fetch priority, minimal animation */
  lcp?: boolean;
}

export const ProductCard = ({ id, name, price, originalPrice, image, badge, description, category, slug, rating, reviews, priority = false, lcp = false }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const inWishlist = isInWishlist(id);
  const canPurchase = isProductPurchasable(category);
  const hidePackaging = isDhoopCategory(category);
  const displayBadge = canPurchase ? badge : "Coming Soon";
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(image);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const eager = lcp || priority;

  useEffect(() => {
    if (!lcp) return;
    const el = imgRef.current;
    if (!el) return;
    try {
      (el as HTMLImageElement & { fetchPriority?: string }).fetchPriority = "high";
    } catch {
      /* older browsers: ignore */
    }
  }, [lcp, imageSrc]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canPurchase) {
      toast({
        title: "Coming Soon",
        description: "Dhoop sticks are coming soon. Only Agarbatti can be ordered right now.",
      });
      return;
    }
    addItem({ id, name, price, image });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ id, name, price, originalPrice, image, badge });
  };

  const handleProductClick = () => {
    navigate(`/product/${slug || id}`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
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
        className={
          lcp
            ? "group bg-white rounded-lg overflow-hidden transition-shadow duration-300 flex flex-col h-full"
            : "group bg-white rounded-lg overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 hover:scale-[1.02] flex flex-col h-full"
        }
        style={
          lcp
            ? { boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }
            : {
                animationDelay: "0ms",
                animationFillMode: "backwards" as const,
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              }
        }
      >
        {/* Product Image Container — click opens product page */}
        <div
          className="relative aspect-[3/4] overflow-hidden flex-shrink-0 bg-gray-100 cursor-pointer"
          onClick={handleProductClick}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleProductClick();
            }
          }}
        >
          {/* Loading Placeholder */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-muted/80 to-muted animate-pulse" aria-hidden />
          )}
          
          {/* Product Image */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt={name}
            width={eager ? 600 : undefined}
            height={eager ? 800 : undefined}
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className={`w-full h-full object-cover ${lcp ? "transition-transform duration-300 group-hover:scale-105" : "transition-all duration-300 group-hover:scale-105"} ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            } ${hidePackaging ? "blur-md scale-110" : ""}`}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              console.error('Image failed to load:', imageSrc, e);
              setImageError(true);
              setImageSrc('/placeholder.svg');
              setImageLoading(false);
            }}
          />

          {/* Light frost so Dhoop packaging stays unreadable */}
          {hidePackaging && (
            <div
              className="absolute inset-0 z-[1] bg-white/25 backdrop-blur-[2px] pointer-events-none flex items-center justify-center"
              aria-hidden
            >
              <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] sm:text-xs font-semibold text-foreground shadow-sm">
                Coming Soon
              </span>
            </div>
          )}
          
          {/* Quick View Button - Center (appears on hover) */}
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleQuickView}
            className="absolute top-1/2 left-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-primary px-4 py-2 rounded-full shadow-xl font-semibold text-sm flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Quick View
          </motion.button>
          
          {/* Wishlist Button - Top Left */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleWishlist}
            className={`absolute top-2 left-2 z-[2] sm:top-3 sm:left-3 p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-300 ${
              inWishlist 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${inWishlist ? 'fill-current' : ''}`} />
          </motion.button>

          {displayBadge && (
            <Badge className="absolute top-2 right-2 z-[2] sm:top-3 sm:right-3 bg-primary text-primary-foreground shadow-md text-[10px] sm:text-xs">
              {displayBadge}
            </Badge>
          )}
        </div>
      
      {/* Product Info */}
      <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 flex flex-col flex-grow">
        {/* Product Name — click opens product page */}
        <h3
          className="font-medium text-xs sm:text-sm md:text-base text-gray-900 line-clamp-2 text-center min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center cursor-pointer"
          onClick={handleProductClick}
        >
          {name}
        </h3>
        {canPurchase && (
          <p className="text-center text-[10px] sm:text-xs text-muted-foreground -mt-1">100 gm</p>
        )}
        
        {/* Add to Cart + price — never navigates */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canPurchase}
          className={`rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4 transition-all duration-300 shadow-md mt-auto w-full ${
            canPurchase
              ? "hover:scale-105 bg-primary hover:bg-secondary"
              : "bg-muted cursor-not-allowed opacity-90"
          }`}
        >
          <span className={`w-full font-semibold sm:font-bold text-[10px] sm:text-xs md:text-sm lg:text-base flex items-center justify-center gap-1 sm:gap-2 ${
            canPurchase ? "text-white mb-2 sm:mb-3" : "text-foreground"
          }`}>
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">{canPurchase ? "ADD TO CART" : "COMING SOON"}</span>
            <span className="sm:hidden">{canPurchase ? "ADD" : "SOON"}</span>
          </span>
          
          {/* Pricing — hidden for Coming Soon / Dhoop */}
          {canPurchase && (
            <span className="flex justify-center items-center gap-1 sm:gap-2 md:gap-4 text-white">
              {originalPrice != null && Number(originalPrice) > Number(price) && (
                <span className="text-[10px] sm:text-xs md:text-sm lg:text-base text-white/80 line-through">
                  ₹{Number(originalPrice).toLocaleString()}
                </span>
              )}
              <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">
                ₹{Number(price).toLocaleString()}
              </span>
            </span>
          )}
        </button>
      </div>
    </div>

    {/* Quick View Modal */}
    <QuickViewModal
      isOpen={isQuickViewOpen}
      onClose={() => setIsQuickViewOpen(false)}
      product={{ id, name, price, originalPrice, image, badge: displayBadge, description, category, slug, rating, reviews }}
    />
  </>
  );
};
