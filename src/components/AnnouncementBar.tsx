import { X, Sparkles, Truck, ShoppingBag, Percent } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const announcements = [
    {
      icon: Percent,
      text: "🎉 FESTIVE SALE: Get Up to 50% OFF on Premium Incense Collection!",
      bgColor: "bg-gradient-to-r from-[#DC143C] to-[#FF6B6B]",
    },
    {
      icon: Truck,
      text: "🚚 FREE Shipping on All Orders Above ₹499 | Pan India Delivery",
      bgColor: "bg-gradient-to-r from-[#00BFFF] to-[#40E0D0]",
    },
    {
      icon: ShoppingBag,
      text: "✨ New Arrivals: Explore Our Latest Sandalwood Collection",
      bgColor: "bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0]",
    },
    {
      icon: Sparkles,
      text: "🌿 100% Natural & Eco-Friendly | Made with Love in India",
      bgColor: "bg-gradient-to-r from-[#F57C00] to-[#FF9800]",
    },
  ];

  useEffect(() => {
    const sessionClosed = sessionStorage.getItem("announcementBarClosed");
    if (sessionClosed) {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000); // Change announcement every 5 seconds

    return () => clearInterval(interval);
  }, [isVisible, announcements.length]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("announcementBarClosed", "true");
  };

  if (!isVisible) return null;

  const currentAnnouncement = announcements[currentIndex];
  const Icon = currentAnnouncement.icon;

  return (
    <div className={`${currentAnnouncement.bgColor} text-white relative overflow-hidden`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-2.5 relative">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center justify-center gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <Icon className="h-5 w-5 animate-pulse" />
                <p className="text-sm md:text-base font-semibold text-center">
                  {currentAnnouncement.text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close announcement"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress indicator dots */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1.5 pb-1">
        {announcements.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
            }`}
            aria-label={`Go to announcement ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};







