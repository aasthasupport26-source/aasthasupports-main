import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import heroImg from "@/assets/hero-sage.jpg";
import { Award, Users, Heart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Aastha Support" },
      { name: "description", content: "Our story, our pandits, and our commitment to authentic Sanatan tradition — sourcing rudraksha and gemstones from origin." },
      { property: "og:title", content: "About Us — Aastha Support" },
      { property: "og:description", content: "Our story, pandits, and commitment to authentic Sanatan tradition." },
      { property: "og:url", content: "https://aasthasupportscom.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://aasthasupportscom.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <Layout>
      <section className="relative h-[360px] flex items-center overflow-hidden">
        <img src={heroImg} alt="Sage" width={1920} height={1280} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-deep/90 to-maroon-deep/50" />
        <div className="container relative mx-auto px-4 z-10">
          <p className="text-gold tracking-[0.4em] text-xs">✦ हमारी कहानी ✦</p>
          <h1 className="font-display text-5xl md:text-6xl text-cream mt-3">About Aastha Support</h1>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="font-devanagari text-gold text-2xl text-center">|| श्रद्धावान् लभते ज्ञानम् ||</p>
          <p className="text-center text-xs tracking-[0.3em] text-muted-foreground uppercase mt-2">
            One Who Has Faith, Attains Knowledge
          </p>
          <div className="divider-gold w-32 mx-auto my-8" />
          <div className="space-y-5 text-foreground/85 leading-relaxed">
            <p>
              Aastha Support was born from a single conviction — that every devotee, regardless of where
              they live, deserves access to authentic spiritual products and Vedic rituals performed in
              their true tradition.
            </p>
            <p>
              From the sacred ghats of Haridwar and Kashi to the rudraksha forests of Nepal and Indonesia,
              we travel to the source. Every bead, every gemstone, every yantra is hand-picked, verified,
              certified, and then energised through traditional Vedic abhimantran by our learned pandits.
            </p>
            <p>
              Our online pooja services let you participate live in rituals performed by Vedic scholars
              at the most sacred temples of Bharat. From Mahamrityunjay Jaap to Kaal Sarp Nivaran — the
              divine reaches you, wherever you are.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-maroon-deep text-cream">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-4xl text-center mb-12">Our Sacred Promise</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Award, num: "12,000+", label: "Happy Devotees" },
              { icon: Sparkles, num: "100%", label: "Authentic Products" },
              { icon: Users, num: "25+", label: "Vedic Pandits" },
              { icon: Heart, num: "500+", label: "Poojas Monthly" },
            ].map((s) => (
              <div key={s.label} className="text-center border border-gold/30 rounded-xl p-7 bg-maroon/40">
                <s.icon className="w-8 h-8 text-gold mx-auto" />
                <p className="font-display text-3xl text-gold mt-3">{s.num}</p>
                <p className="text-cream/80 text-sm tracking-widest uppercase mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
