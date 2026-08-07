import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({ component: CategoriesPage });

type Category = {
  id?: string;
  slug: string;
  name: string;
  parent_slug?: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
};
const empty: Category = { slug: "", name: "", sort_order: 0, is_active: true };

function CategoriesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order")
      .order("name");
    setItems((data ?? []) as any[]);
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    const { error } = editing.id
      ? await supabase.from("categories").update(editing).eq("id", editing.id)
      : await supabase.from("categories").insert(editing);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-maroon-deep">Categories</h1>
          <p className="text-sm text-muted-foreground">{items.length} categories</p>
        </div>
        <button
          onClick={() => setEditing(empty)}
          className="bg-royal text-cream px-4 py-2.5 rounded-md text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gold/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-xs uppercase tracking-widest text-maroon-deep">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Parent</th>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-xs">{c.slug}</td>
                <td className="p-3 text-xs">{c.parent_slug || "—"}</td>
                <td className="p-3">{c.sort_order}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100"}`}
                  >
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(c)} className="p-1.5 hover:bg-cream rounded">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(c.id!)}
                    className="p-1.5 text-rose-600 rounded ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditing(null)}
        >
          <div className="bg-white rounded-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display text-xl text-maroon-deep">
                {editing.id ? "Edit" : "New"} Category
              </h2>
              <button onClick={() => setEditing(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <Input
                label="Name"
                value={editing.name}
                onChange={(v) => setEditing({ ...editing, name: v })}
              />
              <Input
                label="Slug"
                value={editing.slug}
                onChange={(v) => setEditing({ ...editing, slug: v })}
              />
              <Input
                label="Parent Slug (optional)"
                value={editing.parent_slug ?? ""}
                onChange={(v) => setEditing({ ...editing, parent_slug: v })}
              />
              <Input
                label="Image URL"
                value={editing.image_url ?? ""}
                onChange={(v) => setEditing({ ...editing, image_url: v })}
              />
              <Input
                label="Description"
                value={editing.description ?? ""}
                onChange={(v) => setEditing({ ...editing, description: v })}
              />
              <Input
                label="Sort Order"
                type="number"
                value={String(editing.sort_order)}
                onChange={(v) => setEditing({ ...editing, sort_order: Number(v) })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                />{" "}
                Active
              </label>
            </div>
            <div className="p-5 border-t flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-md">
                Cancel
              </button>
              <button onClick={save} className="px-4 py-2 bg-royal text-cream rounded-md">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-maroon-deep">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-gold/30 bg-cream px-3 py-2 text-sm focus:border-gold focus:outline-none"
      />
    </div>
  );
}
