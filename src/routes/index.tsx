import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { categories } from "@/data/catalog";
import { NAVRATNA_GEMSTONES } from "@/data/gemstones";
import { VedicTrust } from "@/components/VedicTrust";
import heroImg from "@/assets/hero-sage.jpg";
import { ArrowRight, Sparkles, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aastha Supports — Rudraksha, Gems & Yantras" },
      {
        name: "description",
        content:
          "Shop rudraksha, malas, bracelets, gemstones and yantras with clear product details and available certification information.",
      },
      { property: "og:title", content: "Aastha Supports — Rudraksha, Gems & Yantras" },
      {
        property: "og:description",
        content:
          "Rudraksha, gems, malas, bracelets and yantras — certification available on request, energised through traditional Vedic rituals.",
      },
      { property: "og:url", content: "https://www.aasthasupports.com/" },
      { property: "og:image", content: "https://www.aasthasupports.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.aasthasupports.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Aastha Supports",
          url: "https://www.aasthasupports.com",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://www.aasthasupports.com/shop?search={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[580px] flex items-center overflow-hidden">
        <img
          src={heroImg}
          alt="Vedic sage meditating with rudraksha"
          width={1920}
          height={1280}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-overlay opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-deep/60 via-maroon-deep/20 to-transparent" />

        <div className="container relative mx-auto px-4 z-10">
          <div className="max-w-2xl animate-fade-up">
            <p className="text-gold tracking-[0.4em] text-xs mb-5 font-medium">
              ✦ THE DIVINE WAY ✦
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.05]">
              Awaken Your
              <br />
              <span className="text-gold italic">Inner Devotion</span>
            </h1>
            <p className="font-devanagari text-gold-soft text-2xl mt-4">|| असतो मा सद्गमय ||</p>
            <p className="mt-6 text-cream/85 text-lg max-w-xl leading-relaxed">
              Authentic and Vedic-energised spiritual products — rudraksha, gemstones,
              malas, bracelets and yantras. Certification available on request.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/category/$slug"
                params={{ slug: "rudraksha" }}
                className="inline-flex items-center gap-2 bg-gold text-maroon-deep px-7 py-3.5 rounded-md font-medium tracking-widest text-xs uppercase hover:bg-gold-soft transition shadow-gold"
              >
                Shop Rudraksha <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/category/$slug"
                params={{ slug: "gemstones" }}
                search={{ type: "all" }}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-cream px-7 py-3.5 rounded-md font-medium tracking-widest text-xs uppercase border border-gold/40 transition shadow-soft backdrop-blur-xs"
              >
                Navratna Gemstones <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick 9 Gemstones Bar in Hero */}
            <div className="mt-8 pt-5 border-t border-gold/20">
              <p className="text-[11px] text-gold tracking-widest uppercase font-semibold mb-2.5 flex items-center gap-1.5">
                <span>✦ Explore All 9 Sacred Gemstones:</span>
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {NAVRATNA_GEMSTONES.map((gem) => (
                  <Link
                    key={gem.id}
                    to="/category/$slug"
                    params={{ slug: "gemstones" }}
                    search={{ type: gem.id }}
                    className="group flex-shrink-0 flex items-center gap-1.5 bg-black/40 hover:bg-black/75 border border-gold/30 hover:border-gold px-2.5 py-1.5 rounded-full transition-all duration-300"
                    title={`${gem.name} (${gem.hindiName}) — ${gem.planet}`}
                  >
                    <img
                      src={gem.image}
                      alt={gem.name}
                      className="w-5 h-5 rounded-full object-cover border border-gold/40 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-[11px] text-cream font-medium group-hover:text-gold transition">
                      {gem.name}
                    </span>
                    <span className="text-[10px] text-gold/85 font-devanagari font-normal">
                      ({gem.hindiName})
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative gold bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
      </section>

      {/* Sanskrit blessing */}
      <section className="bg-maroon-deep py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="font-devanagari text-gold-soft text-2xl md:text-3xl">
            || ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् ||
          </p>
          <p className="text-cream/70 text-xs tracking-[0.3em] mt-3 uppercase">
            Mahamrityunjay Mantra · For Health & Longevity
          </p>
        </div>
      </section>

      {/* Festive Diwali Spotlight Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-maroon-deep via-[#3a0813] to-cream relative overflow-hidden border-b border-gold/30">
        {/* Ambient gold glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-gradient-to-r from-maroon-deep via-[#4A0E17] to-maroon-deep border border-gold/40 rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl text-cream relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-gold/10 rounded-full blur-2xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-semibold tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
                  <span>Diwali &amp; Dhanteras Special 🪔</span>
                </div>

                <div>
                  <p className="font-devanagari text-gold-soft text-lg sm:text-xl font-medium tracking-wide">
                    || ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः ||
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-cream mt-2 leading-tight">
                    Shri Lakshmi Ganesh <span className="text-gold italic">Prosperity Hamper</span>
                  </h2>
                </div>

                <p className="text-cream/85 text-sm sm:text-base leading-relaxed max-w-xl">
                  Complete auspicious Vedic puja combo featuring the sacred Ashtadhatu Yantram set on a brass plate, natural 7 Mukhi Rudraksha Dhanyog bracelet, energized Safed Kaudi, and sacred Gomti Chakra for everlasting wealth, harmony, and obstacle removal.
                </p>

                {/* Key Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-cream/90">
                  <div className="flex items-center gap-2">
                    <span className="text-gold">✦</span>
                    <span>Ashtadhatu Kurma, Paduka &amp; Coin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold">✦</span>
                    <span>7 Mukhi Mahalakshmi Rudraksha</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold">✦</span>
                    <span>Energised Safed Kaudi &amp; Gomti Chakra</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold">✦</span>
                    <span>100% Vedic Pandit Energised</span>
                  </div>
                </div>

                {/* Price & CTA Buttons */}
                <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-numeric text-3xl sm:text-4xl font-bold text-gold">₹2,999</span>
                      <span className="text-cream/50 text-sm line-through">₹4,999</span>
                      <span className="text-[11px] bg-gold/20 text-gold font-semibold px-2 py-0.5 rounded border border-gold/30">
                        40% OFF
                      </span>
                    </div>
                    <p className="text-[11px] text-cream/70 tracking-wider uppercase mt-1">
                      Free Express Shipping across India
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/product/$slug"
                      params={{ slug: "diwali-special-hamper-shri-lakshmi-ganesh-prosperity-combo" }}
                      className="inline-flex items-center gap-2 bg-gold text-maroon-deep px-6 py-3.5 rounded-xl font-bold tracking-wider text-xs uppercase hover:bg-gold-soft transition shadow-gold"
                    >
                      <ShoppingBag className="w-4 h-4" /> Order Hamper Now
                    </Link>
                    <Link
                      to="/category/$slug"
                      params={{ slug: "diwali-hamper" }}
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-cream px-5 py-3.5 rounded-xl font-semibold tracking-wider text-xs uppercase border border-gold/30 transition"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Visual Image */}
              <div className="lg:col-span-5 flex justify-center">
                <Link
                  to="/product/$slug"
                  params={{ slug: "diwali-special-hamper-shri-lakshmi-ganesh-prosperity-combo" }}
                  className="group relative block rounded-2xl overflow-hidden border-2 border-gold/40 shadow-2xl hover:border-gold transition-all duration-500 max-w-md w-full"
                >
                  <img
                    src="https://cdn.shopify.com/s/files/1/1012/2867/5360/files/premium-diwali-prosperity-combo-creative-display.png?v=1792501850"
                    alt="Diwali Special Hamper – Shri Lakshmi Ganesh Prosperity Combo"
                    loading="lazy"
                    width={600}
                    height={600}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-maroon-deep/90 text-gold text-[11px] font-bold px-3 py-1 rounded-full border border-gold/40 backdrop-blur-sm">
                    Festive Maha Puja Kit
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                    <span className="text-gold text-xs font-semibold tracking-wider uppercase inline-flex items-center gap-1.5">
                      Click to View Complete Kit Details <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories grid */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-gold tracking-[0.3em] text-xs font-medium">SACRED COLLECTIONS</p>
            <h2 className="font-display text-4xl md:text-5xl text-maroon-deep mt-3">
              Explore Our Divine Offerings
            </h2>
            <div className="divider-gold w-32 mx-auto mt-5" />
            <p className="mt-5 text-muted-foreground">
              Each product is hand-picked and energised through Vedic rituals before
              reaching you. Certification available on request.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, i) => (
              <Link
                key={cat.slug}
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="group relative overflow-hidden rounded-xl shadow-soft hover:shadow-royal transition-all duration-500"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={cat.hero}
                    alt={cat.name}
                    loading="lazy"
                    width={800}
                    height={1000}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                {cat.slug === "diwali-hamper" && (
                  <span className="absolute top-4 right-4 bg-gold text-maroon-deep text-xs px-3 py-1 rounded-full font-bold tracking-wider uppercase shadow-gold z-10 flex items-center gap-1">
                    <span>🪔</span> Festive Special
                  </span>
                )}
                {cat.slug === "online-pooja" && (
                  <span className="absolute top-4 right-4 bg-maroon-deep/90 text-gold text-xs px-3 py-1 rounded-full border border-gold/40 font-medium tracking-wider uppercase backdrop-blur-sm z-10">
                    Coming Soon
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep via-maroon-deep/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                  <p className="text-gold text-[10px] tracking-[0.35em] uppercase">Collection</p>
                  <h3 className="font-display text-2xl md:text-3xl text-cream mt-1">{cat.name}</h3>
                  <p className="text-cream/75 text-xs md:text-sm mt-2 line-clamp-2">
                    {cat.tagline}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-3 text-gold text-xs tracking-widest uppercase group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-20 bg-maroon-deep text-cream relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 font-devanagari text-[20rem] text-gold leading-none flex items-center justify-center pointer-events-none select-none">
          ॐ
        </div>
        <div className="container relative mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-gold tracking-[0.3em] text-xs">OUR PROMISE</p>
            <h2 className="font-display text-4xl md:text-5xl mt-3">Why Devotees Trust Us</h2>
            <div className="divider-gold w-32 mx-auto mt-5" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Vedic Authenticity",
                desc: "Every product is sourced from verified origins. Quality-checked and certification available on request.",
                num: "01",
              },
              {
                title: "Energised by Pandits",
                desc: "Energised through traditional Vedic rituals by learned pandits before dispatch.",
                num: "02",
              },
              {
                title: "Astrological Guidance",
                desc: "Free consultation with our in-house Vedic astrologers to find the right rudraksha or gem for your kundali.",
                num: "03",
              },
            ].map((item) => (
              <div
                key={item.num}
                className="border border-gold/30 rounded-xl p-8 bg-maroon/40 backdrop-blur hover:border-gold transition"
              >
                <p className="font-display text-5xl text-gold/40">{item.num}</p>
                <h3 className="font-display text-2xl text-cream mt-3">{item.title}</h3>
                <p className="text-cream/75 text-sm mt-3 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <VedicTrust />

      {/* CTA */}
      <section className="py-20 bg-royal text-cream relative overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <p className="text-gold tracking-[0.4em] text-xs">|| आरम्भ ||</p>
          <h2 className="font-display text-4xl md:text-5xl mt-4">Begin Your Spiritual Journey</h2>
          <p className="mt-5 text-cream/80 leading-relaxed">
            Speak to our Vedic astrologers for a personalised recommendation — discover the
            rudraksha, gemstone or pooja meant for your soul.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              to="/contact"
              className="bg-gold text-maroon-deep px-8 py-3.5 rounded-md tracking-widest text-xs uppercase font-medium hover:bg-gold-soft transition shadow-gold"
            >
              Free Consultation
            </Link>
            <Link
              to="/category/$slug"
              params={{ slug: "online-pooja" }}
              className="border border-gold/60 px-8 py-3.5 rounded-md tracking-widest text-xs uppercase hover:bg-gold/15 transition"
            >
              Online Pooja (Coming Soon)
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
