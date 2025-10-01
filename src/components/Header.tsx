import { Search, ShoppingCart, User, Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    "Agarbatti",
    "Dhoop Sticks",
    "Incense Cones",
    "Puja Essentials",
    "Gift Sets",
    "Accessories"
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                SuganShoppee
              </h1>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for incense, dhoop, puja items..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  0
                </span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="md:hidden pb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:block border-t md:border-t-0 py-4`}>
            <ul className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-6">
              {categories.map((category) => (
                <li key={category}>
                  <Button variant="ghost" className="w-full md:w-auto justify-start md:justify-center font-medium hover:text-primary">
                    {category}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};
