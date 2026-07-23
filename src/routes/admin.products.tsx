import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

type Product = {
  id?: string; slug: string; name: string; category_slug: string; subcategory?: string;
  short_description?: string; description?: string; price: number; mrp?: number;
  stock: number; image_url?: string; is_active: boolean; is_featured: boolean;
};

const empty: Product = { slug: "", name: "", category_slug: "rudraksha", price: 0, stock: 0, is_active: true, is_featured: false };

function ProductsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [cats, setCats] = useState<{ slug: string; name: string }[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as any[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    supabase.from("categories").select("slug,name").order("name").then(({ data }) => setCats(data ?? []));
  }, []);

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing, updated_at: new Date().toISOString() };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-maroon-deep">Products</h1>
          <p className="text-sm text-muted-foreground">{items.length} items</p>
        </div>
        <button onClick={() => setEditing(empty)}
          className="bg-royal text-cream px-4 py-2.5 rounded-md text-sm flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> New Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gold/20 overflow-hidden">
        {loading ? <div className="p-6 text-sm text-muted-foreground">Loading…</div> :
          items.length === 0 ? <div className="p-6 text-sm text-muted-foreground">No products yet. Click "New Product".</div> :
          <table className="w-full text-sm">
            <thead className="bg-cream text-xs uppercase tracking-widest text-maroon-deep">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Stock</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.slug}</div>
                  </td>
                  <td className="p-3">{p.category_slug}</td>
                  <td className="p-3">₹{Number(p.price).toLocaleString("en-IN")}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditing(p)} className="p-1.5 hover:bg-cream rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(p.id!)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded ml-1"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display text-xl text-maroon-deep">{editing.id ? "Edit" : "New"} Product</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <Field label="Name *"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} /></Field>
              <Field label="Slug *"><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className={inputCls} placeholder="e.g. 5-mukhi-nepali" /></Field>
              <Field label="Category">
                <select value={editing.category_slug} onChange={(e) => setEditing({ ...editing, category_slug: e.target.value })} className={inputCls}>
                  {cats.length === 0 && <option value="rudraksha">rudraksha</option>}
                  {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Subcategory"><input value={editing.subcategory ?? ""} onChange={(e) => setEditing({ ...editing, subcategory: e.target.value })} className={inputCls} /></Field>
              <Field label="Price (₹) *"><input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="MRP (₹)"><input type="number" value={editing.mrp ?? ""} onChange={(e) => setEditing({ ...editing, mrp: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="Stock"><input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="Image URL"><input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className={inputCls} /></Field>
              <Field label="Short Description" full><input value={editing.short_description ?? ""} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} className={inputCls} /></Field>
              <Field label="Description" full><textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={4} className={inputCls} /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} /> Featured</label>
            </div>
            <div className="p-5 border-t flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-md border">Cancel</button>
              <button onClick={save} className="px-4 py-2 rounded-md bg-royal text-cream">Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-md border border-gold/30 bg-cream px-3 py-2 text-sm focus:border-gold focus:outline-none";
function Field({ label, children, full }: any) {
  return <div className={full ? "col-span-2" : ""}><label className="text-xs uppercase tracking-widest text-maroon-deep">{label}</label><div className="mt-1">{children}</div></div>;
}
