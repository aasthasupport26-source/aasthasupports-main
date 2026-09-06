import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Menu, X, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { MegaDropdown } from "@/components/MegaDropdown";
import { categories } from "@/data/catalog";
import { useCart } from "@/contexts/CartContext";

export function Header() {
  const [ui, setUi] = useState({
    openSlug: null as string | null,
    mobileOpen: false,
    searchOpen: false,
    searchQuery: "",
  });
  const { count } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (ui.searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(ui.searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-maroon-deep text-gold-soft text-xs tracking-widest overflow-hidden">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <span className="hidden sm:inline truncate">
            ✦ AUTHENTIC · CERTIFIED · ENERGISED BY VEDIC PANDITS ✦
          </span>
          <span className="sm:hidden truncate">✦ AUTHENTIC ✦</span>
          <div className="flex items-center gap-4">
            <Link to="/track-order" className="hidden sm:inline hover:text-gold transition">
              Track Order
            </Link>
            <Link to="/shop" className="hidden sm:inline hover:text-gold transition">
              Shop All
            </Link>
            <a
              href="tel:+918287670827"
              className="flex items-center gap-1.5 hover:text-gold transition"
            >
              <Phone className="w-3 h-3" /> +91 82876 70827
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div
        className="bg-royal border-b border-gold/30 shadow-royal relative"
        onMouseLeave={() => setUi((prev) => ({ ...prev, openSlug: null }))}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between lg:justify-center h-20 relative gap-4">
            <div className="lg:absolute lg:left-0 flex-shrink-0">
              <Logo />
            </div>

            {/* Desktop nav - centered */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.slug}
                  className="relative h-full flex items-center cursor-pointer"
                  onMouseEnter={() => setUi((prev) => ({ ...prev, openSlug: cat.slug }))}
                >
                  <Link
                    to="/category/$slug"
                    params={{ slug: cat.slug }}
                    className="px-2.5 xl:px-3 py-2.5 text-[12px] xl:text-[13px] tracking-widest uppercase text-cream/95 hover:text-gold transition-colors font-medium relative whitespace-nowrap flex items-center"
                  >
                    {cat.name}
                    {ui.openSlug === cat.slug && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold" />
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            <div className="lg:absolute lg:right-0 flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setUi((prev) => ({ ...prev, searchOpen: !prev.searchOpen }))}
                className="p-2.5 text-cream hover:text-gold transition"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link
                to="/account"
                className="p-2.5 text-cream hover:text-gold transition"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>
              <Link
                to="/cart"
                search={{ cleared: undefined }}
                className="p-2.5 text-cream hover:text-gold transition relative"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-gold text-maroon-deep text-[10px] rounded-full flex items-center justify-center font-bold">
                  {count}
                </span>
              </Link>
              <button
                className="lg:hidden p-2.5 text-cream hover:text-gold transition"
                onClick={() => setUi((prev) => ({ ...prev, mobileOpen: !prev.mobileOpen }))}
                aria-label="Menu"
                aria-expanded={ui.mobileOpen}
              >
                {ui.mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mega dropdown */}
        {ui.openSlug && (
          <MegaDropdown
            cat={categories.find((c) => c.slug === ui.openSlug)!}
            onClose={() => setUi((prev) => ({ ...prev, openSlug: null }))}
          />
        )}
      </div>

      {/* Search Modal */}
      {ui.searchOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"
          onClick={() => setUi((prev) => ({ ...prev, searchOpen: false }))}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={ui.searchQuery}
                  onChange={(e) => setUi((prev) => ({ ...prev, searchQuery: e.target.value }))}
                  className="flex-1 text-lg outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setUi((prev) => ({ ...prev, searchOpen: false }))}
                  className="p-2 hover:bg-gray-100 rounded"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-maroon text-white py-2 rounded-lg hover:bg-maroon-deep"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {ui.mobileOpen && (
        <div className="lg:hidden bg-cream border-t border-gold/30 shadow-xl">
          <nav className="container mx-auto px-4 py-4 flex flex-col">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to="/category/$slug"
                params={{ slug: cat.slug }}
                onClick={() => setUi((prev) => ({ ...prev, mobileOpen: false }))}
                className="py-3 border-b border-gold/20 text-maroon-deep tracking-wider uppercase text-sm font-medium hover:text-gold min-h-[44px] flex items-center"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/shop"
              onClick={() => setUi((prev) => ({ ...prev, mobileOpen: false }))}
              className="py-3 border-b border-gold/20 text-maroon-deep tracking-wider uppercase text-sm font-medium hover:text-gold min-h-[44px] flex items-center"
            >
              Shop All
            </Link>
            <Link
              to="/track-order"
              onClick={() => setUi((prev) => ({ ...prev, mobileOpen: false }))}
              className="py-3 border-b border-gold/20 text-maroon-deep tracking-wider uppercase text-sm font-medium hover:text-gold min-h-[44px] flex items-center"
            >
              Track Order
            </Link>
            <Link
              to="/about"
              onClick={() => setUi((prev) => ({ ...prev, mobileOpen: false }))}
              className="py-3 border-b border-gold/20 text-maroon-deep tracking-wider uppercase text-sm font-medium hover:text-gold min-h-[44px] flex items-center"
            >
              About
            </Link>
            <Link
              to="/faq"
              onClick={() => setUi((prev) => ({ ...prev, mobileOpen: false }))}
              className="py-3 border-b border-gold/20 text-maroon-deep tracking-wider uppercase text-sm font-medium hover:text-gold min-h-[44px] flex items-center"
            >
              FAQ
            </Link>
            <Link
              to="/returns-policy"
              onClick={() => setUi((prev) => ({ ...prev, mobileOpen: false }))}
              className="py-3 border-b border-gold/20 text-maroon-deep tracking-wider uppercase text-sm font-medium hover:text-gold min-h-[44px] flex items-center"
            >
              Returns & Policy
            </Link>
            <Link
              to="/contact"
              onClick={() => setUi((prev) => ({ ...prev, mobileOpen: false }))}
              className="py-3 text-maroon-deep tracking-wider uppercase text-sm font-medium hover:text-gold min-h-[44px] flex items-center"
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
