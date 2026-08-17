import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
  beforeLoad: async ({ context }) => {
    const { isAdmin } = context.auth || {};
    if (!isAdmin) {
      throw new Error("Unauthorized");
    }
  },
});

function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-maroon-deep">Shop Orders</h1>
        <p className="text-sm text-muted-foreground">
          Product orders are managed centrally via Shopify.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gold/20 overflow-hidden py-24 text-center px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-white to-cream opacity-50" />
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-maroon-deep to-maroon text-gold shadow-xl">
            <ShoppingBag className="w-10 h-10" />
          </div>

          <h2 className="font-display text-2xl text-maroon-deep mb-2">Orders Synced to Shopify</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8">
            To save database space and optimize order management, all physical product orders
            (Rudraksha, Gemstones, etc.) are securely handled and fulfilled directly through the
            Shopify Admin Dashboard.
          </p>

          <a
            href="https://admin.shopify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest bg-gold text-maroon-deep shadow-gold hover:-translate-y-0.5 transition-all"
          >
            Open Shopify Admin <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
