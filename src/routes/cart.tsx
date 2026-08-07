import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createShopifyCheckout } from "@/lib/shopify.functions";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  validateSearch: (search: Record<string, unknown>) => ({
    cleared: search.cleared === "1" ? "1" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Your Cart — Aastha Support" },
      { name: "description", content: "Review your sacred items before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, update, remove, subtotal, count, clear } = useCart();
  const search = useSearch({ from: "/cart" }) as any;

  const shipping = subtotal > 0 && subtotal < 1500 ? 99 : 0;
  const total = subtotal + shipping;
  const [loading, setLoading] = useState(false);
  const checkout = useServerFn(createShopifyCheckout);

  // Clear cart when returning from Shopify order confirmation
  useEffect(() => {
    if (search?.cleared === "1") {
      clear();
    }
  }, [search?.cleared]);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const payload = items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      }));
      const res = await checkout({ data: { items: payload } });
      if (res.checkoutUrl) {
        // Clear cart immediately before leaving to Shopify
        clear();
        window.location.href = res.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize checkout");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <p className="text-gold tracking-[0.3em] text-xs">✦ SHOPPING CART ✦</p>
        <h1 className="font-display text-4xl text-maroon-deep mt-2">Your Cart</h1>

        {items.length === 0 ? (
          <div className="mt-16 text-center py-16 border border-gold/20 rounded-xl bg-cream">
            <ShoppingBag className="w-12 h-12 mx-auto text-gold" />
            <p className="font-display text-2xl text-maroon-deep mt-4">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-2">Discover certified sacred items.</p>
            <Link
              to="/shop"
              className="inline-flex mt-6 bg-royal text-cream px-6 py-3 rounded-md text-xs tracking-widest uppercase hover:opacity-90 transition shadow-royal"
            >
              Shop All
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {items.map((it) => (
                <div
                  key={it.slug}
                  className="flex gap-4 p-4 bg-white border border-gold/20 rounded-xl"
                >
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-24 h-24 rounded-md object-cover border border-gold/30"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/product/$slug"
                      params={{ slug: it.slug }}
                      className="font-display text-lg text-maroon-deep hover:text-maroon"
                    >
                      {it.name}
                    </Link>
                    {it.categoryName && (
                      <p className="text-[11px] tracking-widest uppercase text-gold mt-0.5">
                        {it.categoryName}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                      <div className="flex items-center border border-gold/40 rounded">
                        <button
                          onClick={() => update(it.slug, it.quantity - 1)}
                          className="p-1.5 hover:bg-cream"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-sm font-medium">{it.quantity}</span>
                        <button
                          onClick={() => update(it.slug, it.quantity + 1)}
                          className="p-1.5 hover:bg-cream"
                          aria-label="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-numeric text-lg text-maroon-deep">
                          ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() => remove(it.slug)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-cream border border-gold/30 rounded-xl p-6 h-fit sticky top-32">
              <h2 className="font-display text-2xl text-maroon-deep">Order Summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items ({count})</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-[11px] text-muted-foreground">Free shipping over ₹1,500</p>
                )}
              </div>
              <div className="border-t border-gold/30 mt-4 pt-4 flex justify-between font-display text-xl text-maroon-deep">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="mt-5 w-full inline-flex items-center justify-center bg-gold text-maroon-deep px-6 py-3.5 rounded-md text-xs tracking-widest uppercase font-medium hover:bg-gold-soft transition shadow-gold disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? "Preparing Checkout..." : "Proceed to Checkout"}
              </button>
              <Link
                to="/shop"
                className="mt-3 block text-center text-xs tracking-widest uppercase text-maroon hover:text-gold"
              >
                ← Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}
