import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useServerFn } from '@tanstack/react-start';
import { getShopifyProducts } from '@/lib/shopify.functions';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Search, Star, ShieldCheck, Sparkles, SlidersHorizontal, ShoppingBag, Loader2 } from 'lucide-react';
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useServerFn } from "@tanstack/react-start";
import { getShopifyProducts } from "@/lib/shopify.functions";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import {
  Search,
  Star,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  ShoppingBag,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/shop")({
  head: () => {
    const title = "Shop All — Rudraksha, Mala, Gemstones | Aastha Support";
    const desc =
      "Browse all certified rudraksha, malas, bracelets, gemstones & yantras. Energised by Vedic pandits.";
    const url = "https://aasthasupport.com/shop";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ShopPage,
});

function ShopPage() {
  const { add } = useCart();
  const navigate = useNavigate();
  const fetchProducts = useServerFn(getShopifyProducts);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products on mount
  React.useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts({ data: { limit: 50 } });
        setProducts(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load products");
        toast.error("Failed to load products from Shopify");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const categories = [
    { name: "All Products", slug: "all" },
    { name: "Rudraksha", slug: "rudraksha" },
    { name: "Malas", slug: "mala" },
    { name: "Bracelets", slug: "bracelet" },
    { name: "Gemstones", slug: "gemstone" },
    { name: "Yantras", slug: "yantra" },
  ];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: any) => {
    if (!product.variantId) {
      toast.error("Product variant not available");
      return;
    }
    add({
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      mrp: product.mrp || product.price,
      variantId: product.variantId,
      categoryName: product.category,
    });
    toast.success(`${product.name} added to cart`);
    navigate({ to: '/cart' });
    navigate({ to: "/cart", search: { cleared: undefined } });
  };

  return (
    <Layout>
      <section className="py-20 bg-gradient-to-b from-cream to-white">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl text-maroon-deep mb-4">
              Sacred Collection
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our curated selection of authentic rudraksha, gemstones, malas, and yantras
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-12 space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for rudraksha, gemstones, malas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gold/20 focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-6 py-2.5 rounded-full transition-all ${
                    selectedCategory === cat.slug
                      ? "bg-maroon-deep text-white shadow-md"
                      : "bg-white text-maroon-deep border border-gold/20 hover:border-gold"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
              <span className="ml-3 text-muted-foreground">Loading products from Shopify...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-maroon-deep text-white rounded-lg hover:bg-maroon-darker"
              >
                Retry
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg mb-4">
                    {search || selectedCategory !== "all"
                      ? "No products match your search"
                      : "No products found in Shopify"}
                  </p>
                  {(search || selectedCategory !== "all") && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setSelectedCategory("all");
                      }}
                      className="text-maroon-deep hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                  {!search && selectedCategory === "all" && (
                    <p className="text-sm text-muted-foreground mt-4">
                      Add products in your Shopify admin with proper metafields
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <p className="text-muted-foreground">
                      Showing {filteredProducts.length} product
                      {filteredProducts.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.shopifyId}
                        className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-royal transition-all duration-300 border border-gold/10"
                      >
                        {/* Product Image */}
                        <Link
                          to="/product/$slug"
                          params={{ slug: product.slug }}
                          className="block relative aspect-square overflow-hidden bg-cream"
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              No image
                            </div>
                          )}
                          {product.certified && (
                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                              <ShieldCheck className="w-4 h-4 text-green-600" />
                              <span className="text-xs font-medium text-green-700">Certified</span>
                            </div>
                          )}
                          {!product.available && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="bg-white px-4 py-2 rounded-lg font-medium">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </Link>

                        {/* Product Info */}
                        <div className="p-5">
                          <Link
                            to="/product/$slug"
                            params={{ slug: product.slug }}
                            className="block mb-3"
                          >
                            <h3 className="font-display text-lg text-maroon-deep mb-2 group-hover:text-maroon-darker transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                            {product.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {product.description}
                              </p>
                            )}
                          </Link>

                          {/* Price */}
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl font-bold text-maroon-deep">
                              ₹{product.price.toLocaleString("en-IN")}
                            </span>
                            {product.mrp && product.mrp > product.price && (
                              <>
                                <span className="text-sm text-muted-foreground line-through">
                                  ₹{product.mrp.toLocaleString("en-IN")}
                                </span>
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                  {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                                  OFF
                                </span>
                              </>
                            )}
                          </div>

                          {/* Add to Cart Button */}
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.available}
                            className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                              product.available
                                ? "bg-maroon-deep text-white hover:bg-maroon-darker hover:shadow-md"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <ShoppingBag className="w-4 h-4" />
                            {product.available ? "Buy Now" : "Out of Stock"}
                          </button>

                          {/* Stock Info */}
                          {product.available &&
                            product.stock !== undefined &&
                            product.stock < 10 && (
                              <p className="text-xs text-orange-600 mt-2 text-center">
                                Only {product.stock} left in stock
                              </p>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
