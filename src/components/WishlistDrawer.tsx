import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const WishlistDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  const handleMoveToCart = (item: any) => {
    handleAddToCart(item);
    removeItem(item.id);
  };

  return (
    <>
      {/* Wishlist Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-md bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary transition-all duration-300 group sm:h-10 sm:w-10 sm:rounded-lg md:h-11 md:w-11 [&_svg]:h-5 [&_svg]:w-5 md:[&_svg]:h-6 md:[&_svg]:w-6"
        onClick={() => setIsOpen(true)}
      >
        <Heart className="h-5 w-5 md:h-6 md:w-6 group-hover:scale-110 transition-transform duration-300" />
        {items.length > 0 && (
          <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 flex items-center justify-center px-0.5 text-[10px] font-bold bg-primary text-primary-foreground md:h-5 md:min-w-5 md:text-xs">
            {items.length}
          </Badge>
        )}
      </Button>

      {/* Wishlist Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="flex items-center gap-2 text-2xl text-primary">
              <Heart className="h-6 w-6 fill-current" />
              My Wishlist
              {items.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-32 w-32 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <Heart className="h-16 w-16 text-red-200" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground text-center mb-6 px-4">
                Save your favorite products for later
              </p>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/");
                }}
                className="bg-primary hover:bg-secondary"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Clear All Button */}
              <div className="py-4 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearWishlist}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>

              {/* Wishlist Items */}
              <div className="py-4 space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            {item.badge && (
                              <Badge className="absolute top-1 right-1 text-xs bg-primary">
                                {item.badge}
                              </Badge>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-sm line-clamp-2">
                                {item.name}
                              </h4>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg font-bold text-primary">
                                ₹{item.price}
                              </span>
                              {item.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{item.originalPrice}
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleMoveToCart(item)}
                                className="flex-1 bg-primary hover:bg-secondary h-9"
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Move to Cart
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/product/${item.productId}`)}
                                className="h-9"
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Bottom Actions */}
              <div className="border-t pt-4 pb-2 sticky bottom-0 bg-white">
                <Button
                  onClick={() => {
                    items.forEach(item => handleAddToCart(item));
                    clearWishlist();
                  }}
                  className="w-full bg-primary hover:bg-secondary h-12 text-lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add All to Cart
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};


