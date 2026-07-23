import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  component: CheckoutRedirect,
});

function CheckoutRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to cart since checkout is now handled directly via Shopify Storefront URL
    navigate({ to: "/cart", search: { cleared: undefined }, replace: true });
  }, [navigate]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-maroon" />
        <span className="ml-3 text-maroon-deep">Redirecting to Cart...</span>
      </div>
    </Layout>
  );
}
