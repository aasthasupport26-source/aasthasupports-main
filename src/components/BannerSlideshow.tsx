import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const slides = [
  {
    image: "/banners/banner1.jpg",
    title: "Authentic Rudraksha",
    subtitle: "Certified & Energised by Vedic Pandits",
  },
  {
    image: "/banners/banner2.jpg",
    title: "Sacred Gemstones",
    subtitle: "Natural & Astrologically Aligned",
  },
  {
    image: "/banners/banner3.jpg",
    title: "Online Puja Services",
    subtitle: "Live Vedic Rituals from Holy Temples",
  },
];

export function BannerSlideshow() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  return (
    <div className="relative h-[500px] overflow-hidden bg-maroon-deep">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-5xl text-white mb-4">{slide.title}</h2>
              <p className="text-xl text-gold-soft">{slide.subtitle}</p>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={() => setIsPaused(!isPaused)}
        className="absolute bottom-4 right-4 p-3 bg-white/20 hover:bg-white/30 rounded-full transition min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
      >
        {isPaused ? (
          <Play className="w-5 h-5 text-white" />
        ) : (
          <Pause className="w-5 h-5 text-white" />
        )}
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition min-w-[44px] min-h-[44px] flex items-center justify-center ${
              idx === current ? "bg-gold" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === current ? "true" : "false"}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
          </button>
        ))}
      </div>
    </div>
  );
}
