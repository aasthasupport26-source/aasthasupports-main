import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/cart_/c/$id")({
  component: CartCheckoutRedirect,
});

function CartCheckoutRedirect() {
  const { id } = Route.useParams();

  useEffect(() => {
    const storeDomain = "08axwa-1x.myshopify.com";
    const search = window.location.search || "";
    const targetUrl = `https://${storeDomain}/cart/c/${id}${search}${search ? '&' : '?'}_fd=0`;
    window.location.href = targetUrl;
  }, [id]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-maroon mb-4" />
        <h2 className="font-display text-2xl text-maroon-deep mb-2">
          Redirecting to Shopify Checkout...
        </h2>
        <p className="text-sm text-muted-foreground">Connecting securely to complete your order</p>
      </div>
    </Layout>
  );
}
