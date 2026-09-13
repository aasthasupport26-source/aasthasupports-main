import { createFileRoute, Link, notFound, redirect, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { getCategory } from "@/data/catalog";
import { useCart } from "@/contexts/CartContext";
import { getShopifyProduct, getShopifyProducts, normalizeShopifyVideoUrl } from "@/lib/shopify.functions";
import { useServerFn } from "@tanstack/react-start";
import React, { useState, useRef, useEffect, useMemo } from "react";
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
import { ProductReviews } from "@/components/ProductReviews";
import { AddToCartCrossSellModal } from "@/components/AddToCartCrossSellModal";
import { Plus, Check, ArrowRight as ArrowRightIcon } from "lucide-react";

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

  const fetchProductsFn = useServerFn(getShopifyProducts);
  const { data: allProductsData } = useQuery({
    queryKey: ["all-products-inventory"],
    queryFn: () => fetchProductsFn({ data: { category: "all", limit: 250 } }),
    staleTime: 5 * 60 * 1000,
  });

  const catalogProducts: any[] = (allProductsData as any)?.products || (Array.isArray(allProductsData) ? allProductsData : []);

  // Smart cross-sell dynamic recommendation & bundle pairing engine
  const getProductCategoryKey = (p: any): "rudraksha" | "yantra" | "bracelet" | "mala" | "gemstone" => {
    if (!p) return "rudraksha";
    const name = (p.name || p.title || "").toLowerCase();
    const type = (p.productType || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();

    // 1. Primary classification by product name & explicit category
    if (name.includes("bracelet") || cat.includes("bracelet") || type.includes("bracelet")) return "bracelet";
    if (name.includes("mala") || cat.includes("mala") || type.includes("mala")) return "mala";
    if (name.includes("yantra") || cat.includes("yantra") || type.includes("yantra") || name.includes("frame")) return "yantra";
    if (
      name.includes("gemstone") || cat.includes("gemstone") || type.includes("gemstone") ||
      name.includes("sapphire") || name.includes("pukhraj") || name.includes("ruby") || name.includes("emerald") || name.includes("carat") || name.includes("ratti")
    ) return "gemstone";
    if (name.includes("rudraksh") || cat.includes("rudraksh") || type.includes("rudraksh")) return "rudraksha";

    // 2. Secondary fallback by tags only when title does not indicate category
    const tags = (p.tags || []).map((t: string) => t.toLowerCase()).join(" ");
    if (tags.includes("bracelet")) return "bracelet";
    if (tags.includes("mala")) return "mala";
    if (tags.includes("yantra")) return "yantra";
    if (tags.includes("gemstone") || tags.includes("sapphire") || tags.includes("pukhraj")) return "gemstone";
    if (tags.includes("rudraksh")) return "rudraksha";

    return "rudraksha";
  };

  const { bundleAddons, devoteesAlsoSourced } = useMemo(() => {
    if (!catalogProducts || catalogProducts.length === 0) {
      return { bundleAddons: [], devoteesAlsoSourced: [] };
    }

    // Filter out current product & items without valid images
    const available = catalogProducts.filter(
      (p: any) => p.slug !== slug && p.image && !p.image.includes("unsplash"),
    );

    const mainCat = getProductCategoryKey(product);

    // Filter available products by category
    const availableByCategory: Record<string, any[]> = {
      yantra: available.filter((p) => getProductCategoryKey(p) === "yantra"),
      bracelet: available.filter((p) => getProductCategoryKey(p) === "bracelet"),
      mala: available.filter((p) => getProductCategoryKey(p) === "mala"),
      gemstone: available.filter((p) => getProductCategoryKey(p) === "gemstone"),
      rudraksha: available.filter((p) => getProductCategoryKey(p) === "rudraksha"),
    };

    // Pick 2 add-ons from 2 categories strictly DIFFERENT from mainCat
    const otherCategories = ["yantra", "bracelet", "mala", "gemstone", "rudraksha"].filter(
      (c) => c !== mainCat,
    );

    const pickedAddons: any[] = [];
    const usedSlugs = new Set<string>();

    for (const catTarget of otherCategories) {
      if (pickedAddons.length >= 2) break;
      const candidates = availableByCategory[catTarget] || [];
      const match = candidates.find((p) => !usedSlugs.has(p.slug));
      if (match) {
        pickedAddons.push(match);
        usedSlugs.add(match.slug);
      }
    }

    // Fallback if inventory is missing categories
    while (pickedAddons.length < 2) {
      const fallback = available.find((p: any) => !usedSlugs.has(p.slug) && getProductCategoryKey(p) !== mainCat);
      if (!fallback) {
        const absoluteFallback = available.find((p: any) => !usedSlugs.has(p.slug));
        if (!absoluteFallback) break;
        pickedAddons.push(absoluteFallback);
        usedSlugs.add(absoluteFallback.slug);
      } else {
        pickedAddons.push(fallback);
        usedSlugs.add(fallback.slug);
      }
    }

    // 2. Pick "Devotees Also Sourced" Grid (4 items from 4 DIFFERENT categories)
    const recommendedGrid: any[] = [];
    const gridCategories = ["yantra", "bracelet", "mala", "gemstone", "rudraksha"];

    for (const catTarget of gridCategories) {
      if (recommendedGrid.length >= 4) break;
      const candidates = availableByCategory[catTarget] || [];
      const match = candidates.find(
        (p) => !recommendedGrid.some((r) => r.slug === p.slug) && !usedSlugs.has(p.slug),
      );
      if (match) {
        recommendedGrid.push(match);
      }
    }

    for (const p of available) {
      if (recommendedGrid.length >= 4) break;
      if (!recommendedGrid.some((r) => r.slug === p.slug)) {
        recommendedGrid.push(p);
      }
    }

    return {
      bundleAddons: pickedAddons,
      devoteesAlsoSourced: recommendedGrid,
    };
  }, [catalogProducts, product, slug]);

  const [selectedAddonSlugs, setSelectedAddonSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (bundleAddons.length > 0) {
      setSelectedAddonSlugs(bundleAddons.map((a) => a.slug));
    }
  }, [bundleAddons]);

  const toggleAddon = (addonSlug: string) => {
    setSelectedAddonSlugs((prev) =>
      prev.includes(addonSlug) ? prev.filter((s) => s !== addonSlug) : [...prev, addonSlug],
    );
  };

  if (!product) {
    if (typeof window !== "undefined") {
      window.location.replace("/");
    }
    throw redirect({ to: "/" });
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

  // Determine if this is a single Rudraksha bead (not a mala or bracelet)
  const isRudraksha = useMemo(() => {
    if (!product) return false;
    const name = (product.name || product.title || "").toLowerCase();
    const catName = (product.category || "").toLowerCase();
    const isBead = !name.includes("mala") && !name.includes("bracelet");
    const isRudrakshaItem =
      name.includes("rudraksh") ||
      catName.includes("rudraksh") ||
      (product.tags || []).some((t: string) => t.toLowerCase().includes("rudraksh")) ||
      getProductCategoryKey(product) === "rudraksha";

    return isRudrakshaItem && isBead;
  }, [product]);

  const [pendantOption, setPendantOption] = useState<"without" | "with">("without");

  // Detect if any gallery image exhibits a pendant or capping
  const pendantImageIndex = useMemo(() => {
    if (!galleryItems || galleryItems.length === 0) return -1;
    return galleryItems.findIndex((item: any) => {
      const url = (item.url || item.preview || "").toLowerCase();
      const alt = (item.alt || "").toLowerCase();
      return (
        url.includes("pendant") ||
        url.includes("capping") ||
        url.includes("silver") ||
        url.includes("locket") ||
        alt.includes("pendant") ||
        alt.includes("capping") ||
        alt.includes("silver") ||
        alt.includes("locket")
      );
    });
  }, [galleryItems]);

  const handlePendantOptionChange = (option: "without" | "with") => {
    setPendantOption(option);
    if (option === "with") {
      if (pendantImageIndex !== -1) {
        setActiveMediaIndex(pendantImageIndex);
      }
    } else {
      setActiveMediaIndex(0);
    }
  };

  const currentVariant = product.variants?.[selectedVariantIndex] || product.variants?.[0] || {};
  const basePrice = currentVariant.price !== undefined ? currentVariant.price : product.price;
  const baseMrp = currentVariant.compareAtPrice || product.mrp || basePrice;
  const isWithPendant = isRudraksha && pendantOption === "with";
  const price = isWithPendant ? basePrice + 700 : basePrice;
  const mrp = isWithPendant ? baseMrp + 700 : baseMrp;
  const off = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const isAvailable = currentVariant.available !== undefined ? currentVariant.available : true;

  // Find category details if product has a category metafield
  const cat = getCategory(product.category?.trim().toLowerCase()) || {
    name: product.category || "Shop",
    slug: product.category || "all",
  };

  const [crossSellOpen, setCrossSellOpen] = useState(false);

  const addToCart = () => {
    if (!isAvailable) {
      toast.error("This variant is currently out of stock");
      return;
    }
    const variantTitle =
      currentVariant.title && currentVariant.title !== "Default Title"
        ? ` (${currentVariant.title})`
        : "";
    
    const pendantSuffix = isWithPendant ? " (With Pure Silver Pendant Capping)" : "";
    const cartItemId = isWithPendant
      ? `${currentVariant.id || product.shopifyId}-pendant`
      : currentVariant.id || product.shopifyId;

    const attributes = isRudraksha
      ? [
          {
            key: "Pendant",
            value: isWithPendant
              ? "With Pure Silver Pendant Capping (+₹700)"
              : "Without Pendant (Only Bead)",
          },
        ]
      : undefined;

    add(
      {
        cartItemId,
        slug: product.slug,
        name: `${product.name}${variantTitle}${pendantSuffix}`,
        image:
          (isWithPendant && pendantImageIndex !== -1 ? galleryItems[pendantImageIndex]?.url : null) ||
          product.images?.[0] ||
          activeMedia?.preview ||
          activeMedia?.url ||
          "",
        price,
        mrp,
        categoryName: cat.name,
        variantId: currentVariant.id || product.shopifyId,
        attributes,
      },
      quantity,
    );
    toast.success(
      `${product.name}${isWithPendant ? " (With Silver Pendant)" : ""} (x${quantity}) added to cart`,
    );
    setCrossSellOpen(true);
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

            {/* Rudraksha Wearing Format (With / Without Silver Pendant) */}
            {isRudraksha && (
              <div className="mt-4 p-3.5 rounded-xl border border-gold/40 bg-cream/70">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-maroon-deep flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    Select Wearing Format:
                  </span>
                  {pendantOption === "with" && (
                    <span className="text-[11px] font-medium text-maroon-deep bg-gold/20 px-2 py-0.5 rounded border border-gold/30">
                      +₹700 Pure Silver Capping
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handlePendantOptionChange("without")}
                    className={`p-3 rounded-lg border text-left transition flex items-start justify-between cursor-pointer ${
                      pendantOption === "without"
                        ? "bg-maroon-deep text-cream border-gold ring-1 ring-gold shadow-xs"
                        : "bg-white text-maroon-deep border-gold/30 hover:bg-gold/5"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            pendantOption === "without"
                              ? "border-gold bg-gold"
                              : "border-maroon-deep/40 bg-white"
                          }`}
                        >
                          {pendantOption === "without" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-maroon-deep" />
                          )}
                        </span>
                        <p className="text-xs font-bold tracking-wide">Without Pendant</p>
                      </div>
                      <p
                        className={`text-[11px] mt-1 pl-5.5 ${
                          pendantOption === "without" ? "text-cream/80" : "text-muted-foreground"
                        }`}
                      >
                        Natural Sacred Bead Only
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        pendantOption === "without"
                          ? "bg-gold/20 text-gold-soft border border-gold/30"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      Base Price
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePendantOptionChange("with")}
                    className={`p-3 rounded-lg border text-left transition flex items-start justify-between cursor-pointer ${
                      pendantOption === "with"
                        ? "bg-maroon-deep text-cream border-gold ring-1 ring-gold shadow-xs"
                        : "bg-white text-maroon-deep border-gold/30 hover:bg-gold/5"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            pendantOption === "with"
                              ? "border-gold bg-gold"
                              : "border-maroon-deep/40 bg-white"
                          }`}
                        >
                          {pendantOption === "with" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-maroon-deep" />
                          )}
                        </span>
                        <p className="text-xs font-bold tracking-wide">With Pure Silver Pendant</p>
                      </div>
                      <p
                        className={`text-[11px] mt-1 pl-5.5 ${
                          pendantOption === "with" ? "text-cream/80" : "text-muted-foreground"
                        }`}
                      >
                        Handcrafted 925 Silver Capping
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        pendantOption === "with"
                          ? "bg-gold text-maroon-deep font-bold"
                          : "bg-gold/15 text-maroon-deep border border-gold/30"
                      }`}
                    >
                      +₹700
                    </span>
                  </button>
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

        {/* Frequently Bought Together Bundle Cross-Sell */}
        {bundleAddons.length > 0 && (() => {
          const selectedAddons = bundleAddons.filter((a) => selectedAddonSlugs.includes(a.slug));
          const activeBundleItemsCount = 1 + selectedAddons.length;
          const addonsTotalPrice = selectedAddons.reduce((acc, item) => acc + (item.price || 0), 0);
          const rawBundleTotal = price + addonsTotalPrice;
          const bundleDiscount = selectedAddons.length >= 1 ? Math.min(250, Math.round(rawBundleTotal * 0.08)) : 0;
          const finalBundlePrice = rawBundleTotal - bundleDiscount;

          const handleAddBundleToCart = () => {
            add(
              {
                slug: product.slug,
                name: `${product.name}${currentVariant.title && currentVariant.title !== "Default Title" ? ` (${currentVariant.title})` : ""}`,
                image: product.images?.[0] || activeMedia?.preview || activeMedia?.url || "",
                price,
                mrp,
                categoryName: cat.name,
                variantId: currentVariant.id || product.shopifyId,
              },
              quantity,
            );

            selectedAddons.forEach((addon) => {
              add(
                {
                  slug: addon.slug,
                  name: addon.name,
                  image: addon.image,
                  price: addon.price,
                  mrp: addon.mrp || addon.price,
                  categoryName: addon.category || addon.productType || "Spiritual",
                  variantId: addon.variantId || addon.shopifyId,
                },
                1,
              );
            });

            toast.success(`Added Divine Bundle (${activeBundleItemsCount} items) to your cart!`);
            setCrossSellOpen(true);
          };

          return (
            <section className="mt-12 p-6 sm:p-8 bg-cream/70 border-2 border-gold/30 rounded-3xl shadow-soft relative overflow-hidden">
              {/* Section Top Header with Prominent SAVE Feature */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b border-gold/20">
                <div>
                  <span className="text-gold tracking-[0.25em] text-xs font-extrabold uppercase flex items-center gap-1.5">
                    ✦ FREQUENTLY BOUGHT TOGETHER ✦
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-maroon-deep mt-1">
                    Recommended Divine Pairing Bundle
                  </h2>
                </div>

                {/* BIG PROMINENT SAVINGS BADGE */}
                {bundleDiscount > 0 && (
                  <div className="inline-flex items-center gap-2 bg-emerald-700 text-white px-4 py-2.5 rounded-2xl shadow-md border border-emerald-500/40 shrink-0 self-start md:self-auto">
                    <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 animate-spin shrink-0" style={{ animationDuration: "6s" }} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest leading-none">
                        Bundle Special Deal
                      </span>
                      <span className="text-base sm:text-lg font-extrabold tracking-wide leading-tight text-white">
                        SAVE ₹{bundleDiscount.toLocaleString("en-IN")} INSTANTLY
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3 Product Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-6">
                {/* Item 1: Main Product Card */}
                <div className="bg-white p-4.5 rounded-2xl border-2 border-gold/40 shadow-xs flex items-start gap-3.5 relative">
                  <div className="pt-1 shrink-0">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled={true}
                      className="w-5 h-5 accent-gold cursor-not-allowed rounded-md"
                    />
                  </div>
                  <img
                    src={product.images?.[0] || activeMedia?.preview || activeMedia?.url || "/placeholder.jpg"}
                    alt={displayTitle}
                    className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl border border-gold/25 shrink-0 bg-cream/30"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="inline-block text-[10px] font-extrabold uppercase text-gold bg-gold/15 px-2 py-0.5 rounded-md tracking-wider mb-1">
                      This Item
                    </span>
                    <h4 className="text-sm font-bold text-maroon-deep line-clamp-2 leading-snug">
                      {displayTitle}
                    </h4>
                    <p className="text-sm font-numeric font-extrabold text-maroon-deep mt-1.5">
                      ₹{price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Add-on Item Cards 2 & 3 */}
                {bundleAddons.map((addon) => {
                  const isChecked = selectedAddonSlugs.includes(addon.slug);
                  const catLabel = getProductCategoryKey(addon).toUpperCase();
                  return (
                    <div
                      key={addon.slug}
                      onClick={() => toggleAddon(addon.slug)}
                      className={`p-4.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-3.5 ${
                        isChecked
                          ? "bg-white border-gold/60 shadow-xs ring-2 ring-gold/20"
                          : "bg-white/60 border-gray-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="pt-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddon(addon.slug)}
                          className="w-5 h-5 accent-gold cursor-pointer rounded-md"
                        />
                      </div>
                      <img
                        src={addon.image}
                        alt={addon.name}
                        className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl border border-gold/25 shrink-0 bg-cream/30"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="inline-block text-[10px] font-extrabold uppercase text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md tracking-wider mb-1">
                          {catLabel}
                        </span>
                        <h4 className="text-sm font-bold text-maroon-deep line-clamp-2 leading-snug">
                          {addon.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className="text-sm font-numeric font-extrabold text-maroon-deep">
                            ₹{addon.price?.toLocaleString("en-IN")}
                          </span>
                          {addon.mrp && addon.mrp > addon.price && (
                            <span className="text-xs text-muted-foreground line-through font-numeric">
                              ₹{addon.mrp?.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clean, Un-Cluttered Bottom Summary & Multi-Item CTA Banner */}
              <div className="bg-maroon-deep text-cream p-5 sm:p-6 rounded-2xl border-2 border-gold/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gold font-bold">
                      Bundle Total ({activeBundleItemsCount} Selected Items)
                    </p>
                    <div className="flex items-baseline justify-center sm:justify-start gap-3 mt-1">
                      <span className="font-numeric text-3xl sm:text-4xl font-extrabold text-gold">
                        ₹{finalBundlePrice.toLocaleString("en-IN")}
                      </span>
                      {bundleDiscount > 0 && (
                        <span className="text-base text-cream/60 line-through font-numeric">
                          ₹{rawBundleTotal.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                  {bundleDiscount > 0 && (
                    <div className="hidden lg:flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wide">
                      <Sparkles className="w-4 h-4 fill-emerald-300" /> Save ₹{bundleDiscount} Discount Applied
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAddBundleToCart}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gold hover:bg-gold-soft text-maroon-deep font-extrabold rounded-xl text-sm uppercase tracking-wider transition-all duration-200 shadow-lg hover:scale-102 active:scale-98 flex items-center justify-center gap-2.5 shrink-0"
                >
                  <ShoppingBag className="w-5 h-5" /> Add Selected ({activeBundleItemsCount}) to Cart
                </button>
              </div>
            </section>
          );
        })()}

        {/* Recommended Divine Pairings Grid ("Devotees Also Sourced") */}
        {devoteesAlsoSourced.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-gold tracking-[0.3em] text-[10px] font-extrabold uppercase">
                  ✦ YOU MAY ALSO LIKE ✦
                </span>
                <h2 className="font-display text-2xl font-bold text-maroon-deep mt-0.5">
                  Devotees Also Sourced
                </h2>
              </div>
              <Link
                to="/shop"
                className="text-xs font-semibold text-maroon hover:text-gold tracking-wider uppercase flex items-center gap-1"
              >
                Explore All <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {devoteesAlsoSourced.map((rec) => (
                <Link
                  key={rec.slug}
                  to="/product/$slug"
                  params={{ slug: rec.slug }}
                  className="bg-white rounded-xl overflow-hidden border border-gold/20 shadow-2xs hover:shadow-soft hover:border-gold/50 transition duration-300 flex flex-col group"
                >
                  <div className="aspect-square bg-cream overflow-hidden relative">
                    <img
                      src={rec.image}
                      alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <span className="text-[10px] text-gold uppercase tracking-wider font-semibold">
                      {rec.category || rec.productType || "Spiritual"}
                    </span>
                    <h4 className="font-display font-bold text-xs text-maroon-deep line-clamp-2 mt-0.5 group-hover:text-maroon">
                      {rec.name}
                    </h4>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="font-numeric text-xs font-bold text-maroon-deep">
                        ₹{rec.price?.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] font-semibold text-gold uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Customer Reviews Section */}
        <ProductReviews
          productName={displayTitle}
          categorySlug={product.category || cat.slug}
        />

        {/* Post Add-To-Cart Cross-Sell Slide Drawer Modal */}
        <AddToCartCrossSellModal
          isOpen={crossSellOpen}
          onClose={() => setCrossSellOpen(false)}
          addedProduct={{
            name: displayTitle,
            image: product.images?.[0] || activeMedia?.preview || activeMedia?.url || "",
            price,
          }}
        />
      </div>
    </Layout>
  );
}
