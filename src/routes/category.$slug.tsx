import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { categories, getCategory } from "@/data/catalog";
import {
  NAVRATNA_GEMSTONES,
  getGemstoneById,
  matchGemstoneForProduct,
  type NavratnaGemstone,
} from "@/data/gemstones";
import { getShopifyProducts, normalizeShopifyVideoUrl } from "@/lib/shopify.functions";
import { getTemples, getPujasByTemple } from "@/lib/booking.functions";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Users,
  ArrowRight,
  ShieldCheck,
  Video,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { DirectBookingModal } from "@/components/booking/DirectBookingModal";
import { toast } from "sonner";
import { submitContactForm } from "@/lib/contact.functions";
import {
  getShortProductName,
  getProductRating,
  getProductCardDescription,
} from "@/lib/product-display";
import { ProductRating } from "@/components/ProductRating";

export const Route = createFileRoute("/category/$slug")({
  validateSearch: (search: Record<string, unknown>): { type?: string } => ({
    type: typeof search.type === "string" ? search.type : undefined,
  }),
  loader: ({ params }) => {
    const slug = (params.slug || "").toLowerCase().trim();
    const validSlugs = [
      "rudraksha",
      "mala",
      "bracelets",
      "gemstones",
      "yantra",
      "online-pooja",
      "pooja",
      "puja",
      "diwali-hamper",
      "diwali",
    ];
    const isValid =
      validSlugs.includes(slug) || slug === "all" || !!categories.find((c) => c.slug === slug);

    if (!isValid || slug.includes("ethnic") || slug.includes("wear")) {
      // Unknown categories get a real 404 so bad links surface instead of
      // silently bouncing to the homepage.
      throw notFound();
    }

    const cat = getCategory(params.slug);
    return {
      cat: cat || { slug: params.slug, name: params.slug, tagline: "", hero: "", sections: [] },
    };
  },
  head: ({ params, loaderData }) => {
    const title = `${loaderData?.cat.name ?? "Category"} — Aastha Supports`;
    const desc = loaderData?.cat.tagline ?? "";
    const url = `https://www.aasthasupports.com/category/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:image", content: "https://www.aasthasupports.com/og-image.jpg" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <Layout>
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-4xl text-maroon-deep">Category not found</h1>
        <Link to="/" className="text-gold mt-4 inline-block">
          ← Back home
        </Link>
      </div>
    </Layout>
  ),
});

// ─── Main Component ─────────────────────────────────────────────
function CategoryPage() {
  const { cat } = Route.useLoaderData();
  const search = Route.useSearch();

  if (cat.slug === "online-pooja") {
    return <OnlinePoojaPage cat={cat} />;
  }
  return <ShopifyProductsPage cat={cat} initialType={search.type} />;
}

// ─── Shopify products page (non-pooja categories) ────────────────
function ShopifyProductsPage({ cat, initialType }: { cat: any; initialType?: string }) {
  const navigate = useNavigate();
  const fetchProducts = useServerFn(getShopifyProducts);
  const [products, setProducts] = useState<any[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGemId, setSelectedGemId] = useState<string>(initialType || "all");

  useEffect(() => {
    if (initialType) {
      setSelectedGemId(initialType);
    }
  }, [initialType]);

  const handleSelectGem = (id: string) => {
    setSelectedGemId(id);
    navigate({
      to: "/category/$slug",
      params: { slug: "gemstones" },
      search: { type: id === "all" ? undefined : id },
      replace: true,
      resetScroll: false,
    });
  };

  useEffect(() => {
    const requests = [fetchProducts({ data: { category: cat.slug, limit: 250 } })];
    if (cat.slug === "gemstones") {
      requests.push(fetchProducts({ data: { category: "all", limit: 250 } }));
    }

    Promise.all(requests)
      .then(([categoryData, inventoryData]) => {
        setProducts(categoryData?.products || []);
        setInventoryProducts(inventoryData?.products || []);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        toast.error("Failed to load products");
      })
      .finally(() => setLoading(false));
  }, [cat.slug]);

  const displayProducts =
    cat.slug === "rudraksha"
      ? products.filter((item: any) => {
          const searchable =
            `${item.name} ${item.category || ""} ${item.productType || ""}`.toLowerCase();
          return !searchable.includes("mala");
        })
      : products;

  const gemstoneNames = [
    "ruby",
    "manik",
    "pearl",
    "moti",
    "coral",
    "moonga",
    "emerald",
    "panna",
    "sapphire",
    "neelam",
    "pukhraj",
    "topaz",
    "opal",
    "amethyst",
    "garnet",
    "navratna",
  ];
  const inventoryGemstones = inventoryProducts.filter((product: any) => {
    const searchable =
      `${product.name} ${product.category || ""} ${product.productType || ""} ${(product.tags || []).join(" ")}`.toLowerCase();
    return (
      gemstoneNames.some((name) => searchable.includes(name)) && !searchable.includes("bracelet")
    );
  });
  const productsForDisplay =
    cat.slug === "gemstones" && displayProducts.length === 0 ? inventoryGemstones : displayProducts;
  const gemstoneImages = new Map(
    inventoryGemstones.flatMap((product: any) => {
      const searchable = product.name.toLowerCase();
      return gemstoneNames
        .filter((name) => searchable.includes(name))
        .map((name) => [name, product.image]);
    }),
  );

  const groupedProducts = productsForDisplay.reduce((acc: any, item: any) => {
    let catName = (item.category || cat.name).trim().replace(/\s+/g, " ");
    catName = catName.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());

    // Smart grouping based on page slug and titles to match mega-menu expectations
    if (cat.slug === "rudraksha") {
      const name = item.name.toLowerCase();
      if (name.includes("nepali")) catName = "Nepali Rudraksha";
      else if (name.includes("indonesian") || name.includes("indo"))
        catName = "Indonesian Rudraksha";
      else if (name.includes("indian")) catName = "Indian Rudraksha";
      else catName = "Indonesian Rudraksha";
    } else if (cat.slug === "mala") {
      if (item.name.toLowerCase().includes("rudraksha")) catName = "Rudraksha Malas";
      else catName = "Premium Malas";
    }

    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(item);
    return acc;
  }, {});

  return (
    <Layout>
      <section
        className={`relative w-full overflow-hidden flex items-center ${
          cat.slug === "gemstones"
            ? "bg-[#1a0205] aspect-[2.4/1] sm:aspect-[2.8/1] md:aspect-[3/1] max-h-[380px]"
            : "bg-cream aspect-[3/1]"
        }`}
      >
        <img
          src={cat.hero}
          alt={cat.name}
          width={1920}
          height={800}
          className={`absolute inset-0 w-full h-full ${
            cat.slug === "gemstones"
              ? "object-cover sm:object-contain object-center"
              : "object-contain"
          }`}
        />
      </section>

      {cat.slug === "gemstones" ? (
        <NavratnaGemstoneSection
          products={productsForDisplay}
          selectedGemId={selectedGemId}
          onSelectGem={handleSelectGem}
          loading={loading}
        />
      ) : loading ? (
        <section className="py-16 bg-cream">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="w-24 h-3 bg-gold/20 rounded mb-4 animate-pulse" />
                <div className="w-64 h-10 bg-maroon-deep/10 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gold/10 p-4 animate-pulse"
                >
                  <div className="aspect-square bg-cream rounded-lg mb-4" />
                  <div className="w-20 h-3 bg-gold/20 rounded mb-3" />
                  <div className="w-full h-5 bg-maroon-deep/10 rounded mb-2" />
                  <div className="w-2/3 h-5 bg-maroon-deep/10 rounded mb-4" />
                  <div className="w-16 h-5 bg-maroon-deep/20 rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : productsForDisplay.length === 0 ? (
        <section className="py-16 bg-cream">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-white rounded-xl border border-gold/10 p-12 shadow-sm max-w-md mx-auto">
              <p className="text-muted-foreground">
                No products available in this category currently.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16 bg-cream">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-3">
              <div>
                <p className="text-gold tracking-[0.3em] text-xs">{cat.name.toUpperCase()}</p>
                <h2 className="font-display text-3xl md:text-4xl text-maroon-deep mt-2">
                  Explore Collection
                </h2>
              </div>
              <div className="divider-gold flex-1 max-w-xs ml-6 mb-2" />
            </div>

            {Object.entries(groupedProducts).map(
              ([sectionTitle, sectionProducts]: [string, any]) => (
                <div key={sectionTitle} className="mb-14">
                  <h3 className="font-display text-2xl text-maroon-deep mb-6 pb-2 border-b border-gold/20 inline-block">
                    {sectionTitle}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {sectionProducts.map((item: any) => (
                      <GemstoneProductCard key={item.slug} item={item} />
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      )}
    </Layout>
  );
}

// ─── Navratna 9 Gemstones Sanctuary Section ─────────────────────
function NavratnaGemstoneSection({
  products,
  selectedGemId,
  onSelectGem,
  loading = false,
}: {
  products: any[];
  selectedGemId: string;
  onSelectGem: (id: string) => void;
  loading?: boolean;
}) {
  const activeGem =
    NAVRATNA_GEMSTONES.find((g) => g.id === selectedGemId) ||
    (selectedGemId !== "all" ? getGemstoneById(selectedGemId) : null);

  const filteredProducts = activeGem
    ? products.filter((p: any) => {
        const matched = matchGemstoneForProduct(p);
        if (matched && matched.id === activeGem.id) return true;
        const text = `${p.name} ${p.productType || ""} ${(p.tags || []).join(" ")}`.toLowerCase();
        return activeGem.matchKeywords.some((kw) => text.includes(kw));
      })
    : products;

  return (
    <section className="py-10 md:py-16 bg-cream">
      <div className="container mx-auto px-4">
        {/* Navratna Sanctuary Heading */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/15 text-maroon-deep text-xs font-bold uppercase tracking-widest mb-3 border border-gold/30">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Navratna Astrological Sanctuary</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-maroon-deep font-bold">
            All 9 Sacred Vedic Gemstones
          </h2>
          <div className="divider-gold w-28 mx-auto mt-4 mb-3" />
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed">
            According to the Vedic Garuda Purana, the Navratnas channel the cosmic energies of the
            nine planets (Navagraha). Click any gemstone below to reveal its authentic certified
            specimens, sacred Beej Mantra, astrological benefits, and wearing vidhi.
          </p>
        </div>

        {/* 9 Gemstones Category Navigation Tabs */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 scrollbar-none sm:grid sm:grid-cols-5 lg:grid-cols-10 sm:overflow-visible">
            {/* All Gems tab */}
            <button
              type="button"
              onClick={() => onSelectGem("all")}
              className={`flex-shrink-0 min-w-[120px] sm:min-w-0 flex sm:flex-col items-center justify-center gap-2 p-2.5 sm:p-3 rounded-2xl border text-xs font-semibold transition-all duration-300 text-left sm:text-center cursor-pointer ${
                selectedGemId === "all"
                  ? "bg-maroon-deep text-cream border-gold shadow-royal ring-2 ring-gold"
                  : "bg-white text-maroon-deep border-gold/25 hover:border-gold hover:bg-gold/5 shadow-xs"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-base font-bold text-gold flex-shrink-0">
                ✦
              </div>
              <div className="min-w-0 truncate">
                <p className="font-bold truncate text-[11px] sm:text-xs">All 9 Gems</p>
                <p className={`text-[10px] truncate ${selectedGemId === "all" ? "text-gold-soft" : "text-muted-foreground"}`}>
                  Navratna
                </p>
              </div>
            </button>

            {/* The 9 Gemstone Buttons */}
            {NAVRATNA_GEMSTONES.map((gem) => {
              const isSelected = selectedGemId === gem.id;
              return (
                <button
                  key={gem.id}
                  type="button"
                  onClick={() => onSelectGem(gem.id)}
                  className={`flex-shrink-0 min-w-[120px] sm:min-w-0 flex sm:flex-col items-center justify-center gap-2 p-2.5 sm:p-3 rounded-2xl border text-xs font-semibold transition-all duration-300 text-left sm:text-center group cursor-pointer ${
                    isSelected
                      ? "bg-maroon-deep text-cream border-gold shadow-royal ring-2 ring-gold"
                      : "bg-white text-maroon-deep border-gold/25 hover:border-gold hover:bg-gold/5 shadow-xs"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-gold/30 shadow-xs bg-black/30">
                    <img
                      src={gem.image}
                      alt={gem.name}
                      className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500"
                    />
                  </div>
                  <div className="min-w-0 truncate">
                    <p className="font-bold truncate text-[11px] sm:text-xs">
                      {gem.name}{" "}
                      <span className="font-devanagari text-[10px] text-gold font-normal">
                        ({gem.hindiName})
                      </span>
                    </p>
                    <p
                      className={`text-[10px] truncate ${
                        isSelected ? "text-gold-soft" : "text-muted-foreground"
                      }`}
                    >
                      {gem.planet.split(" ")[0]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Gemstone Spotlight Banner */}
        {activeGem ? (
          <div className="mb-14 bg-gradient-to-br from-maroon-deep via-[#400B14] to-maroon-deep rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-gold/40 shadow-royal text-cream relative overflow-hidden animate-fade-up">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-maroon/30 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
              {/* Left Column: Gemstone Image & Badges (Clean, Unobscured) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative group w-full max-w-sm aspect-square rounded-2xl overflow-hidden border-2 border-gold/50 shadow-2xl bg-black/40">
                  <img
                    src={activeGem.image}
                    alt={`${activeGem.name} (${activeGem.hindiName}) natural certified gemstone`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    width={500}
                    height={500}
                  />
                </div>

                {/* Badges placed below the image cleanly - NO OVERLAYS ON TOP OF GEMSTONE */}
                <div className="w-full max-w-sm flex items-center justify-between gap-2 mt-3 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold font-bold border border-gold/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>100% Lab Certified</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-cream/90 font-medium border border-white/15">
                    Unheated &amp; Natural
                  </span>
                </div>

                {/* Quick specs pill grid */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-sm mt-3 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white/10 border border-gold/20">
                    <span className="text-gold block font-semibold">Ruler (Graha)</span>
                    <span className="text-cream/90 font-medium">{activeGem.planet}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 border border-gold/20">
                    <span className="text-gold block font-semibold">Element</span>
                    <span className="text-cream/90 font-medium">{activeGem.element}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 border border-gold/20">
                    <span className="text-gold block font-semibold">Chakra</span>
                    <span className="text-cream/90 font-medium">{activeGem.chakra}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 border border-gold/20">
                    <span className="text-gold block font-semibold">Wear On</span>
                    <span className="text-cream/90 font-medium">
                      {activeGem.auspiciousDay.split(" ")[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Mantra, Details, Benefits, CTAs */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold text-xs font-semibold tracking-wider uppercase mb-3">
                    <span>{activeGem.sanskritName}</span>
                    <span>·</span>
                    <span className="font-devanagari">{activeGem.planetHindi}</span>
                  </div>

                  {/* Sacred Mantra Box */}
                  <div className="p-4 rounded-2xl bg-black/30 border border-gold/30 mb-4 backdrop-blur-xs">
                    <p className="text-[10px] text-gold tracking-widest uppercase font-semibold">
                      Sacred Beej Mantra for Pran Pratishtha
                    </p>
                    <p className="font-devanagari text-gold-soft text-xl sm:text-2xl font-bold mt-1 tracking-wide">
                      {activeGem.mantra}
                    </p>
                  </div>

                  <h3 className="font-display text-3xl sm:text-4xl text-cream font-bold">
                    {activeGem.name}{" "}
                    <span className="text-gold font-devanagari font-normal">
                      ({activeGem.hindiName})
                    </span>
                  </h3>
                  <p className="text-gold-soft text-sm sm:text-base font-medium mt-1">
                    {activeGem.tagline}
                  </p>
                </div>

                <p className="text-cream/85 text-xs sm:text-sm leading-relaxed">{activeGem.desc}</p>

                {/* Benefits */}
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-gold uppercase tracking-wider font-bold">
                    Key Astrological Powers &amp; Vedic Blessings:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {activeGem.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-cream/90">
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Finger & Metal Vidhi */}
                <div className="p-3 rounded-xl bg-white/5 border border-gold/20 text-xs text-cream/80">
                  <span className="text-gold font-bold">Vedic Wearing Guidance: </span>
                  <span>
                    Wear on {activeGem.finger} on {activeGem.auspiciousDay}.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById("gemstone-products")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-2 bg-gold text-maroon-deep px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gold-soft transition shadow-gold cursor-pointer"
                  >
                    View Listed Products ({filteredProducts.length}){" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href="tel:+918287670827"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-cream px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase border border-gold/30 transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> Consult Pandit Ji for Kundali
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* All 9 Gems Overview Banner */
          <div className="mb-14 bg-gradient-to-r from-maroon-deep via-[#3a0813] to-maroon-deep rounded-3xl p-6 sm:p-8 md:p-10 border border-gold/30 shadow-royal text-cream text-center relative overflow-hidden">
            <div className="max-w-4xl mx-auto space-y-5">
              <p className="font-devanagari text-gold-soft text-xl">
                || ॐ नवग्रह देवताभ्यो नमः ||
              </p>
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl text-cream font-bold">
                The Nine Cosmic Powers of Navratna
              </h3>
              <p className="text-cream/80 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
                Navratnas are the nine celestial gemstones that harmonize the influence of the nine
                astrological Grahas. Click any individual gemstone from the category bar above to
                view its dedicated high-resolution studio specimen, ruling planetary mantra, and
                available certified cuts.
              </p>

              {/* Interactive 9 Gemstones Visual Grid inside Overview */}
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5 pt-3">
                {NAVRATNA_GEMSTONES.map((gem) => (
                  <button
                    key={gem.id}
                    type="button"
                    onClick={() => onSelectGem(gem.id)}
                    className="group bg-white/10 hover:bg-white/20 border border-gold/30 hover:border-gold rounded-xl p-2 transition-all duration-300 flex flex-col items-center text-center cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/40 border border-gold/30 mb-1.5 shadow-xs">
                      <img
                        src={gem.image}
                        alt={gem.name}
                        className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-cream group-hover:text-gold transition truncate max-w-full">
                      {gem.name}
                    </span>
                    <span className="text-[10px] text-gold-soft font-devanagari">
                      {gem.hindiName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Revealed Products Section */}
        <div id="gemstone-products" className="scroll-mt-24">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3 pb-3 border-b border-gold/20">
            <div>
              <p className="text-gold tracking-[0.3em] text-xs font-bold uppercase">
                {activeGem ? `${activeGem.name} Collection` : "All Navratna Gemstones"}
              </p>
              <h3 className="font-display text-2xl sm:text-3xl text-maroon-deep font-bold mt-1">
                {activeGem
                  ? `Certified Natural ${activeGem.name} (${activeGem.hindiName})`
                  : "All Available Certified Gemstones"}
              </h3>
            </div>
            <div className="text-xs text-muted-foreground">
              {loading
                ? "Checking treasury inventory..."
                : `Showing ${filteredProducts.length} verified specimen${filteredProducts.length === 1 ? "" : "s"}`}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gold/10 p-4 animate-pulse"
                >
                  <div className="aspect-square bg-cream rounded-lg mb-4" />
                  <div className="w-20 h-3 bg-gold/20 rounded mb-3" />
                  <div className="w-full h-5 bg-maroon-deep/10 rounded mb-2" />
                  <div className="w-16 h-5 bg-maroon-deep/20 rounded" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((item: any) => (
                <GemstoneProductCard key={item.slug} item={item} />
              ))}
            </div>
          ) : (
            /* Custom certified specimen order card if not in Shopify stock */
            <div className="bg-white rounded-2xl border border-gold/30 p-8 sm:p-12 text-center shadow-soft max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto mb-4 text-2xl">
                💎
              </div>
              <h4 className="font-display text-2xl text-maroon-deep font-bold mb-2">
                Custom Natural {activeGem?.name || "Gemstone"} ({activeGem?.hindiName || ""})
                Available on Request
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto mb-6">
                Our Vedic treasury carries unheated, natural {activeGem?.name} specimens in all
                weights from 2.00 to 12.00+ Ratti. Every specimen is certified by government
                gemological laboratories and energised with personal Gotra Sankalp.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="tel:+918287670827"
                  className="inline-flex items-center gap-2 bg-maroon-deep text-cream px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-maroon transition shadow-md"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Pandit Ji (+91 82876 70827)
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-gold text-maroon-deep px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gold-soft transition shadow-gold"
                >
                  Send Inquiry Form
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function GemstoneProductCard({ item }: { item: any }) {
  const rating = getProductRating(item.slug || item.name);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardVideoUrl = normalizeShopifyVideoUrl(item.video?.url || "");
  const hasVideo = Boolean(cardVideoUrl && item.video?.mimeType !== "video/external");

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      if (videoRef.current.readyState > 0) {
        videoRef.current.currentTime = 0;
      }
    }
  };

  return (
    <Link
      to="/product/$slug"
      params={{ slug: item.slug }}
      title={item.name}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group bg-white rounded-xl overflow-hidden border border-gold/20 shadow-soft hover:shadow-royal transition flex flex-col"
    >
      <div className="aspect-square overflow-hidden bg-cream relative">
        {hasVideo ? (
          <video
            ref={videoRef}
            poster={item.image}
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
          >
            <source src={cardVideoUrl} type="video/mp4" />
          </video>
        ) : (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <ProductRating rating={rating} />
        <h3 className="font-display text-lg font-semibold text-maroon-deep group-hover:text-maroon leading-tight">
          {getShortProductName(item.name, item)}
        </h3>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {getProductCardDescription(item.description)}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gold/15">
          <span className="text-maroon font-medium">₹{item.price.toLocaleString("en-IN")}</span>
          <span className="text-[10px] tracking-widest uppercase text-gold">View</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Online Pooja page — Coming Soon ─────────────────────────

function OnlinePoojaPage({ cat }: { cat: any }) {
  const [notifyContact, setNotifyContact] = useState("");
  const [notified, setNotified] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const submitContact = useServerFn(submitContactForm);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    const contact = notifyContact.trim();
    if (!contact) return;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    if (!isEmail) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setNotifying(true);
    try {
      await submitContact({
        data: {
          name: contact.split("@")[0].slice(0, 40) || "Notify Me Lead",
          email: contact,
          message: `Notify-me request: please inform me when Online Pooja services launch (${cat?.name || "Online Pooja"}).`,
        },
      });
      setNotified(true);
      toast.success("Namaste! We will notify you as soon as Online Pooja services launch.");
    } catch {
      toast.error("Could not save your request. Please contact us on WhatsApp.");
    } finally {
      setNotifying(false);
    }
  };

  const whatsappMsg = encodeURIComponent(
    "Namaste! I would like to inquire about upcoming Online Pooja and Vedic ritual services at Aastha Supports.",
  );

  return (
    <Layout>
      {/* Hero Slider */}
      <OnlinePoojaHero cat={cat} />

      {/* Main Coming Soon Banner */}
      <section className="py-16 bg-cream border-b border-gold/20 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-maroon-deep text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Coming Soon · शीघ्र उपलब्ध</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-maroon-deep leading-tight">
              Sacred Online Pooja Services
            </h1>
            <p className="font-devanagari text-gold text-xl md:text-2xl mt-3 font-semibold">
              || सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके ||
            </p>
            <p className="text-muted-foreground mt-4 text-base md:text-lg leading-relaxed">
              Experience authentic, personalized live Vedic rituals and sankalps performed by
              learned Purohits from sacred tirthas — Kashi Vishwanath, Mahakaleshwar Ujjain,
              Haridwar, and Ayodhya — right from your home.
            </p>
          </div>

          {/* 4 Divine Pillars Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            <div className="bg-white p-6 rounded-2xl border border-gold/25 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center text-maroon mb-4">
                <Flame className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display text-lg text-maroon-deep font-semibold mb-2">
                Personalized Sankalp
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Rituals conducted with your specific Name, Gotra, and Nakshatra for maximum Vedic
                potency and blessings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gold/25 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center text-maroon mb-4">
                <ShieldCheck className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display text-lg text-maroon-deep font-semibold mb-2">
                Vedic Shastriya Vidhi
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Performed by verified temple pandits following centuries-old Vedic scriptures and
                pure traditional vidhi.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gold/25 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center text-maroon mb-4">
                <Video className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display text-lg text-maroon-deep font-semibold mb-2">
                Live Video & Clips
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Watch rituals live via private streaming or receive personalized HD recorded video
                clips of your puja.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gold/25 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center text-maroon mb-4">
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display text-lg text-maroon-deep font-semibold mb-2">
                Blessed Prasad Delivery
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Consecrated holy prasad, bhasma, raksha sutra, and dry fruits delivered straight to
                your doorstep.
              </p>
            </div>
          </div>

          {/* Interactive Launch Alert & WhatsApp guidance Card */}
          <div className="bg-gradient-to-br from-maroon-deep via-[#5a1515] to-maroon text-cream rounded-3xl p-8 md:p-12 shadow-royal border border-gold/30 relative overflow-hidden mb-16">
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-2xl mx-auto text-center relative z-10">
              <span className="text-gold tracking-[0.3em] text-xs font-bold uppercase block mb-2">
                ✦ BE THE FIRST TO BE BLESSED ✦
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-cream mb-4">
                Get Notified Upon Launch
              </h2>
              <p className="text-cream/80 text-sm leading-relaxed mb-8">
                Join our priority blessing list to receive early access, date-reservation priority,
                and exclusive inauguration offers when our Live Online Pooja services commence.
              </p>

              {notified ? (
                <div className="bg-white/10 border border-gold/40 rounded-2xl p-6 text-center animate-fade-up">
                  <CheckCircle2 className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="font-display text-lg text-gold font-semibold">
                    You're on the priority list!
                  </p>
                  <p className="text-xs text-cream/80 mt-1">
                    We will send you an invitation as soon as bookings open. Har Har Mahadev!
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleNotify}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6"
                >
                  <input
                    type="email"
                    required
                    value={notifyContact}
                    onChange={(e) => setNotifyContact(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-xl bg-white text-maroon-deep placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  <button
                    type="submit"
                    disabled={notifying}
                    className="bg-gold text-maroon-deep font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-gold-soft transition shadow-gold whitespace-nowrap disabled:opacity-60"
                  >
                    Notify Me
                  </button>
                </form>
              )}

              <div className="pt-6 border-t border-cream/15 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-cream/80">
                <span>Need urgent astrological or pooja guidance right now?</span>
                <a
                  href={`https://wa.me/918287670827?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition"
                >
                  Connect on WhatsApp →
                </a>
              </div>
            </div>
          </div>

          {/* Explore Other Energized Products CTA */}
          <div className="text-center">
            <p className="text-xs tracking-[0.25em] text-gold uppercase font-semibold mb-2">
              DISCOVER AUTHENTIC SACRED ITEMS
            </p>
            <h3 className="font-display text-2xl md:text-3xl text-maroon-deep mb-6">
              Shop 100% Authentic Vedic Products
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/category/$slug"
                params={{ slug: "rudraksha" }}
                className="bg-maroon-deep text-cream px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-maroon transition shadow-md flex items-center gap-2"
              >
                Explore Rudraksha <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/category/$slug"
                params={{ slug: "gemstones" }}
                className="bg-white text-maroon-deep border border-gold/40 px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-cream transition shadow-sm flex items-center gap-2"
              >
                Astrological Gemstones <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/category/$slug"
                params={{ slug: "mala" }}
                className="bg-white text-maroon-deep border border-gold/40 px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-cream transition shadow-sm flex items-center gap-2"
              >
                Spiritual Malas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// ─── Slider Hero for online-pooja ────────────────────────────────
const poojaSlides = [
  "/banners/pooja_banner_1.png",
  "/banners/pooja_banner_2.png",
  "/banners/pooja_banner_3.png",
  "/banners/pooja_banner_4.png",
  "/banners/pooja_banner_5.png",
  "/banners/pooja_banner_6.png",
];

function OnlinePoojaHero({ cat }: { cat: any }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % poojaSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % poojaSlides.length);
  const prev = () => setCurrent((p) => (p - 1 + poojaSlides.length) % poojaSlides.length);

  return (
    <section className="relative h-[480px] overflow-hidden flex items-center bg-maroon-deep">
      {poojaSlides.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Online Pooja Slide ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2.5 rounded-full transition"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2.5 rounded-full transition"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {poojaSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? "bg-gold w-6" : "bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
