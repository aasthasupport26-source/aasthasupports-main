import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { getCategory } from "@/data/catalog";
import { useCart } from "@/contexts/CartContext";
import { getShopifyProduct, normalizeShopifyVideoUrl } from "@/lib/shopify.functions";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect } from "react";
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
  Play,
} from "lucide-react";
import { getProductRating, getCleanProductTitle, getProductSummary } from "@/lib/product-display";
import { ProductRating } from "@/components/ProductRating";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params, context }) => {
    const product = await context.queryClient.ensureQueryData({
      queryKey: ["product", params.slug],
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
    const description =
      product?.description?.slice(0, 160) || "Authentic certified spiritual products";
    const url = `https://www.aasthasupports.com/product/${loaderData?.slug}`;
    const image = product?.images?.[0] || "https://www.aasthasupports.com/og-image.jpg";

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
      scripts: product
        ? [
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
                  availability: product.variants?.[0]?.available
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                },
              }),
            },
          ]
        : [],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug, product: initialProduct } = Route.useLoaderData();
  const { add } = useCart();
  const navigate = useNavigate();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product } = useQuery({
    queryKey: ["product", slug],
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

  // Construct unified media gallery list (supporting both images and videos)
  const galleryItems =
    product.media && product.media.length > 0
      ? product.media
      : (product.images || []).map((url: string, idx: number) => ({
          type: "image" as const,
          id: `img-${idx}`,
          url,
          altText: product.name,
        }));

  // If the product has a video, default to showing and playing it immediately
  const firstVideoIndex = galleryItems.findIndex(
    (item: any) => item.type === "video" || item.type === "external_video",
  );
  const initialMediaIndex = firstVideoIndex !== -1 ? firstVideoIndex : 0;
  const [activeMediaIndex, setActiveMediaIndex] = useState(initialMediaIndex);

  // Sync if slug changes
  useEffect(() => {
    setActiveMediaIndex(initialMediaIndex);
  }, [product.slug, initialMediaIndex]);

  const activeMedia = galleryItems[activeMediaIndex] || galleryItems[0] || {
    type: "image" as const,
    id: "default",
    url: product.images?.[0] || "",
  };

  const rawVideoUrl = activeMedia?.type === "video" ? activeMedia.url : "";
  const videoUrl = normalizeShopifyVideoUrl(rawVideoUrl);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Robust autoplay on mount or when active video switches
  useEffect(() => {
    if (activeMedia?.type !== "video") return;
    const v = videoRef.current;
    if (!v) return;
    v.defaultMuted = true;
    v.muted = true;
    v.volume = 0;
    v.playsInline = true;
    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [videoUrl, activeMedia?.type]);

  const togglePlayPause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.muted = true;
      v.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const currentVariant = product.variants?.[selectedVariantIndex] || product.variants?.[0] || {};
  const price = currentVariant.price !== undefined ? currentVariant.price : product.price;
  const mrp = currentVariant.compareAtPrice || product.mrp || price;
  const off = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const isAvailable = currentVariant.available !== undefined ? currentVariant.available : true;

  // Find category details if product has a category metafield
  const cat = getCategory(product.category?.trim().toLowerCase()) || {
    name: product.category || "Shop",
    slug: product.category || "all",
  };

  const addToCart = () => {
    if (!isAvailable) {
      toast.error("This variant is currently out of stock");
      return;
    }
    const variantTitle =
      currentVariant.title && currentVariant.title !== "Default Title"
        ? ` (${currentVariant.title})`
        : "";
    add(
      {
        slug: product.slug,
        name: `${product.name}${variantTitle}`,
        image: product.images?.[0] || activeMedia?.preview || activeMedia?.url || "",
        price,
        mrp,
        categoryName: cat.name,
        variantId: currentVariant.id || product.shopifyId,
      },
      quantity,
    );
    toast.success(`${product.name} (x${quantity}) added to cart`);
  };

  const buyNow = () => {
    addToCart();
    navigate({ to: "/cart", search: { cleared: undefined } });
  };

  const displayTitle = getCleanProductTitle(product.name);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-5 md:py-7">
        {/* Breadcrumb */}
        <nav className="text-xs tracking-wider uppercase text-muted-foreground mb-4 line-clamp-1">
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
          <span className="text-maroon-deep font-medium">{displayTitle}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Media Player / Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-gold/30 shadow-royal relative flex items-center justify-center">
              {activeMedia?.type === "video" ? (
                <div
                  className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer group select-none"
                  onClick={togglePlayPause}
                >
                  <video
                    key={videoUrl}
                    ref={videoRef}
                    poster={activeMedia.preview}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    disablePictureInPicture
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedMetadata={(e) => {
                      const v = e.currentTarget;
                      v.defaultMuted = true;
                      v.muted = true;
                      v.volume = 0;
                      v.play()
                        .then(() => setIsPlaying(true))
                        .catch(() => setIsPlaying(false));
                    }}
                    onCanPlay={(e) => {
                      const v = e.currentTarget;
                      v.defaultMuted = true;
                      v.muted = true;
                      v.volume = 0;
                      if (v.paused) {
                        v.play()
                          .then(() => setIsPlaying(true))
                          .catch(() => setIsPlaying(false));
                      }
                    }}
                    className="w-full h-full object-contain"
                  >
                    <source src={videoUrl} type="video/mp4" />
                  </video>

                  {/* Minimal subtle play overlay when paused so user can tap/click to play */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition pointer-events-none">
                      <div className="w-14 h-14 rounded-full bg-gold/90 text-maroon-deep flex items-center justify-center shadow-lg transition transform group-hover:scale-110">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>
              ) : activeMedia?.type === "external_video" ? (
                <iframe
                  src={activeMedia.url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={activeMedia?.url || product.images?.[0] || ""}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover transition-opacity duration-300 bg-cream"
                />
              )}
            </div>

            {/* Thumbnail Row */}
            {galleryItems.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {galleryItems.map((item: any, i: number) => {
                  const isVideo = item.type === "video" || item.type === "external_video";
                  const thumbUrl = isVideo ? item.preview || product.images?.[0] : item.url;

                  return (
                    <div
                      key={item.id || i}
                      onClick={() => setActiveMediaIndex(i)}
                      className={`relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:border-gold transition group ${
                        activeMediaIndex === i
                          ? "border-gold ring-2 ring-gold/40"
                          : "border-gold/20"
                      }`}
                    >
                      <img
                        src={thumbUrl || "/placeholder.jpg"}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {isVideo && (
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center group-hover:bg-black/25 transition">
                          <div className="w-7 h-7 rounded-full bg-gold text-maroon-deep flex items-center justify-center shadow-md">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-gold tracking-[0.3em] text-xs font-semibold">{cat.name.toUpperCase()}</p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-maroon-deep mt-1 leading-snug font-semibold">
              {displayTitle}
            </h1>

            <div className="flex items-center gap-2.5 mt-2">
              <ProductRating
                rating={getProductRating(slug || product.name)}
                size="md"
                showScore={false}
                className="mb-0"
              />
              <span className="text-xs sm:text-sm text-muted-foreground">
                {getProductRating(slug || product.name).toFixed(1)} · 1,284 reviews
              </span>
            </div>

            {product.description && (
              <p className="mt-3 text-xs sm:text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                {getProductSummary(product.description)}
              </p>
            )}

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cream/70 border border-gold/25 text-[11px] sm:text-xs text-maroon-deep font-medium whitespace-nowrap shadow-2xs"
                  >
                    <Icon className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
            </div>

            <div className="flex items-baseline gap-3 mt-3.5">
              <span className="font-numeric text-3xl sm:text-4xl text-maroon-deep font-bold">
                ₹{price.toLocaleString("en-IN")}
              </span>
              {mrp > price && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{mrp.toLocaleString("en-IN")}
                </span>
              )}
              {off > 0 && (
                <span className="text-xs bg-gold/20 text-maroon px-2 py-0.5 rounded tracking-wider uppercase font-medium">
                  {off}% off
                </span>
              )}
            </div>

            {/* Variant selector if multiple variants exist */}
            {product.variants && product.variants.length > 1 && (
              <div className="mt-3.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-maroon-deep block mb-1.5">
                  Select Option:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any, idx: number) => {
                    const isSelected = selectedVariantIndex === idx;
                    return (
                      <button
                        key={v.id || idx}
                        type="button"
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          isSelected
                            ? "bg-maroon-deep text-cream border-gold ring-1 ring-gold"
                            : "bg-cream/50 text-maroon-deep border-gold/30 hover:bg-cream"
                        } ${!v.available ? "opacity-60 line-through" : ""}`}
                      >
                        {v.title} · ₹{Number(v.price).toLocaleString("en-IN")}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
              <div className="flex items-center justify-between sm:justify-start gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-maroon-deep sm:hidden">
                  Quantity:
                </span>
                <div className="flex items-center border border-gold/40 rounded-lg bg-cream h-11 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 h-full text-maroon-deep hover:bg-gold/10 font-bold"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 h-full text-maroon-deep hover:bg-gold/10 font-bold"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-1 gap-2.5">
                <button
                  onClick={addToCart}
                  disabled={!isAvailable}
                  className="flex-1 h-11 bg-royal text-cream px-4 rounded-md font-medium tracking-wider text-xs uppercase hover:opacity-90 transition shadow-royal flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" /> {isAvailable ? "Add to Cart" : "Out of Stock"}
                </button>
                <button
                  onClick={buyNow}
                  disabled={!isAvailable}
                  className="flex-1 h-11 bg-gold text-maroon-deep px-4 rounded-md font-bold tracking-wider text-xs uppercase hover:bg-gold-soft transition shadow-gold disabled:opacity-50"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Details accordion-like */}
            <div className="mt-8 space-y-4">
              {product.description && (
                <div className="border-t border-gold/20 pt-4">
                  <h3 className="font-display text-lg text-maroon-deep">Product Description</h3>
                  <p className="mt-2 text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
              {product.benefits && product.benefits.length > 0 ? (
                <div className="border-t border-gold/20 pt-4">
                  <h3 className="font-display text-lg text-maroon-deep">Spiritual Benefits</h3>
                  <ul className="mt-2.5 space-y-2 text-sm text-foreground/80">
                    {product.benefits.map((benefit: string, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-gold">✦</span> {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="border-t border-gold/20 pt-4">
                  <h3 className="font-display text-lg text-maroon-deep">Spiritual Benefits</h3>
                  <ul className="mt-2.5 space-y-2 text-sm text-foreground/80">
                    <li className="flex gap-2">
                      <span className="text-gold">✦</span> Removes obstacles and negative energies
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold">✦</span> Enhances concentration and meditation
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold">✦</span> Bestows the wearer with peace and prosperity
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold">✦</span> Aligns chakras and balances energy
                    </li>
                  </ul>
                </div>
              )}

              <div className="border-t border-gold/20 pt-4">
                <h3 className="font-display text-lg text-maroon-deep">How to Wear / Use</h3>
                <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
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
