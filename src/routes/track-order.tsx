import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/track-order")({
  head: () => {
    const title = "Track Your Order — Aastha Support";
    const desc = "Track your Aastha Support order with your order number and registered phone.";
    const url = "https://aasthasupport.com/track-order";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: TrackOrderPage,
});

const STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed & Energised", icon: ShieldCheck },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const onTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setItems([]);
    if (!orderNumber.trim() || !phone.trim()) {
      setError("Please enter both order number and phone.");
      return;
    }
    setLoading(true);
    try {
      // 1. Try finding in pooja_bookings
      const cleanOrderNo = orderNumber.trim();
      const cleanPhone = phone.trim();

      const { data: pujaBooking } = await supabase
        .from("pooja_bookings")
        .select("*")
        .eq("booking_number", cleanOrderNo)
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (pujaBooking) {
        const pujaStatus = (pujaBooking.status || "confirmed").toLowerCase();
        setOrder({
          id: pujaBooking.id,
          order_number: pujaBooking.booking_number,
          status: pujaStatus === "confirmed" ? "confirmed" : (pujaStatus === "completed" ? "delivered" : "pending"),
          total_amount: pujaBooking.amount,
          created_at: pujaBooking.created_at,
          customer_name: pujaBooking.devotee_name,
          customer_phone: pujaBooking.phone,
          customer_email: pujaBooking.email,
          payment_status: "Paid",
          payment_method: "Razorpay (Online)",
          shipping_address: pujaBooking.sankalp ? `Sankalp: ${pujaBooking.sankalp}` : "Vedic Pooja Service",
        });
        setItems([
          {
            id: pujaBooking.id,
            product_name: `${pujaBooking.pooja_type} (${pujaBooking.gotra ? `Gotra: ${pujaBooking.gotra}` : 'Vedic Ritual'})`,
            quantity: 1,
            unit_price: pujaBooking.amount,
          },
        ]);
        setLoading(false);
        return;
      }

      // 2. Try finding in physical merchandise orders
      const { data, error: err } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", cleanOrderNo.toUpperCase())
        .eq("customer_phone", cleanPhone)
        .maybeSingle();

      if (err) {
        setError("Unable to retrieve order details. Please verify your info or contact care.");
        setLoading(false);
        return;
      }
      if (!data) {
        setError(
          "No order or puja booking found with these details. For live assistance, contact support via WhatsApp or email.",
        );
        setLoading(false);
        return;
      }
      setOrder(data);
      const { data: itemRows } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", data.id);
      setItems(itemRows ?? []);
    } catch (e: any) {
      setError("An error occurred while tracking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const status = (order?.status as string) ?? "pending";
  const isCancelled = status === "cancelled";
  const currentIdx = isCancelled ? -1 : STEPS.findIndex((s) => s.key === status);

  return (
    <Layout>
      <section className="bg-gradient-to-b from-maroon-deep to-maroon py-14">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gold tracking-[0.4em] text-xs">✦ ORDER TRACKING ✦</p>
          <h1 className="font-display text-4xl md:text-5xl text-cream mt-3">Track Your Order</h1>
          <p className="text-cream/80 mt-3 max-w-xl mx-auto text-sm">
            Enter your order number and registered phone to see live status.
          </p>
        </div>
      </section>

      <section className="py-12 bg-cream">
        <div className="container mx-auto px-4 max-w-3xl">
          <form
            onSubmit={onTrack}
            className="bg-white rounded-xl border border-gold/30 shadow-soft p-6 md:p-8 grid md:grid-cols-[1fr_1fr_auto] gap-3"
          >
            <div>
              <label className="text-[11px] tracking-widest uppercase text-maroon-deep">
                Order Number
              </label>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="AS-XXXXXX-XXXXXX"
                className="mt-1 w-full px-3 py-2.5 rounded-md border border-gold/30 bg-white text-sm focus:outline-none focus:border-gold uppercase"
              />
            </div>
            <div>
              <label className="text-[11px] tracking-widest uppercase text-maroon-deep">
                Phone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 99999 99999"
                className="mt-1 w-full px-3 py-2.5 rounded-md border border-gold/30 bg-white text-sm focus:outline-none focus:border-gold"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="self-end bg-maroon-deep text-cream px-5 py-2.5 rounded-md text-sm tracking-widest uppercase hover:bg-maroon transition disabled:opacity-60 flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> {loading ? "Searching…" : "Track"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-white border border-red-200 rounded-md text-sm text-red-700 flex items-start gap-2">
              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {order && (
            <div className="mt-8 space-y-6">
              {/* Summary */}
              <div className="bg-white rounded-xl border border-gold/30 shadow-soft p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] tracking-widest uppercase text-gold">Order</p>
                    <h2 className="font-display text-2xl text-maroon-deep">{order.order_number}</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Placed on {new Date(order.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span
                    className={`text-xs tracking-widest uppercase px-3 py-1 rounded-full border ${
                      isCancelled
                        ? "bg-red-50 text-red-700 border-red-200"
                        : status === "delivered"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-cream text-maroon-deep border-gold/40"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {/* Timeline */}
                {isCancelled ? (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> This order has been cancelled.
                  </div>
                ) : (
                  <div className="mt-8">
                    <div className="relative flex items-center justify-between">
                      <div className="absolute left-0 right-0 top-5 h-0.5 bg-gold/20" />
                      <div
                        className="absolute left-0 top-5 h-0.5 bg-gold transition-all"
                        style={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
                      />
                      {STEPS.map((s, i) => {
                        const Icon = s.icon;
                        const done = i <= currentIdx;
                        return (
                          <div
                            key={s.key}
                            className="relative z-10 flex flex-col items-center text-center w-24"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                                done
                                  ? "bg-maroon-deep border-maroon-deep text-gold"
                                  : "bg-white border-gold/40 text-muted-foreground"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <p
                              className={`mt-2 text-[10px] tracking-widest uppercase leading-tight ${
                                done ? "text-maroon-deep font-medium" : "text-muted-foreground"
                              }`}
                            >
                              {s.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="bg-white rounded-xl border border-gold/30 shadow-soft p-6">
                <h3 className="font-display text-lg text-maroon-deep mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-gold" /> Items
                </h3>
                <div className="divide-y divide-gold/15">
                  {items.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No items recorded for this order.
                    </p>
                  )}
                  {items.map((i) => (
                    <div key={i.id} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <div className="text-maroon-deep font-medium">{i.product_name}</div>
                        <div className="text-xs text-muted-foreground">
                          Qty {i.quantity} × ₹{Number(i.unit_price).toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="font-medium text-maroon-deep">
                        ₹{Number(i.subtotal).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gold/20 flex items-center justify-between">
                  <span className="text-xs tracking-widest uppercase text-muted-foreground">
                    Total
                  </span>
                  <span className="font-display text-2xl text-maroon-deep">
                    ₹{Number(order.total).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-xl border border-gold/30 shadow-soft p-6 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[11px] tracking-widest uppercase text-gold mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Shipping Address
                  </p>
                  <p className="text-maroon-deep font-medium">{order.customer_name}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {order.shipping_address}
                    {order.city && `, ${order.city}`}
                    {order.state && `, ${order.state}`}
                    {order.pincode && ` - ${order.pincode}`}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] tracking-widest uppercase text-gold mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Contact
                  </p>
                  <p className="text-maroon-deep">{order.customer_phone}</p>
                  {order.customer_email && (
                    <p className="text-muted-foreground">{order.customer_email}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Payment: <span className="text-maroon-deep">{order.payment_status}</span>
                    {order.payment_method && ` · ${order.payment_method}`}
                  </p>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Need help? Call{" "}
                <a href="tel:+919999999999" className="text-maroon underline">
                  +91 99999 99999
                </a>{" "}
                or email{" "}
                <a href="mailto:aastha.support.26@gmail.com" className="text-maroon underline">
                  aastha.support.26@gmail.com
                </a>
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
