import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getShopifyProducts } from "@/lib/shopify.functions";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/list-all-products")({
  component: ListAllPage,
});

const categories = ["rudraksha", "mala", "bracelet", "gemstone", "yantra"];

function ListAllPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const fetchProducts = useServerFn(getShopifyProducts);

  const loadAll = async () => {
    setLoading(true);
    const data: any = {};

    for (const cat of categories) {
      try {
        const res = await fetchProducts({ data: { category: cat, limit: 250 } });
        data[cat] = res?.products || [];
      } catch (err) {
        data[cat] = [];
      }
    }

    setResults(data);
    setLoading(false);
  };

  const total = Object.values(results).reduce((sum: number, arr: any) => sum + arr.length, 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">All Products by Category</h1>
        <button
          onClick={loadAll}
          className="bg-maroon-deep text-white px-6 py-3 rounded mb-6"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Load All Categories"}
        </button>

        {total > 0 && (
          <div className="mb-6 p-4 bg-white rounded">
            <h2 className="text-xl font-bold">Summary</h2>
            <p className="text-2xl font-bold text-maroon-deep">Total: {total} products</p>
            {categories.map((cat) => (
              <p key={cat}>
                {cat}: <strong>{results[cat]?.length || 0}</strong>
              </p>
            ))}
          </div>
        )}

        {categories.map((cat) => {
          const products = results[cat] || [];
          if (products.length === 0) return null;

          return (
            <div key={cat} className="mb-8 bg-white p-6 rounded">
              <h2 className="text-2xl font-bold mb-4 capitalize">
                {cat} ({products.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p: any) => (
                  <div key={p.slug} className="border border-gold/20 rounded p-3 flex gap-3">
                    <img src={p.image} alt={p.name} className="w-16 h-16 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{p.price.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground">Stock: {p.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
