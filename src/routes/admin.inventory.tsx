import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getShopifyProducts } from "@/lib/shopify.functions";
import { Loader2, Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventoryPage,
});

function AdminInventoryPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const fetchProducts = useServerFn(getShopifyProducts);

  const loadAllProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({ data: { category: "all", limit: 250 } });
      setProducts(data?.products || []);
      toast.success(`Loaded ${data?.products?.length || 0} products`);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith(".csv") && !uploadedFile.name.endsWith(".xlsx")) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    setFile(uploadedFile);
    toast.success(`File selected: ${uploadedFile.name}`);
  };

  const processSheet = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const rows = text.split("\n").map((row) => row.split(","));
      const headers = rows[0];
      const data = rows.slice(1).map((row) => {
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h.trim()] = row[i]?.trim();
        });
        return obj;
      });

      toast.success(`Parsed ${data.length} rows from sheet`);
      console.log("Sheet data:", data);
    } catch (err) {
      toast.error("Failed to process file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl text-maroon-deep mb-8">Inventory Management</h1>

        <div className="grid gap-6 mb-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl border border-gold/20 p-6">
            <h2 className="font-display text-2xl text-maroon-deep mb-4">Upload Product Sheet</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gold/30 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gold mb-4" />
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-block bg-maroon-deep text-cream px-6 py-3 rounded-lg hover:bg-maroon transition"
                >
                  Choose File
                </label>
                {file && <p className="mt-4 text-sm text-muted-foreground">{file.name}</p>}
              </div>
              <button
                onClick={processSheet}
                disabled={!file || loading}
                className="w-full bg-gold text-maroon-deep px-6 py-3 rounded-lg font-semibold hover:bg-gold-soft transition disabled:opacity-50"
              >
                {loading ? "Processing..." : "Process Sheet"}
              </button>
            </div>
          </div>

          {/* Fetch Products Section */}
          <div className="bg-white rounded-xl border border-gold/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-maroon-deep">Shopify Inventory</h2>
              <button
                onClick={loadAllProducts}
                disabled={loading}
                className="flex items-center gap-2 bg-maroon-deep text-cream px-4 py-2 rounded-lg hover:bg-maroon transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Fetch All Products
              </button>
            </div>

            {products.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Total Products: {products.length}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-cream border-b border-gold/20">
                      <tr>
                        <th className="text-left p-3">Image</th>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Price</th>
                        <th className="text-left p-3">Stock</th>
                        <th className="text-left p-3">Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.shopifyId} className="border-b border-gold/10">
                          <td className="p-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          </td>
                          <td className="p-3 font-medium">{p.name}</td>
                          <td className="p-3 text-muted-foreground">{p.productType}</td>
                          <td className="p-3">₹{p.price.toLocaleString("en-IN")}</td>
                          <td className="p-3">{p.stock}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${p.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                              {p.available ? "Yes" : "No"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
