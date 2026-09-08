import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  RotateCcw,
  Flame,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const trustItems = [
  { icon: ShieldCheck, title: "100% Authentic", desc: "Lab certified products" },
  { icon: Flame, title: "Vedic Energised", desc: "By learned pandits" },
  { icon: Truck, title: "Pan India Delivery", desc: "Free above ₹999" },
  { icon: RotateCcw, title: "7 Day Returns", desc: "Easy refund policy" },
];

export function Footer() {
  return (
    <footer className="bg-maroon-deep text-cream/90 mt-24">
      {/* Trust strip */}
      <div className="border-b border-gold/20 bg-maroon">
        <div className="container mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {trustItems.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="font-medium text-cream text-sm">{item.title}</p>
                <p className="text-xs text-gold-soft/80">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Logo variant="light" />
            <p className="mt-5 text-sm leading-relaxed text-cream/80 max-w-sm">
              Aastha Supports brings you authentic, energised spiritual products and live Vedic
              rituals — honouring the divine traditions of Sanatan Dharma. Every product is chosen,
              blessed and delivered with shraddha.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://www.facebook.com/aasthasupports"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-maroon-deep transition"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/aasthasupports"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-maroon-deep transition"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@aasthasupports"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-maroon-deep transition"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display text-gold text-lg mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/category/$slug"
                  params={{ slug: "online-pooja" }}
                  className="hover:text-gold"
                >
                  Online Pooja
                </Link>
              </li>
              <li>
                <Link
                  to="/category/$slug"
                  params={{ slug: "rudraksha" }}
                  className="hover:text-gold"
                >
                  Rudraksha
                </Link>
              </li>
              <li>
                <Link to="/category/$slug" params={{ slug: "mala" }} className="hover:text-gold">
                  Mala
                </Link>
              </li>
              <li>
                <Link
                  to="/category/$slug"
                  params={{ slug: "bracelets" }}
                  className="hover:text-gold"
                >
                  Bracelets
                </Link>
              </li>
              <li>
                <Link
                  to="/category/$slug"
                  params={{ slug: "gemstones" }}
                  className="hover:text-gold"
                >
                  Gemstones
                </Link>
              </li>
              <li>
                <Link to="/category/$slug" params={{ slug: "yantra" }} className="hover:text-gold">
                  Yantra
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-gold">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-gold">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-display text-gold text-lg mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-gold">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-gold">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" className="hover:text-gold">
                  Returns & Policy
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" hash="privacy" className="hover:text-gold">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" hash="terms" className="hover:text-gold">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <button
              type="button"
              onClick={() => {
                window.open(
                  "https://wa.me/918287670827?text=" + encodeURIComponent("Namaste! I have an inquiry regarding Aastha Supports."),
                  "whatsapp_popup",
                  "width=600,height=700,scrollbars=yes,resizable=yes"
                );
              }}
              className="inline-flex items-center gap-2.5 mb-4 px-3.5 py-2 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 transition text-sm font-medium cursor-pointer group"
              title="Click to chat on WhatsApp (+91 82876 70827)"
            >
              <WhatsAppIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              <span>Chat on WhatsApp (+91 82876 70827)</span>
            </button>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span>Mampur bana, Lucknow, Uttar Pradesh 226201, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href="tel:+918287670827" className="hover:text-gold">
                  +91 82876 70827
                </a>
              </li>
              <li className="flex items-center gap-2">
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
                <a
                  href="https://wa.me/918287670827?text=Namaste!%20I%20have%20an%20inquiry%20regarding%20Aastha%20Supports."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(
                      "https://wa.me/918287670827?text=" + encodeURIComponent("Namaste! I have an inquiry regarding Aastha Supports."),
                      "whatsapp_popup",
                      "width=600,height=700,scrollbars=yes,resizable=yes"
                    );
                  }}
                  className="hover:text-gold text-emerald-400 font-medium"
                >
                  Chat on WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a href="mailto:aastha.support.26@gmail.com" className="hover:text-gold">
                  aastha.support.26@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gold/20">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between text-xs text-cream/60 gap-2">
          <p>© {new Date().getFullYear()} Aastha Supports · सर्व अधिकार सुरक्षित</p>
          <p className="font-devanagari text-gold-soft">|| ॐ नमः शिवाय ||</p>
        </div>
      </div>
    </footer>
  );
}
