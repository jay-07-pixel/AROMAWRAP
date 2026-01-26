import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Heart, Star, Package, Clock, Leaf, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    badge?: string;
    description?: string;
  } | null;
}

export const QuickViewModal = ({ isOpen, onClose, product }: QuickViewModalProps) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      badge: product.badge,
    });
  };

  const handleViewFullDetails = () => {
    navigate(`/product/${product.id}`);
    onClose();
  };

  // Product features
  const features = [
    { icon: Leaf, text: "100% Natural Ingredients" },
    { icon: Clock, text: "Long Burning Time" },
    { icon: Package, text: "Premium Packaging" },
    { icon: Check, text: "Quality Guaranteed" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Image */}
          <div className="relative bg-gray-50">
            <img
              src={product.image}
              alt={product.name}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover min-h-[300px] md:min-h-[500px]"
            />
            {product.badge && (
              <Badge className="absolute top-4 right-4 bg-primary text-white px-3 py-1">
                {product.badge}
              </Badge>
            )}
          </div>

          {/* Right: Details */}
          <div className="p-6 md:p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-base">
                Premium quality incense for your daily rituals
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(248 reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description ||
                    "Experience the divine fragrance of our premium incense collection. Handcrafted with natural ingredients for an authentic spiritual experience."}
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-3">
                  <Button
                    onClick={handleAddToCart}
                    className="col-span-4 bg-primary hover:bg-secondary h-12 text-base"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleWishlist}
                    className={`h-12 w-12 ${
                      inWishlist
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "hover:bg-red-50 hover:border-red-200"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`}
                    />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={handleViewFullDetails}
                  className="w-full h-11 border-2 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  View Full Details
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Badge variant="outline" className="px-3 py-1.5">
                  🚚 Free Shipping
                </Badge>
                <Badge variant="outline" className="px-3 py-1.5">
                  ✨ Authentic Product
                </Badge>
                <Badge variant="outline" className="px-3 py-1.5">
                  🔒 Secure Checkout
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};







