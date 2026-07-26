import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Menu, X, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { categories } from "@/data/catalog";
import { useCart } from "@/contexts/CartContext";

export function Header() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-maroon-deep text-gold-soft text-xs tracking-widest overflow-hidden">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <span className="hidden sm:inline truncate">✦ AUTHENTIC · CERTIFIED · ENERGISED BY VEDIC PANDITS ✦</span>
          <span className="sm:hidden truncate">✦ AUTHENTIC ✦</span>
          <div className="flex items-center gap-4">
            <Link to="/track-order" className="hidden sm:inline hover:text-gold transition">Track Order</Link>
            <Link to="/shop" className="hidden sm:inline hover:text-gold transition">Shop All</Link>
            <a href="tel:+919999999999" className="flex items-center gap-1.5 hover:text-gold transition">
              <Phone className="w-3 h-3" /> +91 99999 99999
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-royal border-b border-gold/30 shadow-royal">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-20 relative">
            <div className="absolute left-0 -ml-6">
              <Logo />
            </div>

            {/* Desktop nav - centered */}
            <nav className="hidden lg:flex items-center gap-3" onMouseLeave={() => setOpenSlug(null)}>
              {categories.map((cat) => (
                <div
                  key={cat.slug}
                  className="relative"
                  onMouseEnter={() => setOpenSlug(cat.slug)}
                >
                  <Link
                    to="/category/$slug"
                    params={{ slug: cat.slug }}
                    className="px-3.5 py-2.5 text-[13px] tracking-widest uppercase text-cream/95 hover:text-gold transition-colors font-medium relative whitespace-nowrap flex items-center"
                  >
                    {cat.name}
                    {openSlug === cat.slug && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold" />
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            <div className="absolute right-0 flex items-center gap-3">
              <button className="p-2.5 text-cream hover:text-gold transition" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
              <Link to="/account" className="p-2.5 text-cream hover:text-gold transition" aria-label="Account">
                <User className="w-5 h-5" />
              </Link>
              <Link to="/cart" search={{ cleared: undefined }} className="p-2.5 text-cream hover:text-gold transition relative" aria-label="Cart">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-gold text-maroon-deep text-[10px] rounded-full flex items-center justify-center font-bold">
                  {count}
                </span>
              </Link>
              <button
                className="lg:hidden p-2.5 text-cream hover:text-gold transition"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mega dropdown */}
        {openSlug && (
          <div
            className="absolute top-full left-0 right-0 bg-cream border-t-2 border-gold shadow-2xl hidden lg:block animate-fade-up"
            onMouseEnter={() => setOpenSlug(openSlug)}
            onMouseLeave={() => setOpenSlug(null)}
          >
            <div className="container mx-auto px-4 py-8">
              {(() => {
                const cat = categories.find((c) => c.slug === openSlug)!;
                return (
                  <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-3 border-r border-gold/30 pr-8 flex flex-col justify-between">
                      <div>
                        <p className="text-xs tracking-[0.3em] text-gold uppercase mb-2">Category</p>
                        <h3 className="font-display text-3xl text-maroon-deep mb-3">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                          {cat.tagline}
                        </p>
                        
                        {/* Trust Badges */}
                        <div className="space-y-2 mb-6 text-xs text-maroon-deep font-medium bg-white/60 p-3 rounded-xl border border-gold/20">
                          <div className="flex items-center gap-2">
                            <span>🛡️</span> <span>100% Certified &amp; Authentic</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>🕉️</span> <span>Vedic Pandit Energised</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>🚚</span> <span>Free Express Shipping</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/category/$slug"
                        params={{ slug: cat.slug }}
                        className="inline-flex items-center justify-center gap-2 bg-maroon-deep text-cream px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase hover:bg-maroon transition shadow-md"
                      >
                        View all {cat.name} →
                      </Link>
                    </div>
                    <div className={`col-span-9 grid gap-8 ${cat.sections.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {cat.sections.map((section) => (
                        <div key={section.title}>
                          <h4 className="text-xs tracking-[0.25em] text-gold uppercase mb-4 pb-2 border-b border-gold/20 font-bold">
                            {section.title}
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {section.items.map((item) => {
                              const targetLink = cat.slug === 'online-pooja' ? '/book-pooja' : '/category/$slug';
                              const targetParams = cat.slug === 'online-pooja' ? undefined : { slug: cat.slug };
                              return (
                                <Link
                                  key={item.name}
                                  to={targetLink as any}
                                  params={targetParams as any}
                                  className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gold/30 shadow-none hover:shadow-md transition-all duration-200"
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    loading="lazy"
                                    className="w-12 h-12 rounded-lg object-cover border border-gold/40 group-hover:border-gold group-hover:scale-105 transition-all duration-300"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-maroon-deep group-hover:text-maroon truncate">
                                      {item.name}
                                    </p>
                                    {item.desc && (
                                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.desc}</p>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-cream border-t border-gold/30 shadow-xl">
          <nav className="container mx-auto px-4 py-4 flex flex-col">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to="/category/$slug"
                params={{ slug: cat.slug }}
                onClick={() => setMobileOpen(false)}
                className="py-3 border-b border-gold/20 text-maroon-deep tracking-wider uppercase text-sm font-medium hover:text-gold"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/shop"
              onClick={() => setMobileOpen(false)}
              className="py-3 border-b border-gold/20 text-maroon-deep tracking-wider uppercase text-sm font-medium hover:text-gold"
            >
              Shop All
            </Link>
            <Link
              to="/track-order"
              onClick={() => setMobileOpen(false)}
              className="py-3 border-b border-gold/20 text-maroon-deep tracking-wider uppercase text-sm font-medium hover:text-gold"
            >
              Track Order
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="py-3 border-b border-gold/20 text-maroon-deep tracking-wider uppercase text-sm font-medium hover:text-gold"
            >
              About
            </Link>
            <Link
              to="/faq"
              onClick={() => setMobileOpen(false)}
              className="py-3 border-b border-gold/20 text-maroon-deep tracking-wider uppercase text-sm font-medium hover:text-gold"
            >
              FAQ
            </Link>
            <Link
              to="/returns-policy"
              onClick={() => setMobileOpen(false)}
              className="py-3 border-b border-gold/20 text-maroon-deep tracking-wider uppercase text-sm font-medium hover:text-gold"
            >
              Returns & Policy
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="py-3 text-maroon-deep tracking-wider uppercase text-sm font-medium hover:text-gold"
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
