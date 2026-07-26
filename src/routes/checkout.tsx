import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { useServerFn } from "@tanstack/react-start";
import { createShopifyCheckout } from "@/lib/shopify.functions";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clear } = useCart();
  const checkout = useServerFn(createShopifyCheckout);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate({ to: "/cart", search: { cleared: undefined }, replace: true });
      return;
    }

    let isMounted = true;
    const processCheckout = async () => {
      try {
        const payload = items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        }));
        const res = await checkout({ data: { items: payload } });
        if (res.checkoutUrl && isMounted) {
          clear();
          window.location.href = res.checkoutUrl;
        } else if (isMounted) {
          throw new Error("Could not obtain checkout URL from Shopify");
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Checkout redirect error:", err);
          setError(err.message || "Failed to initiate checkout");
          toast.error("Failed to connect to checkout. Redirecting to cart...");
          setTimeout(() => {
            navigate({ to: "/cart", search: { cleared: undefined }, replace: true });
          }, 2000);
        }
      }
    };

    processCheckout();

    return () => {
      isMounted = false;
    };
  }, [items, checkout, clear, navigate]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-cream px-4 text-center">
        {error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 max-w-md">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold mb-1">Checkout Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-maroon mb-4" />
            <h2 className="font-display text-2xl text-maroon-deep mb-1">Preparing Secure Checkout...</h2>
            <p className="text-xs text-muted-foreground">Connecting directly to Shopify checkout</p>
          </>
        )}
      </div>
    </Layout>
  );
}
