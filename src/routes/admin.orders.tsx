import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({ component: OrdersPage });

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [viewing, setViewing] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated"); load();
  };

  const openOrder = async (o: any) => {
    setViewing(o);
    const { data } = await supabase.from("order_items").select("*").eq("order_id", o.id);
    setItems(data ?? []);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-maroon-deep">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} total</p>
      </div>
      <div className="bg-white rounded-xl border border-gold/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-xs uppercase tracking-widest text-maroon-deep">
            <tr><th className="text-left p-3">Order #</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Total</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th><th></th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t hover:bg-cream/40">
                <td className="p-3 font-mono text-xs">{o.order_number}</td>
                <td className="p-3">{o.customer_name}</td>
                <td className="p-3 text-xs">{o.customer_phone}</td>
                <td className="p-3">₹{Number(o.total).toLocaleString("en-IN")}</td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="text-xs border rounded px-2 py-1 bg-white">
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <button onClick={() => openOrder(o)} className="text-maroon text-xs underline">View</button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground text-sm">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl text-maroon-deep">Order {viewing.order_number}</h2>
                <p className="text-xs text-muted-foreground">{new Date(viewing.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setViewing(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 text-sm">
              <div><div className="text-xs uppercase text-muted-foreground">Customer</div><div>{viewing.customer_name}</div></div>
              <div><div className="text-xs uppercase text-muted-foreground">Phone</div><div>{viewing.customer_phone}</div></div>
              <div><div className="text-xs uppercase text-muted-foreground">Email</div><div>{viewing.customer_email || "—"}</div></div>
              <div><div className="text-xs uppercase text-muted-foreground">Payment</div><div>{viewing.payment_status} / {viewing.payment_method || "—"}</div></div>
              <div className="col-span-2"><div className="text-xs uppercase text-muted-foreground">Address</div><div>{viewing.shipping_address}, {viewing.city}, {viewing.state} - {viewing.pincode}</div></div>
            </div>
            <div className="p-5 border-t">
              <h3 className="font-display text-lg text-maroon-deep mb-3">Items</h3>
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground"><tr><th className="text-left py-2">Product</th><th>Qty</th><th>Price</th><th className="text-right">Subtotal</th></tr></thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="border-t"><td className="py-2">{i.product_name}</td><td className="text-center">{i.quantity}</td><td>₹{Number(i.unit_price).toLocaleString("en-IN")}</td><td className="text-right">₹{Number(i.subtotal).toLocaleString("en-IN")}</td></tr>
                  ))}
                </tbody>
                <tfoot><tr className="border-t"><td colSpan={3} className="py-2 text-right font-medium">Total</td><td className="text-right font-numeric text-lg text-maroon-deep">₹{Number(viewing.total).toLocaleString("en-IN")}</td></tr></tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
