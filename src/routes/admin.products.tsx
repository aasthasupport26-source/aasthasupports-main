import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getShopifyProducts } from "@/lib/shopify.functions";
import {
  Loader2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Flame,
  RefreshCw,
  Search,
} from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

const CATEGORIES = [
  { slug: "", name: "All Categories" },
  { slug: "rudraksha", name: "Rudraksha" },
  { slug: "gemstones", name: "Gemstones" },
  { slug: "mala", name: "Mala" },
  { slug: "bracelet", name: "Bracelet" },
  { slug: "yantra", name: "Yantra" },
];

function ProductsPage() {
  const fetchProducts = useServerFn(getShopifyProducts);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({
        data: { category: selectedCategory || undefined, limit: 100 },
      });
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to fetch Shopify products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-maroon-deep">Shopify Products & Inventory</h1>
          <p className="text-sm text-muted-foreground">
            All physical product categories are fetched live from your Shopify inventory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            disabled={loading}
            className="flex items-center gap-2 bg-cream text-maroon border border-gold/30 px-4 py-2 rounded-md text-sm hover:bg-gold/10 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Sync Shopify
          </button>
          <Link
            to="/admin/pujas"
            className="flex items-center gap-2 bg-royal text-cream px-4 py-2 rounded-md text-sm hover:opacity-90 transition shadow-sm"
          >
            <Flame className="w-4 h-4 text-gold" /> Manage Online Poojas
          </Link>
        </div>
      </div>

      {/* Mode Guidance Notice */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg text-amber-950">
              Shopify Category Selection Active
            </h3>
            <p className="text-sm text-amber-800/90 mt-1 leading-relaxed">
              Physical merchandise (<strong>Rudraksha, Gemstones, Mala, Bracelet, Yantra</strong>)
              is synced live with Shopify. To add or modify physical products, manage listings
              directly inside your
              <a
                href="https://admin.shopify.com"
                target="_blank"
                rel="noreferrer"
                className="underline font-medium hover:text-amber-900 ml-1 inline-flex items-center gap-1"
              >
                Shopify Admin Panel <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>
            <p className="text-xs text-amber-700/80 mt-2">
              ✦ <strong>Online Pooja Category:</strong> Online Poojas are managed via Supabase right
              here in
              <Link to="/admin/pujas" className="underline font-medium ml-1">
                Pujas Management (supports up to 4+ high-res image uploads)
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gold/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-maroon-deep whitespace-nowrap">
            Category Filter:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-gold/30 bg-cream px-3 py-2 text-sm focus:outline-none focus:border-gold"
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Shopify products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md border border-gold/30 text-sm focus:outline-none focus:border-gold bg-cream"
          />
        </div>
      </div>

      {/* Shopify Products Table */}
      <div className="bg-white rounded-xl border border-gold/20 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-maroon" />
            <p className="text-sm">Fetching products from Shopify Storefront API...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No products found for the selected category filter.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream text-xs uppercase tracking-widest text-maroon-deep border-b border-gold/20">
              <tr>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">MRP / Compare</th>
                <th className="text-left p-4">Stock</th>
                <th className="text-left p-4">Badges</th>
                <th className="text-right p-4">Shopify Handle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => (
                <tr key={p.shopifyId || p.slug} className="hover:bg-cream/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gold/20 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 shrink-0">
                          No Img
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-maroon-deep line-clamp-1">{p.name}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {p.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 uppercase text-xs font-semibold text-gold-soft">
                    {p.category || selectedCategory || "General"}
                  </td>
                  <td className="p-4 font-semibold text-emerald-700">
                    ₹{Number(p.price).toLocaleString("en-IN")}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {p.mrp ? `₹${Number(p.mrp).toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        p.available
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {p.available ? `In Stock (${p.stock})` : "Out of Stock"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {p.certified && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Certified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={`/product/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-maroon hover:underline inline-flex items-center gap-1 font-mono"
                    >
                      /product/{p.slug} <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
