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
    <Card 
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 animate-in fade-in zoom-in-95 cursor-pointer"
      onClick={handleProductClick}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {/* Enhanced Flip Container */}
        <div className="relative w-full h-full [perspective:1200px] group">
          {/* Front Side - Product Image with Enhanced Effects */}
          <div className="absolute inset-0 w-full h-full [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] transition-all duration-1000 ease-in-out">
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Product Image with Enhanced Effects */}
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-110"
              />
              
              {/* Animated Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Floating Badges with Animation */}
              {badge && (
                <Badge className="absolute top-3 left-3 bg-primary text-white shadow-lg transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
                  {badge}
                </Badge>
              )}
              {discount > 0 && (
                <Badge className="absolute top-3 right-3 bg-red-500 text-white shadow-lg transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
                  {discount}% OFF
                </Badge>
              )}
              
              {/* Enhanced Heart Button */}
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:text-red-500 shadow-lg"
              >
                <Heart className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              </Button>
              
              {/* Hover Indicator */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-primary shadow-lg">
                  Hover to flip
                </div>
              </div>
            </div>
          </div>
          
          {/* Back Side - Enhanced Product Features */}
          <div className="absolute inset-0 w-full h-full [transform-style:preserve-3d] group-hover:[transform:rotateY(0deg)] [transform:rotateY(180deg)] transition-all duration-1000 ease-in-out [backface-visibility:hidden]">
            <div className="w-full h-full bg-primary/10 p-4 flex flex-col justify-center items-center relative overflow-hidden">
              {/* Feature Header */}
              <div className="text-center mb-6 relative z-10">
                <div className="w-12 h-12 mx-auto mb-3 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-bold text-lg text-primary mb-2">Product Features</h4>
                <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
              </div>
              
              {/* Features List */}
              <div className="space-y-3 w-full relative z-10">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 text-sm text-foreground bg-white/30 rounded-lg p-3 transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md">
                      <feature.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold">{feature.text}</span>
                  </div>
                ))}
              </div>
              
              {/* Flip Back Indicator */}
              <div className="mt-6 text-center relative z-10">
                <div className="text-xs text-muted-foreground mb-3 font-medium">Hover to see product</div>
                <div className="w-12 h-12 mx-auto bg-primary/20 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-primary text-xl font-bold">↻</span>
                </div>
              </div>
              
              {/* Border */}
              <div className="absolute inset-0 border-2 border-primary/20 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[2.5rem]">{name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-primary">₹{price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">₹{originalPrice}</span>
          )}
        </div>
              <Button 
                className="w-full group-hover:bg-primary/90 transition-colors" 
                size="sm" 
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
      </div>
    </Card>
  );
};
