import { X, Sparkles, Truck, ShoppingBag, Percent } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ANNOUNCEMENT_THEMES,
  getAnnouncementSettings,
  type AnnouncementIcon,
  type AnnouncementItem,
} from "@/services/announcementService";

const ICON_MAP: Record<AnnouncementIcon, typeof Sparkles> = {
  bag: ShoppingBag,
  truck: Truck,
  sparkles: Sparkles,
  percent: Percent,
};

export const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const sessionClosed = sessionStorage.getItem("announcementBarClosed");
    if (sessionClosed) {
      setIsVisible(false);
      return;
    }

    let active = true;
    getAnnouncementSettings()
      .then((settings) => {
        if (!active) return;
        if (settings.enabled && settings.items.length > 0) {
          setAnnouncements(settings.items);
          setCurrentIndex(0);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      })
      .catch(() => {
        if (active) setIsVisible(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isVisible || announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, announcements.length]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("announcementBarClosed", "true");
  };

  if (!isVisible || announcements.length === 0) return null;

  const safeIndex = currentIndex % announcements.length;
  const currentAnnouncement = announcements[safeIndex];
  const Icon = ICON_MAP[currentAnnouncement.icon] ?? Sparkles;
  const bgColor =
    ANNOUNCEMENT_THEMES[currentAnnouncement.theme]?.bgClass ??
    ANNOUNCEMENT_THEMES.crimson.bgClass;

  return (
    <div className={`${bgColor} text-white relative overflow-hidden`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-2.5 relative">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center justify-center gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={safeIndex}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <Icon className="h-5 w-5 animate-pulse shrink-0" />
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
      {announcements.length > 1 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1.5 pb-1">
          {announcements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === safeIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
              aria-label={`Go to announcement ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
