import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { categories } from "@/data/catalog";
import { VedicTrust } from "@/components/VedicTrust";
import heroImg from "@/assets/hero-sage.jpg";
import { Star, Sparkles, ArrowRight, Quote } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aastha Support — Rudraksha, Gems & Online Pooja" },
      { name: "description", content: "Shop certified rudraksha, malas, bracelets, gemstones & yantras. Book online poojas performed live by Vedic pandits from Kashi, Ujjain & Haridwar." },
      { property: "og:title", content: "Aastha Support — Rudraksha, Gems & Online Pooja" },
      { property: "og:description", content: "Certified rudraksha, gems, malas, bracelets, yantras and live Vedic poojas — energised by learned pandits." },
      { property: "og:url", content: "https://aasthasupport.com/" },
      { property: "og:image", content: "https://aasthasupport.com/og-image.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://aasthasupport.com/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Aastha Support",
          url: "https://aasthasupport.com",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://aasthasupport.com/category/{search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  component: HomePage,
});

const testimonials = [
  {
    name: "Rakesh Sharma",
    city: "Mumbai",
    text: "Got my 7 Mukhi Nepali Rudraksha — packaging was divine, certificate authentic. Felt the energy from day one.",
  },
  {
    name: "Anjali Verma",
    city: "Delhi",
    text: "Booked Mahamrityunjay Jaap for my father's health. Live darshan from Kashi gave us so much peace.",
  },
  {
    name: "Vikram Singh",
    city: "Jaipur",
    text: "Pukhraj from Aastha Support changed my career trajectory. Lab certified and astrologically perfect.",
  },
];

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
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-deep/85 via-maroon-deep/40 to-transparent" />

        <div className="container relative mx-auto px-4 z-10">
          <div className="max-w-2xl animate-fade-up">
            <p className="text-gold tracking-[0.4em] text-xs mb-5 font-medium">
              ✦ THE DIVINE WAY ✦
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.05]">
              Awaken Your<br />
              <span className="text-gold italic">Inner Devotion</span>
            </h1>
            <p className="font-devanagari text-gold-soft text-2xl mt-4">
              || असतो मा सद्गमय ||
            </p>
            <p className="mt-6 text-cream/85 text-lg max-w-xl leading-relaxed">
              Authentic, certified, and Vedic-energised spiritual products — rudraksha,
              gemstones and live poojas performed by learned pandits.
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
                params={{ slug: "online-pooja" }}
                className="inline-flex items-center gap-2 border border-gold/60 text-cream px-7 py-3.5 rounded-md font-medium tracking-widest text-xs uppercase hover:bg-gold/15 transition"
              >
                Book Online Pooja
              </Link>
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
              Each product is hand-picked, lab-certified, and energised through Vedic rituals before reaching you.
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
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep via-maroon-deep/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                  <p className="text-gold text-[10px] tracking-[0.35em] uppercase">Collection</p>
                  <h3 className="font-display text-2xl md:text-3xl text-cream mt-1">{cat.name}</h3>
                  <p className="text-cream/75 text-xs md:text-sm mt-2 line-clamp-2">{cat.tagline}</p>
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
            <h2 className="font-display text-4xl md:text-5xl mt-3">
              Why Devotees Trust Us
            </h2>
            <div className="divider-gold w-32 mx-auto mt-5" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Vedic Authenticity", desc: "Every rudraksha, gemstone and yantra is sourced directly from origin — Nepal, Indonesia, Sri Lanka — and X-ray / lab certified.", num: "01" },
              { title: "Energised by Pandits", desc: "Products are abhimantrit through traditional Vedic rituals at our Haridwar ashram before dispatch.", num: "02" },
              { title: "Astrological Guidance", desc: "Free consultation with our in-house Vedic astrologers to find the right rudraksha or gem for your kundali.", num: "03" },
            ].map((item) => (
              <div key={item.num} className="border border-gold/30 rounded-xl p-8 bg-maroon/40 backdrop-blur hover:border-gold transition">
                <p className="font-display text-5xl text-gold/40">{item.num}</p>
                <h3 className="font-display text-2xl text-cream mt-3">{item.title}</h3>
                <p className="text-cream/75 text-sm mt-3 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <VedicTrust />

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-cream to-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-gold tracking-[0.3em] text-xs">DEVOTEES SPEAK</p>
            <h2 className="font-display text-4xl md:text-5xl text-maroon-deep mt-3">
              Blessings Shared
            </h2>
            <div className="divider-gold w-32 mx-auto mt-5" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-7 shadow-soft border border-gold/20 relative">
                <Quote className="absolute top-5 right-5 w-10 h-10 text-gold/15" />
                <div className="flex items-center gap-0.5 text-gold mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-foreground/80 leading-relaxed text-sm">"{t.text}"</p>
                <div className="mt-5 pt-5 border-t border-gold/15">
                  <p className="font-display text-lg text-maroon-deep">{t.name}</p>
                  <p className="text-xs text-muted-foreground tracking-wider uppercase">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-royal text-cream relative overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <p className="text-gold tracking-[0.4em] text-xs">|| आरम्भ ||</p>
          <h2 className="font-display text-4xl md:text-5xl mt-4">
            Begin Your Spiritual Journey
          </h2>
          <p className="mt-5 text-cream/80 leading-relaxed">
            Speak to our Vedic astrologers for a personalised recommendation —
            discover the rudraksha, gemstone or pooja meant for your soul.
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
              Book a Pooja
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
