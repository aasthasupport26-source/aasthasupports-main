import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAdminTemples, createTemple, updateTemple, deleteTemple } from "@/lib/admin.functions";
import { Loader2, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/admin/temples")({
  component: AdminTemples,
});

function AdminTemples() {
  const { accessToken } = useAuth();
  const fetchTemples = useServerFn(getAdminTemples);
  const doCreate = useServerFn(createTemple);
  const doUpdate = useServerFn(updateTemple);
  const doDelete = useServerFn(deleteTemple);

  const [temples, setTemples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);

  const loadTemples = async () => {
    setLoading(true);
    try {
      const data = await fetchTemples({ data: { accessToken: accessToken! } });
      setTemples(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load temples");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTemples();
  }, []);

  const handleEdit = (temple: any) => {
    setEditingId(temple.id);
    setFormData(temple);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setEditingId("new");
    setFormData({
      name: "",
      city: "",
      state: "",
      description: "",
      image_url: "",
      active: true,
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
    setIsCreating(false);
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        await doCreate({ data: { ...formData, accessToken: accessToken! } });
        toast.success("Temple created successfully");
      } else {
        await doUpdate({ data: { ...formData, accessToken: accessToken! } });
        toast.success("Temple updated successfully");
      }
      handleCancel();
      loadTemples();
    } catch (err: any) {
      toast.error(err.message || "Failed to save temple");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this temple? This may fail if there are pujas attached to it.",
      )
    )
      return;
    try {
      await doDelete({ data: { id, accessToken: accessToken! } });
      toast.success("Temple deleted successfully");
      loadTemples();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete temple");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-maroon" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gold/20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display text-maroon-deep">Manage Temples</h2>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-gold text-maroon-deep px-4 py-2 rounded-md font-medium text-sm hover:bg-gold-soft transition"
        >
          <Plus className="w-4 h-4" /> Add Temple
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gold/20 text-maroon-deep/70">
              <th className="p-3 font-medium text-sm">Image</th>
              <th className="p-3 font-medium text-sm">Name</th>
              <th className="p-3 font-medium text-sm">City</th>
              <th className="p-3 font-medium text-sm">Status</th>
              <th className="p-3 font-medium text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/10">
            {temples.map((temple) => (
              <tr key={temple.id} className="hover:bg-cream/50 transition">
                <td className="p-3">
                  {temple.image_url ? (
                    <img
                      src={temple.image_url}
                      alt={temple.name}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-cream border border-gold/20 flex items-center justify-center text-xs text-muted-foreground">
                      No img
                    </div>
                  )}
                </td>
                <td className="p-3 font-medium text-maroon-deep">{temple.name}</td>
                <td className="p-3 text-sm text-muted-foreground">
                  {temple.city}
                  {temple.state ? `, ${temple.state}` : ""}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${temple.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {temple.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(temple)}
                    className="p-1.5 text-gold hover:bg-gold/10 rounded transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(temple.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {temples.length === 0 && !isCreating && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                  No temples configured yet. Click "Add Temple" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-royal w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-gold/20 bg-cream">
              <h3 className="font-display text-xl text-maroon-deep">
                {isCreating ? "Add Temple" : "Edit Temple"}
              </h3>
              <button
                onClick={handleCancel}
                className="p-1 text-muted-foreground hover:text-maroon-deep transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-medium text-maroon-deep mb-1">Name *</label>
                <input
                  type="text"
                  className="w-full border border-gold/30 rounded-md p-2 text-sm focus:ring-1 focus:ring-gold outline-none"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-maroon-deep mb-1">City *</label>
                  <input
                    type="text"
                    className="w-full border border-gold/30 rounded-md p-2 text-sm focus:ring-1 focus:ring-gold outline-none"
                    value={formData.city || ""}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-maroon-deep mb-1">State</label>
                  <input
                    type="text"
                    className="w-full border border-gold/30 rounded-md p-2 text-sm focus:ring-1 focus:ring-gold outline-none"
                    value={formData.state || ""}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-maroon-deep mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border border-gold/30 rounded-md p-2 text-sm focus:ring-1 focus:ring-gold outline-none min-h-[80px]"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-maroon-deep mb-1">Image URL</label>
                <input
                  type="text"
                  className="w-full border border-gold/30 rounded-md p-2 text-sm focus:ring-1 focus:ring-gold outline-none"
                  value={formData.image_url || ""}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <label htmlFor="active" className="text-sm text-maroon-deep cursor-pointer">
                  Active / Visible on site
                </label>
              </div>
            </div>
            <div className="p-5 border-t border-gold/20 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-maroon-deep transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-maroon-deep text-cream px-5 py-2 rounded-md text-sm font-medium hover:bg-maroon transition shadow-md"
              >
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
