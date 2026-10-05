import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminLeads, updateLeadStatus, deleteLead } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  const leadsFn = useServerFn(getAdminLeads);
  const updateFn = useServerFn(updateLeadStatus);
  const deleteFn = useServerFn(deleteLead);

  const load = async () => {
    if (!accessToken) return;
    try {
      const rows = await leadsFn({ data: { accessToken } });
      setItems(rows ?? []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load leads");
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const update = async (id: string, status: string) => {
    if (!accessToken) return;
    try {
      await updateFn({ data: { accessToken, id, status: status as any } });
      load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update lead");
    }
  };
  const remove = async (id: string) => {
    if (!accessToken) return;
    if (!confirm("Delete?")) return;
    try {
      await deleteFn({ data: { accessToken, id } });
      load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete lead");
    }
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
                  <span className="font-medium">{String(l.name || "").replace(/[<>]/g, "")}</span>
                  {l.email && (
                    <span className="text-xs text-muted-foreground">
                      {String(l.email).replace(/[<>]/g, "")}
                    </span>
                  )}
                  {l.phone && (
                    <span className="text-xs text-muted-foreground">
                      📞 {String(l.phone).replace(/[<>]/g, "")}
                    </span>
                  )}
                </div>
                <p className="text-sm mt-2 whitespace-pre-wrap">
                  {String(l.message || "").replace(/[<>]/g, "")}
                </p>
                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(l.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <select
                  value={l.status || "new"}
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
