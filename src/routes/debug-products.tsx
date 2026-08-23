import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getShopifyProducts } from "@/lib/shopify.functions";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/debug-products")({
  component: DebugPage,
});

function DebugPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchProducts = useServerFn(getShopifyProducts);

  const load = async () => {
    setLoading(true);
    try {
      console.log("Fetching products...");
      const data = await fetchProducts({ data: { category: "rudraksha", limit: 50 } });
      console.log("Response:", data);
      console.log("Products:", data?.products);
      setProducts(data?.products || []);
    } catch (err) {
      console.error("Error:", err);
      alert("Error: " + err);
    }
    setLoading(false);
  };

  const nepali = products.filter((p) => p.name.toLowerCase().includes("nepal"));
  const indonesian = products.filter((p) => p.name.toLowerCase().includes("indonesian"));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Product Debug</h1>
        <button
          onClick={load}
          className="bg-maroon-deep text-white px-6 py-3 rounded mb-6"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load Rudraksha Products"}
        </button>

        {products.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded">
              <h2 className="text-xl font-bold mb-2">Summary</h2>
              <p>Total: {products.length}</p>
              <p>Nepali: {nepali.length}</p>
              <p>Indonesian: {indonesian.length}</p>
            </div>

            <div className="bg-white p-4 rounded">
              <h2 className="text-xl font-bold mb-2">Nepali Products ({nepali.length})</h2>
              <ul className="space-y-1">
                {nepali.map((p) => (
                  <li key={p.slug} className="text-sm">
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded">
              <h2 className="text-xl font-bold mb-2">Indonesian Products ({indonesian.length})</h2>
              <ul className="space-y-1">
                {indonesian.map((p) => (
                  <li key={p.slug} className="text-sm">
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded">
              <h2 className="text-xl font-bold mb-2">All Products</h2>
              <ul className="space-y-1">
                {products.map((p) => (
                  <li key={p.slug} className="text-sm">
                    {p.name} - {p.productType}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
