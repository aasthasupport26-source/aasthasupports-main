import { ShieldCheck, Microscope, Flame, FileCheck, BadgeCheck } from "lucide-react";

const certifications = [
  {
    icon: ShieldCheck,
    title: "IGL & GJSPC Certified",
    desc: "IGL & GJSPC Certified — On Request. Every sacred piece is authenticated for natural origin and purity.",
  },
  {
    icon: Microscope,
    title: "X-Ray Verification",
    desc: "X-Ray Verification Available on Request — to verify internal chamber count (mukhi) with clear scientific proof.",
  },
  {
    icon: Flame,
    title: "Vedic Abhimantran",
    desc: "Energised Through Traditional Vedic Rituals by learned pandits before dispatch.",
  },
  {
    icon: FileCheck,
    title: "Origin Traceable",
    desc: "Each product carries origin details — Nepal, Indonesia, Sri Lanka — so you know exactly where your spiritual item comes from.",
  },
  {
    icon: BadgeCheck,
    title: "Astrologer Verified",
    desc: "Free consultation with our in-house Vedic astrologers to match the right product with your kundali and planetary needs.",
  },
];

export function VedicTrust({ compact = false }: { compact?: boolean }) {
  return (
    <section className="py-20 bg-cream relative overflow-hidden">
      {/* Subtle decorative Om */}
      <div className="absolute inset-0 opacity-[0.03] font-devanagari text-[18rem] text-maroon-deep leading-none flex items-center justify-center pointer-events-none select-none">
        ॐ
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-gold tracking-[0.3em] text-xs font-medium">TRUST & AUTHENTICITY</p>
          <h2 className="font-display text-4xl md:text-5xl text-maroon-deep mt-3">
            Faith Backed By Certification
          </h2>
          <div className="divider-gold w-32 mx-auto mt-5" />
          <p className="mt-5 text-muted-foreground">
            We don't just sell spiritual products — we deliver divine blessings backed by science,
            scripture, and transparency.
          </p>
        </div>

        <div
          className={`grid gap-6 ${compact ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"}`}
        >
          {certifications.map((c) => (
            <div
              key={c.title}
              className="group bg-white rounded-xl p-7 border border-gold/20 hover:border-gold/60 hover:shadow-royal transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-full bg-maroon-deep/5 flex items-center justify-center mb-4 group-hover:bg-gold/15 transition-colors">
                <c.icon className="w-6 h-6 text-maroon-deep group-hover:text-gold transition-colors" />
              </div>
              <h3 className="font-numeric text-xl text-maroon-deep mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust stats bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 bg-maroon-deep rounded-2xl p-8 md:p-10">
          {[
            { num: "100%", label: "Every Piece Hand-Selected & Certified" },
            { num: "100%", label: "Authentic Products" },
            { num: "7 Day", label: "Easy Returns" },
            { num: "Guaranteed", label: "Certified Quality, Every Time" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-numeric text-2xl md:text-3xl text-gold font-bold">{s.num}</p>
              <p className="text-xs text-cream/70 tracking-wider uppercase mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
