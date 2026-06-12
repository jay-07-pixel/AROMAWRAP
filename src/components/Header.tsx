import { Search, ShoppingCart, User, ChevronDown, LayoutDashboard } from "lucide-react";
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
import { WishlistDrawer } from "@/components/WishlistDrawer";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isAdminUser } from "@/services/authService";
import aromaWrapLogo from "@/assets/aromawrap_logo.png";

export const Header = () => {
  const [searchPlaceholder, setSearchPlaceholder] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, loading: authLoading } = useAuth();

  const isAdmin =
    !authLoading && !!user && isAdminUser(user.email, userProfile);
  const showDashboardButton = isAdmin && !location.pathname.startsWith("/admin");

  const isLoggedIn = !!user;
  const resolvedName =
    userProfile?.displayName?.trim() ||
    user?.displayName?.trim() ||
    "";
  const emailLocal = user?.email?.split("@")[0]?.trim() || "";
  const accountTitle = isLoggedIn
    ? resolvedName || emailLocal || "Account"
    : "Account";
  const accountSubtitle = isLoggedIn ? "My account" : "Sign In";

  // Auto-typing search placeholder text
  const searchSuggestions = [
    "Search for sandalwood agarbatti...",
    "Find sandalwood dhoop...",
    "Look for premium sandalwood...",
    "Browse sandalwood collection...",
    "Discover sandalwood fragrances..."
  ];

  useEffect(() => {
    let currentIndex = 0;
    let currentText = "";
    let isDeleting = false;
    let typeSpeed = 250; // Much slower typing speed

    const typeText = () => {
      const fullText = searchSuggestions[currentIndex];
      
      if (isDeleting) {
        currentText = fullText.substring(0, currentText.length - 1);
        typeSpeed = 120; // Slower when deleting
      } else {
        currentText = fullText.substring(0, currentText.length + 1);
        typeSpeed = 250; // Much slower normal speed when typing
      }

      setSearchPlaceholder(currentText);

      if (!isDeleting && currentText === fullText) {
        // Wait longer before starting to delete
        setTimeout(() => {
          isDeleting = true;
          typeText();
        }, 4500); // Longer wait time
      } else if (isDeleting && currentText === "") {
        // Move to next suggestion with longer pause
        isDeleting = false;
        currentIndex = (currentIndex + 1) % searchSuggestions.length;
        setTimeout(typeText, 1500); // Longer pause between suggestions
      } else {
        setTimeout(typeText, typeSpeed);
      }
    };

    // Start typing after a longer delay
    const timer = setTimeout(typeText, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Function to convert category name to URL parameter
  const getCategoryUrl = (categoryName: string, itemName: string) => {
    return `/category/${itemName.toLowerCase().replace(/\s+/g, '-')}`;
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const categories = [
    {
      name: "Agarbatti",
      items: [
        "Sandalwood Agarbatti"
      ]
    },
    {
      name: "Dhoop Sticks",
      items: [
        "Sandalwood Dhoop"
      ]
    }
  ];

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4">
          {/* Top Section */}
          <div className="flex items-center justify-between gap-2 py-2 min-w-0">
            {/* Logo — smaller on narrow screens so wishlist / account / cart stay visible */}
            <div className="flex min-w-0 shrink items-center max-w-[min(52vw,220px)] sm:max-w-none">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="hover:opacity-80 transition-opacity min-w-0"
                aria-label="Go to home"
              >
                <img 
                  src={aromaWrapLogo} 
                  alt="AromaWrap" 
                  className="h-14 w-auto max-h-14 sm:h-24 sm:max-h-none md:h-32 lg:h-36 max-w-full sm:max-w-[280px] md:max-w-[380px] lg:max-w-[420px] object-contain object-left"
                />
              </button>
            </div>

            {/* Enhanced Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300">
                  <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <Input
                  type="search"
                  placeholder={searchPlaceholder || "Search for incense, dhoop, puja items..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-12 pr-4 h-12 text-base border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 group-hover:border-primary group-hover:shadow-xl group-hover:shadow-primary/10 rounded-xl bg-gradient-to-r from-white to-gray-50/50 focus:from-white focus:to-accent/20 shadow-md hover:shadow-lg focus:shadow-xl focus:shadow-primary/20"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-md">
                    ⌘K
                  </kbd>
                </div>
              </form>
            </div>

            {/* Actions — always show wishlist on mobile (was hidden below sm) */}
            <div className="flex items-center shrink-0 gap-0.5 sm:gap-2 md:gap-3">
              <div className="inline-flex shrink-0">
                <WishlistDrawer />
              </div>

              {showDashboardButton && (
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0 sm:h-11 sm:w-auto sm:px-3 rounded-xl border-amber-500/90 text-foreground hover:bg-amber-50/60 shrink-0"
                  onClick={() => navigate("/admin")}
                  aria-label="Go to admin dashboard"
                >
                  <LayoutDashboard className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              )}
              
              {/* Enhanced User Account Button */}
              <Button 
                variant="ghost" 
                className="h-9 max-h-9 px-1.5 sm:max-h-none sm:h-10 sm:px-2 md:h-12 md:px-3 lg:h-14 lg:px-4 flex items-center gap-1 sm:gap-2 md:gap-3 rounded-lg sm:rounded-xl border-2 border-primary/25 bg-background/80 hover:bg-accent/20 hover:text-primary hover:border-primary/45 transition-all duration-300 group relative overflow-hidden shrink-0 min-w-0"
                onClick={() => navigate("/account")}
                aria-label={isLoggedIn ? `Account: ${accountTitle}` : "Sign in to account"}
              >
                <div className="relative shrink-0">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/50 transition-all duration-300">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  {isLoggedIn && (
                    <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 bg-green-500 rounded-full border-2 border-background animate-pulse" aria-hidden />
                  )}
                </div>
                <div className="hidden min-[400px]:flex flex-col items-start min-w-0 max-w-[72px] min-[480px]:max-w-[120px] md:max-w-[160px] lg:max-w-[200px]">
                  <span className="text-[11px] font-medium truncate w-full sm:text-xs md:text-sm leading-tight">{accountTitle}</span>
                  <span className="text-[9px] text-muted-foreground truncate w-full sm:text-[10px] md:text-xs leading-tight">{accountSubtitle}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-9 w-9 rounded-md bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary transition-all duration-300 group sm:h-10 sm:w-10 sm:rounded-lg md:h-11 md:w-11 [&_svg]:h-5 [&_svg]:w-5 md:[&_svg]:h-6 md:[&_svg]:w-6" 
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 group-hover:scale-110 transition-transform duration-300" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 flex items-center justify-center px-0.5 text-[10px] font-bold bg-primary text-primary-foreground animate-bounce md:h-5 md:min-w-5 md:text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Enhanced Search Bar - Mobile */}
          <div className="md:hidden pb-2">
            <form onSubmit={handleSearch} className="relative w-full group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300">
                <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <Input
                type="search"
                placeholder={searchPlaceholder || "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-12 pr-4 h-12 text-base border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 group-hover:border-primary group-hover:shadow-xl group-hover:shadow-primary/10 rounded-xl bg-gradient-to-r from-white to-gray-50/50 focus:from-white focus:to-accent/20 shadow-md hover:shadow-lg focus:shadow-xl focus:shadow-primary/20"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-md">
                  ⌘K
                </kbd>
              </div>
            </form>
          </div>

          {/* Navigation */}
          <nav className="block border-t border-b border-gray-200 py-1.5 bg-gradient-to-r from-blue-50/40 to-indigo-50/40 md:bg-gradient-to-r md:from-blue-50/30 md:to-indigo-50/30 shadow-sm">
            <div className="container mx-auto px-4">
              <ul className="flex flex-row items-center justify-center gap-2 md:gap-8">
                {categories.map((category) => (
                  <li key={category.name}>
                    {category.name === "Agarbatti" || category.name === "Dhoop Sticks" ? (
                      // Direct link for Agarbatti and Dhoop Sticks - no dropdown
                      <Button 
                        variant="ghost" 
                        className="w-auto justify-center font-semibold text-sm md:text-base text-primary hover:text-secondary hover:bg-accent/20 transition-all duration-300 px-2 md:px-3 py-1.5 rounded-md"
                        onClick={() => {
                          if (category.name === "Agarbatti") {
                            navigate("/category/agarbatti");
                          } else if (category.name === "Dhoop Sticks") {
                            navigate("/category/sandalwood-dhoop");
                          }
                        }}
                      >
                        {category.name}
                      </Button>
                    ) : (
                      // Dropdown for other categories
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="w-auto justify-center font-semibold text-sm md:text-base text-primary hover:text-secondary hover:bg-accent/20 transition-all duration-300 px-2 md:px-3 py-1.5 rounded-md"
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
                    )}
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
