import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  return (
    <footer className="bg-muted mt-8 sm:mt-12 md:mt-20">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#DC143C] mb-3 sm:mb-4">
              SuganShoppee
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Your trusted source for 100% natural, eco-friendly incense and puja essentials. Handcrafted with pure cow dung and traditional herbs for authentic spiritual experiences.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Our Products</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Customer Service</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Return Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Get In Touch</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <span>care@suganshoppee.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                <span>+91 12345 67890</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Mumbai, India</span>
              </li>
            </ul>
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium">Subscribe to Newsletter</p>
              <div className="flex gap-2">
                <Input placeholder="Your email" type="email" className="h-8 sm:h-9 text-xs sm:text-sm" />
                <Button size="sm" className="shrink-0 text-xs sm:text-sm h-8 sm:h-9">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© 2025 SuganShoppee. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
