import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { getCategory } from "@/data/catalog";
import { getShopifyProducts } from "@/lib/shopify.functions";
import { getTemples, getPujasByTemple } from "@/lib/booking.functions";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import {
  Star,
  Sparkles,
  ShieldCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";
import { DirectBookingModal } from "@/components/booking/DirectBookingModal";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const cat = getCategory(params.slug);
    return {
      cat: cat || { slug: params.slug, name: params.slug, tagline: "", hero: "", sections: [] },
    };
  },
  head: ({ params, loaderData }) => {
    const title = `${loaderData?.cat.name ?? "Category"} — Aastha Support`;
    const desc = loaderData?.cat.tagline ?? "";
    const url = `https://aasthasupport.com/category/${params.slug}`;
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

  if (cat.slug === "online-pooja") {
    return <OnlinePoojaPage cat={cat} />;
  }
  return <ShopifyProductsPage cat={cat} />;
}

// ─── Shopify products page (non-pooja categories) ────────────────
function ShopifyProductsPage({ cat }: { cat: any }) {
  const fetchProducts = useServerFn(getShopifyProducts);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ data: { category: cat.slug, limit: 50 } })
      .then((data) => setProducts(data?.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cat.slug]);

  return (
    <Layout>
      <section className="relative h-[420px] overflow-hidden flex items-center">
        <img
          src={cat.hero}
          alt={cat.name}
          width={1920}
          height={800}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </section>

      {loading ? (
        <div className="flex justify-center items-center py-32 bg-cream min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : products.length === 0 ? (
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
        cat.sections.map((section: any) => {
          const sectionItems = products.filter((product) => {
            const title = section.title.toLowerCase();
            const prodName = product.name.toLowerCase();
            const prodTags = (product.tags || []).map((t: string) => t.toLowerCase());

            // Strict filtering for Rudraksha sections based on Nepal/Indonesian keywords
            if (title.includes("nepali") || title.includes("nepal")) {
              return (
                prodName.includes("nepal") ||
                prodTags.includes("nepal") ||
                prodTags.includes("nepali")
              );
            }
            if (title.includes("indonesian") || title.includes("indonesia")) {
              return (
                prodName.includes("indonesia") ||
                prodTags.includes("indonesia") ||
                prodTags.includes("indonesian")
              );
            }

            // For all other categories (gemstones, bracelets, yantra, mala)
            // where there is typically only 1 section, include all products fetched.
            return true;
          });

          if (sectionItems.length === 0) return null;
          return (
            <section key={section.title} className="py-16 bg-cream odd:bg-white">
              <div className="container mx-auto px-4">
                <div className="flex items-end justify-between mb-10 flex-wrap gap-3">
                  <div>
                    <p className="text-gold tracking-[0.3em] text-xs">{cat.name.toUpperCase()}</p>
                    <h2 className="font-display text-3xl md:text-4xl text-maroon-deep mt-2">
                      {section.title}
                    </h2>
                  </div>
                  <div className="divider-gold flex-1 max-w-xs ml-6 mb-2" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {sectionItems.map((item: any) => (
                    <Link
                      key={item.slug}
                      to="/product/$slug"
                      params={{ slug: item.slug }}
                      className="group bg-white rounded-xl overflow-hidden border border-gold/20 shadow-soft hover:shadow-royal transition"
                    >
                      <div className="aspect-square overflow-hidden bg-cream">
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          width={400}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-0.5 text-gold mb-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <h3 className="font-display text-lg text-maroon-deep group-hover:text-maroon leading-tight">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gold/15">
                          <span className="text-maroon font-medium">
                            ₹{item.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] tracking-widest uppercase text-gold">
                            View
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })
      )}
    </Layout>
  );
}

// ─── Online Pooja page — Supabase powered ─────────────────────────
function OnlinePoojaPage({ cat }: { cat: any }) {
  const fetchTemples = useServerFn(getTemples);
  const fetchPujas = useServerFn(getPujasByTemple);

  const [temples, setTemples] = useState<any[]>([]);
  const [selectedTemple, setSelectedTemple] = useState<any>(null);
  const [pujas, setPujas] = useState<any[]>([]);
  const [loadingTemples, setLoadingTemples] = useState(true);
  const [loadingPujas, setLoadingPujas] = useState(false);

  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    sevaName: string;
    amount: number;
  }>({ isOpen: false, sevaName: "", amount: 0 });

  // Load temples from Supabase
  useEffect(() => {
    fetchTemples({})
      .then((data) => {
        setTemples(data || []);
        // Auto-select first temple
        if (data && data.length > 0) setSelectedTemple(data[0]);
      })
      .catch(() => setTemples([]))
      .finally(() => setLoadingTemples(false));
  }, []);

  // Load pujas when temple changes
  useEffect(() => {
    if (!selectedTemple) return;
    setLoadingPujas(true);
    setPujas([]);
    fetchPujas({ data: { templeId: selectedTemple.id } })
      .then((data) => setPujas(data || []))
      .catch(() => setPujas([]))
      .finally(() => setLoadingPujas(false));
  }, [selectedTemple?.id]);

  return (
    <Layout>
      {/* Hero */}
      <OnlinePoojaHero cat={cat} />

      {/* Sawan Special Seva Section */}
      <section className="py-12 bg-gradient-to-r from-maroon-deep via-maroon to-maroon-deep text-cream border-b border-gold/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8">
            <span className="text-gold tracking-[0.4em] text-xs font-bold uppercase">
              ✦ पवित्र श्रावण मास विशेष ✦
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-gold mt-2">
              सावन स्पेशल सेवा (Sawan Special Seva)
            </h2>
            <p className="text-cream/80 text-sm mt-1 max-w-xl mx-auto">
              सावन के हर सोमवार आपके नाम एवं गोत्र से महाकाल एवं विश्वनाथ मंदिर में जल व बेलपत्र
              अर्पित किया जाएगा।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Card 1: ₹51 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-gold/30 flex flex-col justify-between hover:border-gold transition shadow-xl">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-gold text-maroon-deep text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                    सावन सोमवार जल सेवा
                  </span>
                  <span className="font-display text-3xl font-bold text-gold">₹51</span>
                </div>
                <h3 className="font-display text-xl text-cream mt-2">जल अभिषेक (Jal Abhishek)</h3>
                <p className="text-xs text-cream/80 mt-2 leading-relaxed">
                  सावन के हर सोमवार आपके नाम एवं गोत्र से भगवान शिव को पवित्र जल अर्पित किया जाएगा।
                  संकल्प के साथ पूजा।
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-cream/90">
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" /> नाम एवं गोत्र से संकल्प
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" /> सावन सोमवार जल अर्पण
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" /> डिजिटल पूजा फोटो
                  </li>
                </ul>
              </div>
              <button
                onClick={() =>
                  setBookingModal({ isOpen: true, sevaName: "सावन सोमवार जल अभिषेक", amount: 51 })
                }
                className="mt-6 w-full text-center bg-gold text-maroon-deep font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-gold-soft transition"
              >
                ₹51 में संकल्प लें →
              </button>
            </div>

            {/* Card 2: ₹101 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-gold/50 flex flex-col justify-between hover:border-gold transition shadow-xl relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-amber-400 text-maroon-deep text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                लोकप्रिय
              </div>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-amber-400 text-maroon-deep text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                    बेलपत्र व जल सेवा
                  </span>
                  <span className="font-display text-3xl font-bold text-gold">₹101</span>
                </div>
                <h3 className="font-display text-xl text-cream mt-2">
                  बेलपत्र एवं जल अभिषेक (Belpatra & Jal Abhishek)
                </h3>
                <p className="text-xs text-cream/80 mt-2 leading-relaxed">
                  सावन के हर सोमवार आपके नाम एवं गोत्र से बेलपत्र और जल दोनों अर्पित किए जाएंगे।
                  संकल्प के साथ संपूर्ण पूजा।
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-cream/90">
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" /> नाम एवं गोत्र से
                    व्यक्तिगत संकल्प
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" /> 108 बेलपत्र एवं जल
                    अभिषेक
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" /> पूजा फोटो एवं वीडियो
                    क्लिप
                  </li>
                </ul>
              </div>
              <button
                onClick={() =>
                  setBookingModal({
                    isOpen: true,
                    sevaName: "सावन बेलपत्र व जल अभिषेक",
                    amount: 101,
                  })
                }
                className="mt-6 w-full text-center bg-amber-400 text-maroon-deep font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-amber-300 transition"
              >
                ₹101 में संकल्प लें →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Temple selector + Puja listing */}
      <section className="py-16 bg-cream min-h-[500px]">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="text-center mb-12">
            <p className="text-gold tracking-[0.4em] text-xs font-semibold">✦ SACRED POOJAS ✦</p>
            <h2 className="font-display text-4xl md:text-5xl text-maroon-deep mt-3">
              Choose Your Pooja
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Select a temple and choose from our Vedic pandits-curated poojas, performed live at
              sacred sites.
            </p>
          </div>

          {loadingTemples ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-maroon" />
            </div>
          ) : temples.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto bg-white rounded-2xl border border-gold/20 shadow-sm px-8">
              <Flame className="w-12 h-12 text-gold mx-auto mb-4" />
              <h3 className="font-display text-2xl text-maroon-deep mb-2">Coming Soon</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Our pandit network is being set up. Sacred poojas will be listed here soon.
              </p>
              <Link
                to="/book-pooja"
                className="inline-flex items-center gap-2 bg-maroon-deep text-cream px-6 py-3 rounded-md text-xs tracking-widest uppercase hover:opacity-90 transition shadow-royal"
              >
                Book Directly <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <>
              {/* Temple tabs */}
              <div className="flex flex-wrap gap-3 mb-10 justify-center">
                {temples.map((temple) => (
                  <button
                    key={temple.id}
                    onClick={() => setSelectedTemple(temple)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                      selectedTemple?.id === temple.id
                        ? "bg-maroon-deep text-cream border-maroon-deep shadow-royal"
                        : "bg-white text-maroon-deep border-gold/30 hover:border-maroon-deep/40 hover:bg-cream"
                    }`}
                  >
                    {temple.image_url && (
                      <img
                        src={temple.image_url}
                        alt={temple.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    )}
                    {temple.name}
                    {temple.city && (
                      <span
                        className={`text-xs ${selectedTemple?.id === temple.id ? "text-gold-soft" : "text-muted-foreground"}`}
                      >
                        · {temple.city}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Temple info strip */}
              {selectedTemple && (
                <div className="mb-8 p-5 bg-white rounded-2xl border border-gold/20 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4">
                  {selectedTemple.image_url && (
                    <img
                      src={selectedTemple.image_url}
                      alt={selectedTemple.name}
                      className="w-20 h-20 rounded-xl object-cover border border-gold/30 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-maroon-deep">{selectedTemple.name}</h3>
                    {selectedTemple.city && (
                      <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">
                        {selectedTemple.city}
                      </p>
                    )}
                    {selectedTemple.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {selectedTemple.description}
                      </p>
                    )}
                  </div>
                  <Link
                    to="/book-pooja"
                    className="flex items-center gap-2 bg-gold text-maroon-deep px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-gold-soft transition shadow-gold flex-shrink-0"
                  >
                    Book Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Puja cards grid */}
              {loadingPujas ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-maroon" />
                </div>
              ) : pujas.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gold/20 shadow-sm">
                  <Flame className="w-10 h-10 text-gold/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No poojas configured for this temple yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {pujas.map((puja: any) => {
                    const minPrice = puja.packages?.length
                      ? Math.min(...puja.packages.map((p: any) => parseFloat(p.price || 0)))
                      : null;
                    return (
                      <div
                        key={puja.id}
                        className="group bg-white rounded-2xl overflow-hidden border border-gold/20 shadow-soft hover:shadow-royal transition-all duration-300 hover:-translate-y-1 flex flex-col"
                      >
                        {/* Image */}
                        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#fdf3e3] to-[#f5e0c0]">
                          {puja.image_url ? (
                            <img
                              src={puja.image_url}
                              alt={puja.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Flame className="w-16 h-16 text-[#c49a3c]/40" />
                            </div>
                          )}
                          {/* Duration badge */}
                          {puja.duration_minutes && (
                            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-cream text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {puja.duration_minutes} min
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-center gap-0.5 text-gold mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          <h3 className="font-display text-lg text-maroon-deep leading-tight line-clamp-2 group-hover:text-maroon">
                            {puja.name}
                          </h3>
                          {puja.description && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed flex-1">
                              {puja.description}
                            </p>
                          )}

                          {/* Packages count */}
                          {puja.packages?.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
                              <Users className="w-3 h-3" />
                              {puja.packages.length} package{puja.packages.length !== 1 ? "s" : ""}{" "}
                              available
                            </div>
                          )}

                          {/* Price + CTA */}
                          <div className="mt-3 pt-3 border-t border-gold/15 flex items-center justify-between">
                            <div>
                              {minPrice !== null ? (
                                <>
                                  <span className="text-[10px] text-muted-foreground">
                                    Starting at
                                  </span>
                                  <p className="font-display text-lg text-maroon-deep leading-none">
                                    ₹{minPrice.toLocaleString("en-IN")}
                                  </p>
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Contact for price
                                </span>
                              )}
                            </div>
                            <Link
                              to="/book-pooja"
                              className="flex items-center gap-1.5 bg-maroon-deep text-cream text-[11px] font-semibold px-3.5 py-2 rounded-full hover:bg-maroon transition shadow-royal"
                            >
                              Book <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CTA Footer */}
              <div className="mt-16 text-center">
                <Link
                  to="/book-pooja"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-maroon-deep to-[#5a1515] text-cream px-10 py-4 rounded-full text-sm font-bold tracking-widest uppercase hover:opacity-90 transition shadow-royal"
                >
                  <Flame className="w-5 h-5 text-gold" />
                  Book a Full Pooja
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-xs text-muted-foreground mt-3">
                  Secure payment via Razorpay · Performed by certified Vedic pandits
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      <DirectBookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal((prev) => ({ ...prev, isOpen: false }))}
        sevaName={bookingModal.sevaName}
        amount={bookingModal.amount}
      />
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
