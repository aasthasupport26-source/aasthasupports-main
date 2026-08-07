import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  getAdminTemples,
  getAdminPujas,
  createPuja,
  updatePuja,
  deletePuja,
  getAdminPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "@/lib/admin.functions";
import { Loader2, Plus, Edit2, Trash2, Save, X, Settings2, PackagePlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pujas")({
  component: AdminPujas,
});

function AdminPujas() {
  const fetchTemples = useServerFn(getAdminTemples);
  const fetchPujas = useServerFn(getAdminPujas);
  const doCreatePuja = useServerFn(createPuja);
  const doUpdatePuja = useServerFn(updatePuja);
  const doDeletePuja = useServerFn(deletePuja);

  const [temples, setTemples] = useState<any[]>([]);
  const [pujas, setPujas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);
  const [managingPackagesFor, setManagingPackagesFor] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, pData] = await Promise.all([
        fetchTemples({ data: {} }),
        fetchPujas({ data: {} }),
      ]);
      setTemples(tData);
      setPujas(pData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (puja: any) => {
    const gallery = Array.isArray(puja.benefits?.gallery) ? puja.benefits.gallery : [];
    setEditingId(puja.id);
    setFormData({
      ...puja,
      image_url: puja.image_url || gallery[0] || "",
      image_url_2: puja.image_url_2 || gallery[1] || "",
      image_url_3: puja.image_url_3 || gallery[2] || "",
      image_url_4: puja.image_url_4 || gallery[3] || "",
    });
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setEditingId("new");
    setFormData({
      name: "",
      slug: "",
      temple_id: temples[0]?.id || "",
      description: "",
      image_url: "",
      image_url_2: "",
      image_url_3: "",
      image_url_4: "",
      duration_minutes: 60,
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
      const gallery = [
        formData.image_url,
        formData.image_url_2,
        formData.image_url_3,
        formData.image_url_4,
      ].filter(Boolean);

      const benefits =
        typeof formData.benefits === "object" && formData.benefits !== null
          ? { ...formData.benefits, gallery }
          : { gallery };

      const payload: any = {
        name: formData.name,
        slug: formData.slug,
        temple_id: formData.temple_id,
        description: formData.description || "",
        image_url: formData.image_url || gallery[0] || "",
        duration_minutes: formData.duration_minutes || 60,
        active: Boolean(formData.active),
        benefits,
      };

      if (!isCreating) {
        payload.id = editingId;
        await doUpdatePuja({ data: payload });
        toast.success("Puja updated successfully with gallery images!");
      } else {
        await doCreatePuja({ data: payload });
        toast.success("Puja created successfully with gallery images!");
      }
      handleCancel();
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save puja");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this puja? All its packages will be lost!"))
      return;
    try {
      await doDeletePuja({ data: { id } });
      toast.success("Puja deleted successfully");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete puja");
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
        <h2 className="text-2xl font-display text-maroon-deep">Manage Pujas</h2>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-gold text-maroon-deep px-4 py-2 rounded-md font-medium text-sm hover:bg-gold-soft transition"
        >
          <Plus className="w-4 h-4" /> Add Puja
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gold/20 text-maroon-deep/70">
              <th className="p-3 font-medium text-sm">Puja</th>
              <th className="p-3 font-medium text-sm">Temple</th>
              <th className="p-3 font-medium text-sm">Duration</th>
              <th className="p-3 font-medium text-sm">Status</th>
              <th className="p-3 font-medium text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/10">
            {pujas.map((puja) => (
              <tr key={puja.id} className="hover:bg-cream/50 transition">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {puja.image_url ? (
                      <img
                        src={puja.image_url}
                        alt={puja.name}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-cream border border-gold/20 flex items-center justify-center text-xs text-muted-foreground">
                        No img
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-maroon-deep">{puja.name}</div>
                      <div className="text-xs text-muted-foreground">/{puja.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {puja.temple?.name || "Unknown"}
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {puja.duration_minutes ? `${puja.duration_minutes}m` : "-"}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${puja.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {puja.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => setManagingPackagesFor(puja)}
                    className="p-1.5 text-royal hover:bg-royal/10 rounded transition"
                    title="Manage Packages"
                  >
                    <PackagePlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(puja)}
                    className="p-1.5 text-gold hover:bg-gold/10 rounded transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(puja.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {pujas.length === 0 && !isCreating && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                  No pujas configured yet. Click "Add Puja" to create one.
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
                {isCreating ? "Add Puja" : "Edit Puja"}
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
                <label className="block text-xs font-medium text-maroon-deep mb-1">Temple *</label>
                <select
                  className="w-full border border-gold/30 rounded-md p-2 text-sm focus:ring-1 focus:ring-gold outline-none"
                  value={formData.temple_id || ""}
                  onChange={(e) => setFormData({ ...formData, temple_id: e.target.value })}
                >
                  <option value="" disabled>
                    Select a temple...
                  </option>
                  {temples.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-maroon-deep mb-1">Name *</label>
                  <input
                    type="text"
                    className="w-full border border-gold/30 rounded-md p-2 text-sm focus:ring-1 focus:ring-gold outline-none"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: isCreating
                          ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                          : formData.slug,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-maroon-deep mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gold/30 rounded-md p-2 text-sm focus:ring-1 focus:ring-gold outline-none bg-gray-50"
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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
              {/* 4 Images Upload / Gallery Section */}
              <div className="border border-gold/30 rounded-lg p-4 bg-cream/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-maroon-deep">
                    Puja Images (Minimum 4 Recommended)
                  </label>
                  <span className="text-[10px] text-muted-foreground">Paste image URLs</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-maroon-deep mb-1">
                      Image 1 (Main Banner) *
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      className="w-full border border-gold/30 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-gold outline-none bg-white"
                      value={formData.image_url || ""}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                    {formData.image_url && (
                      <img
                        src={formData.image_url}
                        alt="Cover"
                        className="w-full h-14 object-cover rounded mt-1 border border-gold/20"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-maroon-deep mb-1">
                      Image 2 (Gallery Photo)
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      className="w-full border border-gold/30 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-gold outline-none bg-white"
                      value={formData.image_url_2 || ""}
                      onChange={(e) => setFormData({ ...formData, image_url_2: e.target.value })}
                    />
                    {formData.image_url_2 && (
                      <img
                        src={formData.image_url_2}
                        alt="Img 2"
                        className="w-full h-14 object-cover rounded mt-1 border border-gold/20"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-maroon-deep mb-1">
                      Image 3 (Gallery Photo)
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      className="w-full border border-gold/30 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-gold outline-none bg-white"
                      value={formData.image_url_3 || ""}
                      onChange={(e) => setFormData({ ...formData, image_url_3: e.target.value })}
                    />
                    {formData.image_url_3 && (
                      <img
                        src={formData.image_url_3}
                        alt="Img 3"
                        className="w-full h-14 object-cover rounded mt-1 border border-gold/20"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-maroon-deep mb-1">
                      Image 4 (Gallery Photo)
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      className="w-full border border-gold/30 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-gold outline-none bg-white"
                      value={formData.image_url_4 || ""}
                      onChange={(e) => setFormData({ ...formData, image_url_4: e.target.value })}
                    />
                    {formData.image_url_4 && (
                      <img
                        src={formData.image_url_4}
                        alt="Img 4"
                        className="w-full h-14 object-cover rounded mt-1 border border-gold/20"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-maroon-deep mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  className="w-full border border-gold/30 rounded-md p-2 text-sm focus:ring-1 focus:ring-gold outline-none"
                  value={formData.duration_minutes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
                  }
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

      {/* Packages Modal */}
      {managingPackagesFor && (
        <PackagesManagerModal
          puja={managingPackagesFor}
          onClose={() => setManagingPackagesFor(null)}
        />
      )}
    </div>
  );
}

// Sub-component for managing packages of a specific puja
function PackagesManagerModal({ puja, onClose }: { puja: any; onClose: () => void }) {
  const fetchPackages = useServerFn(getAdminPackages);
  const doCreate = useServerFn(createPackage);
  const doUpdate = useServerFn(updatePackage);
  const doDelete = useServerFn(deletePackage);

  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await fetchPackages({ data: { pujaId: puja.id } });
      setPackages(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load packages");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPackages();
  }, [puja.id]);

  const handleSave = async () => {
    try {
      if (isCreating) {
        await doCreate({ data: formData });
        toast.success("Package added");
      } else {
        await doUpdate({ data: formData });
        toast.success("Package updated");
      }
      setEditingId(null);
      loadPackages();
    } catch (err: any) {
      toast.error(err.message || "Failed to save package");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    try {
      await doDelete({ data: { id } });
      toast.success("Package deleted");
      loadPackages();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-royal w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gold/20 bg-cream">
          <div>
            <h3 className="font-display text-xl text-maroon-deep">Manage Packages</h3>
            <p className="text-xs text-muted-foreground mt-1">For: {puja.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-maroon-deep transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          {editingId ? (
            <div className="border border-gold/30 p-4 rounded-xl bg-gray-50 mb-6">
              <h4 className="font-medium text-maroon-deep mb-3">
                {isCreating ? "New Package" : "Edit Package"}
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-maroon-deep mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gold/30 rounded-md p-2 text-sm"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Basic, Premium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-maroon-deep mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gold/30 rounded-md p-2 text-sm"
                      value={formData.price || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-maroon-deep mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gold/30 rounded-md p-2 text-sm"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="pkg_active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <label htmlFor="pkg_active" className="text-sm text-maroon-deep cursor-pointer">
                    Active
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-maroon-deep"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-gold text-maroon-deep px-4 py-1.5 rounded-md text-xs font-medium shadow-sm hover:bg-gold-soft"
                  >
                    Save Package
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditingId("new");
                setIsCreating(true);
                setFormData({
                  puja_id: puja.id,
                  name: "",
                  description: "",
                  price: 0,
                  active: true,
                });
              }}
              className="w-full py-3 mb-6 border-2 border-dashed border-gold/30 rounded-xl text-sm font-medium text-gold hover:bg-cream hover:border-gold/50 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Package
            </button>
          )}

          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-maroon" />
            </div>
          ) : (
            <div className="space-y-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between p-4 border border-gold/20 rounded-xl hover:bg-cream/30 transition"
                >
                  <div>
                    <div className="font-medium text-maroon-deep">
                      {pkg.name}{" "}
                      <span className="text-sm text-maroon ml-2">
                        ₹{pkg.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {pkg.description || "No description"}
                    </div>
                    {!pkg.active && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mt-1 inline-block">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(pkg.id);
                        setFormData(pkg);
                        setIsCreating(false);
                      }}
                      className="p-1.5 text-gold hover:bg-gold/10 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {packages.length === 0 && !editingId && (
                <p className="text-center text-sm text-muted-foreground p-8 bg-gray-50 rounded-xl border border-gray-100">
                  No packages created yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
