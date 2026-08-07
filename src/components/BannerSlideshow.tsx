import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  "/banners/banner1.jpg",
  "/banners/banner2.jpg",
  "/banners/banner3.jpg",
  "/banners/banner4.jpg",
  "/banners/banner5.jpg",
  "/banners/banner6.jpg",
  "/banners/banner7.jpg",
];

export function BannerSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrent((p) => (p - 1 + banners.length) % banners.length);

  return (
    <section className="relative h-[85vh] min-h-[580px] flex items-center overflow-hidden">
      {banners.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Banner ${i + 1}`}
          width={1920}
          height={1280}
          fetchPriority={i === 0 ? "high" : "low"}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="absolute inset-0 bg-gradient-to-r from-maroon-deep/85 via-maroon-deep/40 to-transparent" />

      <div className="container relative mx-auto px-4 z-10">
        <div className="max-w-2xl animate-fade-up">
          <p className="text-gold tracking-[0.4em] text-xs mb-5 font-medium">✦ THE DIVINE WAY ✦</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.05]">
            Awaken Your
            <br />
            <span className="text-gold italic">Inner Devotion</span>
          </h1>
          <p className="font-devanagari text-gold-soft text-2xl mt-4">|| असतो मा सद्गमय ||</p>
          <p className="mt-6 text-cream/85 text-lg max-w-xl leading-relaxed">
            Authentic, certified, and Vedic-energised spiritual products — rudraksha, gemstones and
            live poojas performed by learned pandits.
          </p>
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition"
        aria-label="Next banner"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition ${
              i === current ? "bg-gold w-8" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
    </section>
  );
}
