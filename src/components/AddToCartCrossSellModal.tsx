import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag, CheckCircle2, X, Plus, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CrossSellItem {
  id: string;
  name: string;
  categoryName: string;
  image: string;
  price: number;
  mrp: number;
  desc: string;
}

const HIGH_CONVERTING_ADDONS: CrossSellItem[] = [
  {
    id: "natural-5-mukhi-rudraksha-mala-indonesian-origin-108-1-beads",
    name: "Natural 5 Mukhi Rudraksha Mala (108+1 Beads)",
    categoryName: "Mala",
    image: "https://cdn.shopify.com/s/files/1/1012/2867/5360/files/ChatGPTImageJul19_2026_01_16_10AM.png?v=1785741321",
    price: 1299,
    mrp: 2499,
    desc: "Energised 108+1 bead mala for daily japa, meditation & peace",
  },
  {
    id: "rudraaura-gold-plated-shree-yantra-frame-for-home-office-temple-vastu-feng-shui-spiritual-decor",
    name: "Gold Plated Shree Yantra Frame",
    categoryName: "Yantra",
    image: "https://cdn.shopify.com/s/files/1/1012/2867/5360/files/ChatGPTImageJul20_2026_11_36_35PM.png?v=1785685669",
    price: 1499,
    mrp: 2999,
    desc: "Sacred 3D embossed Shree Yantra for abundance, wealth & vastu",
  },
  {
    id: "natural-black-obsidian-crystal-healing-bracelet-for-men-women",
    name: "Natural 7 Chakra Crystal Healing Bracelet",
    categoryName: "Bracelet",
    image: "https://cdn.shopify.com/s/files/1/1012/2867/5360/files/1_1_289550f7-db5d-4af4-afb6-a8ef846b7a81.png?v=1785734623",
    price: 799,
    mrp: 1499,
    desc: "Authentic gemstone beads for chakra balancing & aura protection",
  },
];

export function AddToCartCrossSellModal({
  isOpen,
  onClose,
  addedProduct,
}: {
  isOpen: boolean;
  onClose: () => void;
  addedProduct?: {
    name: string;
    image: string;
    price: number;
  } | null;
}) {
  const { add, items } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAddAddon = (item: CrossSellItem) => {
    add({
      slug: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      mrp: item.mrp,
      categoryName: item.categoryName,
      variantId: item.id,
    });
    toast.success(`Added ${item.name} to your cart!`);
  };

  const handleCheckout = () => {
    onClose();
    navigate({ to: "/cart", search: { cleared: undefined } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl border-2 border-gold/40 shadow-royal w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-royal text-cream p-4 flex items-center justify-between border-b border-gold/30 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-display font-bold text-base tracking-wide">
              Added to Your Cart!
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-cream/80 hover:text-gold transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Main Added Item Preview */}
          {addedProduct && (
            <div className="flex items-center gap-3 bg-cream/70 p-3 rounded-lg border border-gold/25">
              <img
                src={addedProduct.image || "/placeholder.jpg"}
                alt=""
                className="w-14 h-14 rounded-md object-cover border border-gold/30 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gold font-semibold uppercase tracking-wider">
                  ✦ In Your Cart
                </p>
                <h4 className="font-display font-bold text-maroon-deep text-sm truncate">
                  {addedProduct.name}
                </h4>
                <p className="font-numeric text-sm font-bold text-maroon-deep mt-0.5">
                  ₹{addedProduct.price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          )}

          {/* Cross-Sell Recommendations Heading */}
          <div className="pt-1">
            <p className="text-gold tracking-[0.3em] text-[10px] font-extrabold uppercase">
              ✦ DEVOTEES ALSO PAIR WITH THIS ITEM ✦
            </p>
            <h3 className="font-display text-base font-bold text-maroon-deep mt-0.5">
              Frequently Bought Together (Special Offer)
            </h3>
            <p className="text-xs text-muted-foreground">
              Add recommended spiritual add-ons before proceeding to checkout:
            </p>
          </div>

          {/* Cross-Sell Product Cards */}
          <div className="space-y-2.5">
            {HIGH_CONVERTING_ADDONS.map((item) => {
              const isAlreadyInCart = items.some((i) => i.slug === item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gold/20 hover:border-gold/50 shadow-2xs transition"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded object-cover border border-gold/20 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-display font-bold text-xs text-maroon-deep truncate">
                      {item.name}
                    </h5>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{item.desc}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-numeric font-bold text-xs text-maroon-deep">
                        ₹{item.price}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-through font-numeric">
                        ₹{item.mrp}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddAddon(item)}
                    disabled={isAlreadyInCart}
                    className={`px-3 py-1.5 rounded text-xs font-bold shrink-0 transition flex items-center gap-1 ${
                      isAlreadyInCart
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-gold text-maroon-deep hover:bg-gold-soft shadow-2xs"
                    }`}
                  >
                    {isAlreadyInCart ? (
                      "Added ✓"
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 bg-cream/80 border-t border-gold/25 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-1/2 py-2.5 rounded-lg border border-gold/30 text-xs font-semibold text-maroon-deep hover:bg-cream transition uppercase tracking-wider"
          >
            Continue Shopping
          </button>
          <button
            onClick={handleCheckout}
            className="w-full sm:w-1/2 py-2.5 rounded-lg bg-royal text-cream text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-royal flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4 text-gold" /> Proceed to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
