import { Search, ShoppingCart, User, Heart, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchPlaceholder, setSearchPlaceholder] = useState("");
  const { totalItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  // Auto-typing search placeholder text
  const searchSuggestions = [
    "Search for agarbatti...",
    "Find sandalwood dhoop...",
    "Look for rose incense...",
    "Browse puja items...",
    "Discover premium fragrances..."
  ];

  useEffect(() => {
    let currentIndex = 0;
    let currentText = "";
    let isDeleting = false;
    let typeSpeed = 100;

    const typeText = () => {
      const fullText = searchSuggestions[currentIndex];
      
      if (isDeleting) {
        currentText = fullText.substring(0, currentText.length - 1);
        typeSpeed = 50; // Faster when deleting
      } else {
        currentText = fullText.substring(0, currentText.length + 1);
        typeSpeed = 100; // Normal speed when typing
      }

      setSearchPlaceholder(currentText);

      if (!isDeleting && currentText === fullText) {
        // Wait before starting to delete
        setTimeout(() => {
          isDeleting = true;
          typeText();
        }, 2000);
      } else if (isDeleting && currentText === "") {
        // Move to next suggestion
        isDeleting = false;
        currentIndex = (currentIndex + 1) % searchSuggestions.length;
        setTimeout(typeText, 500);
      } else {
        setTimeout(typeText, typeSpeed);
      }
    };

    // Start typing after a short delay
    const timer = setTimeout(typeText, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Function to convert category name to URL parameter
  const getCategoryUrl = (categoryName: string, itemName: string) => {
    return `/category/${itemName.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const categories = [
    {
      name: "Agarbatti",
      items: [
        "Sandalwood Agarbatti",
        "Rose Agarbatti",
        "Jasmine Agarbatti",
        "Lavender Agarbatti",
        "Mogra Agarbatti",
        "Tulsi Agarbatti",
        "Premium Collection",
        "Traditional Collection"
      ]
    },
    {
      name: "Dhoop Sticks",
      items: [
        "Sandalwood Dhoop",
        "Rose Dhoop",
        "Jasmine Dhoop",
        "Lavender Dhoop",
        "Mogra Dhoop",
        "Tulsi Dhoop",
        "Premium Dhoop",
        "Traditional Dhoop"
      ]
    },
    {
      name: "Incense Cones",
      items: [
        "Sandalwood Cones",
        "Rose Cones",
        "Jasmine Cones",
        "Lavender Cones",
        "Mogra Cones",
        "Tulsi Cones",
        "Premium Cones",
        "Traditional Cones"
      ]
    },
    {
      name: "Puja Essentials",
      items: [
        "Puja Kits",
        "Havan Samagri",
        "Camphor (Karpure)",
        "Ghee Lamps",
        "Puja Thali",
        "Rudraksha",
        "Tulsi Mala",
        "Sacred Threads"
      ]
    },
    {
      name: "Gift Sets",
      items: [
        "Festival Gift Sets",
        "Wedding Gift Sets",
        "Corporate Gifts",
        "Puja Gift Hampers",
        "Aromatherapy Sets",
        "Meditation Kits",
        "Spiritual Gift Boxes",
        "Custom Gift Sets"
      ]
    },
    {
      name: "Accessories",
      items: [
        "Incense Holders",
        "Dhoop Stands",
        "Puja Accessories",
        "Meditation Mats",
        "Prayer Beads",
        "Sacred Symbols",
        "Spiritual Books",
        "Yoga Accessories"
      ]
    }
  ];

  return (
    <>
      {/* Top Banner */}
      <div className="bg-banner text-banner-foreground py-2 text-center text-sm font-medium">
        Free Shipping On All Orders Above ₹499
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4">
          {/* Top Section */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-primary">
                SuganShoppee
              </h1>
            </div>

            {/* Enhanced Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300">
                  <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <Input
                  type="search"
                  placeholder={searchPlaceholder || "Search for incense, dhoop, puja items..."}
                  className="pl-12 pr-4 h-12 text-base border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-xl group-hover:shadow-primary/10 rounded-xl bg-gradient-to-r from-white to-gray-50/50 focus:from-white focus:to-primary/5 shadow-md hover:shadow-lg focus:shadow-xl focus:shadow-primary/20"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-md">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex h-14 w-14 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group">
                <Heart className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
              </Button>
              
              {/* Enhanced User Account Button */}
              <Button 
                variant="ghost" 
                className="h-14 px-4 flex items-center gap-3 hover:bg-primary/10 hover:text-primary transition-all duration-300 group relative overflow-hidden"
              >
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/50 transition-all duration-300">
                    <User className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
                </div>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-medium">Account</span>
                  <span className="text-xs text-muted-foreground">Sign In</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-14 w-14 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 group" 
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-6 min-w-6 flex items-center justify-center p-0 text-sm font-bold bg-orange-500 text-white animate-bounce">
                    {totalItems}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-12 w-12 hover:bg-gray-100 transition-all duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Enhanced Search Bar - Mobile */}
          <div className="md:hidden pb-4">
            <div className="relative w-full group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300">
                <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <Input
                type="search"
                placeholder={searchPlaceholder || "Search products..."}
                className="pl-12 pr-4 h-12 text-base border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-xl group-hover:shadow-primary/10 rounded-xl bg-gradient-to-r from-white to-gray-50/50 focus:from-white focus:to-primary/5 shadow-md hover:shadow-lg focus:shadow-xl focus:shadow-primary/20"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-md">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:block border-t border-b border-gray-200 py-3 bg-gradient-to-r from-blue-50/40 to-indigo-50/40 md:bg-gradient-to-r md:from-blue-50/30 md:to-indigo-50/30 shadow-sm`}>
            <div className="container mx-auto px-4">
              <ul className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-8">
                {categories.map((category) => (
                  <li key={category.name}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full md:w-auto justify-start md:justify-center font-semibold text-base hover:text-primary hover:bg-primary/10 transition-all duration-300 px-3 py-1.5 rounded-md"
                        >
                          {category.name}
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="center" 
                        className="w-56 bg-background border shadow-xl rounded-lg"
                      >
                      {category.items.map((item, index) => (
                        <DropdownMenuItem 
                          key={index}
                          className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                          onClick={() => navigate(getCategoryUrl(category.name, item))}
                        >
                          {item}
                        </DropdownMenuItem>
                      ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};
