import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { CheckCircle2, Package, Sparkles } from "lucide-react";

export const Route = createFileRoute("/order-success/$orderNumber")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Aastha Support" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const { orderNumber } = Route.useParams();
  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gold/20 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-maroon-deep" />
        </div>
        <p className="text-gold tracking-[0.3em] text-xs mt-6">✦ ORDER CONFIRMED ✦</p>
        <h1 className="font-display text-4xl text-maroon-deep mt-3">Dhanyavaad 🙏</h1>
        <p className="mt-4 text-foreground/80">
          Your sacred order has been received and will be energised by our Vedic pandits before dispatch.
        </p>
        <div className="mt-6 inline-block bg-cream border border-gold/30 rounded-lg px-6 py-3">
          <p className="text-xs tracking-widest uppercase text-muted-foreground">Order Number</p>
          <p className="font-display text-2xl text-maroon-deep">{orderNumber}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-8 text-left">
          <div className="p-4 rounded-lg bg-cream border border-gold/20 flex gap-3">
            <Sparkles className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-maroon-deep text-sm">Vedic Energisation</p>
              <p className="text-xs text-muted-foreground mt-1">Pandits will perform sankalp & energise your items.</p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-cream border border-gold/20 flex gap-3">
            <Package className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-maroon-deep text-sm">Dispatch in 2-3 days</p>
              <p className="text-xs text-muted-foreground mt-1">Tracking link sent via SMS / email.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <Link to="/track-order" className="bg-royal text-cream px-6 py-3 rounded-md text-xs tracking-widest uppercase hover:opacity-90 shadow-royal">
            Track Order
          </Link>
          <Link to="/shop" className="border border-maroon text-maroon px-6 py-3 rounded-md text-xs tracking-widest uppercase hover:bg-maroon hover:text-cream transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    </Layout>
  );
}
