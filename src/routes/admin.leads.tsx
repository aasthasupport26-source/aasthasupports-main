import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/leads")({ component: LeadsPage });

function LeadsPage() {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase
      .from("contact_leads")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, status: string) => {
    await supabase.from("contact_leads").update({ status }).eq("id", id);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("contact_leads").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-maroon-deep">Contact Leads</h1>
        <p className="text-sm text-muted-foreground">{items.length} messages</p>
      </div>
      <div className="space-y-3">
        {items.map((l) => (
          <div key={l.id} className="bg-white rounded-xl border border-gold/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{l.name}</span>
                  {l.email && <span className="text-xs text-muted-foreground">{l.email}</span>}
                  {l.phone && <span className="text-xs text-muted-foreground">📞 {l.phone}</span>}
                </div>
                {l.subject && <div className="text-sm text-maroon mt-1">{l.subject}</div>}
                <p className="text-sm mt-2 whitespace-pre-wrap">{l.message}</p>
                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(l.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <select
                  value={l.status}
                  onChange={(e) => update(l.id, e.target.value)}
                  className="text-xs border rounded px-2 py-1 bg-white"
                >
                  <option value="new">new</option>
                  <option value="contacted">contacted</option>
                  <option value="resolved">resolved</option>
                </select>
                <button
                  onClick={() => remove(l.id)}
                  className="text-rose-600 p-1.5 hover:bg-rose-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-12">No leads yet.</div>
        )}
      </div>
    </div>
  );
}
