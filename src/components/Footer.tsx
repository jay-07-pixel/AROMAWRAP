import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "🎉 Successfully Subscribed!",
        description: "Thank you for subscribing to our newsletter. Check your inbox for exclusive offers!",
      });
      
      // Save to localStorage
      const subscribers = JSON.parse(localStorage.getItem("newsletterSubscribers") || "[]");
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem("newsletterSubscribers", JSON.stringify(subscribers));
      }
      
      setEmail("");
      setIsSubscribing(false);
    }, 1000);
  };

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 mt-8 sm:mt-12 md:mt-20 border-t">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Our Spiritual Journey
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Subscribe to our newsletter for exclusive offers, new product launches, and spiritual wellness tips delivered to your inbox!
            </p>
            
            <form onSubmit={handleNewsletterSubscribe} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 text-base bg-white border-0 focus:ring-2 focus:ring-white/50"
                    disabled={isSubscribing}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubscribing}
                  className="h-14 px-8 bg-white text-primary hover:bg-gray-100 font-semibold shadow-lg"
                >
                  {isSubscribing ? (
                    "Subscribing..."
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>
              </div>
              <p className="text-white/80 text-sm mt-4 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                Get 10% OFF on your first order when you subscribe!
              </p>
            </form>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-white rounded-full"></div>
                <span>Exclusive Deals</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-white rounded-full"></div>
                <span>Early Access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-white rounded-full"></div>
                <span>Wellness Tips</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-white rounded-full"></div>
                <span>Unsubscribe Anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-muted mt-0">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">
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

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Get In Touch</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2 hover:text-primary transition-colors cursor-pointer">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <span>care@suganshoppee.com</span>
              </li>
              <li className="flex items-start gap-2 hover:text-primary transition-colors cursor-pointer">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                <span>+91 12345 67890</span>
              </li>
              <li className="flex items-start gap-2 hover:text-primary transition-colors cursor-pointer">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>Business Hours:</strong><br />
                Mon-Sat: 9:00 AM - 8:00 PM<br />
                Sunday: 10:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>

        <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <p>© 2025 SuganShoppee. All rights reserved. | Made with ❤️ in India</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
};
