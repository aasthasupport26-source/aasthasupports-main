import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { getCategory } from "@/data/catalog";
import { useCart } from "@/contexts/CartContext";
import { getShopifyProduct } from "@/lib/shopify.functions";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  ShieldCheck,
  Sparkles,
  Truck,
  Award,
  ShoppingBag,
  Heart,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params, context }) => {
    const product = await context.queryClient.ensureQueryData({
      queryKey: ['product', params.slug],
      queryFn: async () => {
        const fn = getShopifyProduct as any;
        return fn({ data: { handle: params.slug } });
      },
      staleTime: 5 * 60 * 1000,
    });
    return { slug: params.slug, product };
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    const title = product ? `${product.name} — Aastha Support` : `Product — Aastha Support`;
    const description = product?.description?.slice(0, 160) || "Authentic certified spiritual products";
    const url = `https://aasthasupport.com/product/${loaderData?.slug}`;
    const image = product?.images?.[0] || "https://aasthasupport.com/og-image.jpg";
    
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "product" },
        { property: "og:image", content: image },
        { property: "product:price:amount", content: product?.price?.toString() || "" },
        { property: "product:price:currency", content: "INR" },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "preload", href: image, as: "image" },
      ],
      scripts: product ? [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.images,
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "INR",
              availability: product.variants?.[0]?.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
          }),
        },
      ] : [],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug, product: initialProduct } = Route.useLoaderData();
  const { add } = useCart();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);

  const { data: product } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const fn = getShopifyProduct as any;
      return fn({ data: { handle: slug } });
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    initialData: initialProduct,
  });

  if (!product) {
    throw notFound();
  }

  const price = product.price;
  const mrp = product.mrp || price;
  const off = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  // Find category details if product has a category metafield
  const cat = getCategory(product.category?.trim().toLowerCase()) || {
    name: product.category || "Shop",
    slug: product.category || "all",
  };

  const addToCart = () => {
    add({
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price,
      mrp,
      categoryName: cat.name,
      variantId: product.variants[0]?.id,
    });
    toast.success(`${product.name} added to cart`);
  };

  const buyNow = () => {
    addToCart();
    navigate({ to: "/cart" as any });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs tracking-widest uppercase text-muted-foreground mb-8">
          <Link to="/" className="hover:text-maroon">
            Home
          </Link>
          <span className="mx-2 text-gold">/</span>
          {cat.slug !== "all" ? (
            <>
              <Link to="/category/$slug" params={{ slug: cat.slug }} className="hover:text-maroon">
                {cat.name}
              </Link>
              <span className="mx-2 text-gold">/</span>
            </>
          ) : null}
          <span className="text-maroon-deep">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-cream border border-gold/30 shadow-royal">
              <img
                src={product.images[activeImage] || ""}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((img: string, i: number) => (
                  <div
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-lg overflow-hidden border cursor-pointer hover:border-gold transition ${
                      activeImage === i ? "border-gold ring-2 ring-gold/20" : "border-gold/20"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-gold tracking-[0.3em] text-xs">{cat.name.toUpperCase()}</p>
            <h1 className="font-display text-4xl md:text-5xl text-maroon-deep mt-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-0.5 text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.9 · 1,284 reviews</span>
            </div>

            {product.description && (
              <p className="mt-5 text-foreground/80 leading-relaxed">{product.description}</p>
            )}

            <div className="flex items-baseline gap-3 mt-6">
              <span className="font-numeric text-4xl text-maroon-deep">
                ₹{price.toLocaleString("en-IN")}
              </span>
              {mrp > price && (
                <span className="text-muted-foreground line-through">
                  ₹{mrp.toLocaleString("en-IN")}
                </span>
              )}
              {off > 0 && (
                <span className="text-xs bg-gold/20 text-maroon px-2 py-1 rounded tracking-widest uppercase">
                  {off}% off
                </span>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 mt-7">
              {[
                { icon: ShieldCheck, label: "Lab Certified", active: product.certified !== false },
                { icon: Sparkles, label: "Vedic Energised", active: true },
                { icon: Award, label: "Origin Verified", active: true },
                { icon: Truck, label: "Free Shipping", active: true },
              ]
                .filter((b) => b.active)
                .map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 p-3 rounded-lg bg-cream border border-gold/20"
                  >
                    <Icon className="w-5 h-5 text-gold shrink-0" />
                    <span className="text-sm text-maroon-deep font-medium">{label}</span>
                  </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-7">
              <button
                onClick={addToCart}
                disabled={!product.variants[0]?.available}
                className="flex-1 bg-royal text-cream px-6 py-4 rounded-md font-medium tracking-widest text-xs uppercase hover:opacity-90 transition shadow-royal flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />{" "}
                {product.variants[0]?.available ? "Add to Cart" : "Out of Stock"}
              </button>
              <button
                onClick={buyNow}
                disabled={!product.variants[0]?.available}
                className="flex-1 bg-gold text-maroon-deep px-6 py-4 rounded-md font-medium tracking-widest text-xs uppercase hover:bg-gold-soft transition shadow-gold disabled:opacity-50"
              >
                Buy Now
              </button>
              <button
                className="w-14 border border-maroon/40 rounded-md flex items-center justify-center hover:bg-maroon hover:text-cream transition"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Details accordion-like */}
            <div className="mt-10 space-y-4">
              {product.benefits && product.benefits.length > 0 ? (
                <div className="border-t border-gold/20 pt-5">
                  <h3 className="font-display text-xl text-maroon-deep">Spiritual Benefits</h3>
                  <ul className="mt-3 space-y-2 text-sm text-foreground/80">
                    {product.benefits.map((benefit: string, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-gold">✦</span> {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="border-t border-gold/20 pt-5">
                  <h3 className="font-display text-xl text-maroon-deep">Spiritual Benefits</h3>
                  <ul className="mt-3 space-y-2 text-sm text-foreground/80">
                    <li className="flex gap-2">
                      <span className="text-gold">✦</span> Removes obstacles and negative energies
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold">✦</span> Enhances concentration and meditation
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold">✦</span> Bestows the wearer with peace and
                      prosperity
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold">✦</span> Aligns chakras and balances energy
                    </li>
                  </ul>
                </div>
              )}

              <div className="border-t border-gold/20 pt-5">
                <h3 className="font-display text-xl text-maroon-deep">How to Wear / Use</h3>
                <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
                  We provide the complete energisation and usage guide with every order. Follow the
                  included instructions for maximum spiritual benefits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
