import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sparkles, Flame, ArrowRight, ShieldCheck, Video, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/book-pooja")({
  head: () => ({
    meta: [
      { title: "Online Pooja Services (Coming Soon) — Aastha Supports" },
      {
        name: "description",
        content:
          "Online Vedic pooja and personalized sankalp services performed live by certified pandits at holy shrines are coming soon.",
      },
      { property: "og:title", content: "Online Pooja Services (Coming Soon) — Aastha Supports" },
      {
        property: "og:description",
        content:
          "Live Vedic pujas with personal Sankalp and holy Prasad dispatch are launching soon on Aastha Supports.",
      },
      { property: "og:url", content: "https://www.aasthasupports.com/book-pooja" },
      { property: "og:image", content: "https://www.aasthasupports.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.aasthasupports.com/book-pooja" }],
  }),
  component: BookPoojaPage,
});

function BookPoojaPage() {
  const [notifyContact, setNotifyContact] = useState("");
  const [notified, setNotified] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyContact.trim()) return;
    setNotified(true);
    toast.success("Dhanyavaad! We will notify you as soon as bookings open.");
  };

  const whatsappMsg = encodeURIComponent(
    "Namaste! I would like to inquire about upcoming Online Pooja services and Vedic rituals at Aastha Supports.",
  );

  return (
    <Layout>
      <section className="py-20 bg-cream min-h-[85vh] flex items-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-3xl border border-gold/30 shadow-royal overflow-hidden">
            {/* Top decorative header */}
            <div className="bg-gradient-to-r from-maroon-deep via-[#5a1515] to-maroon text-cream p-8 md:p-12 text-center relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold-soft text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Launching Soon · शीघ्र उपलब्ध</span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl text-cream font-bold leading-tight">
                Online Pooja Booking System
              </h1>
              <p className="font-devanagari text-gold text-xl md:text-2xl mt-3 font-semibold">
                || ॐ नमः शिवाय ||
              </p>
              <p className="text-cream/80 text-sm md:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
                We are currently expanding our network of authentic shrine affiliations across Kashi Vishwanath, Mahakaleshwar Ujjain, and Haridwar. Direct online pooja bookings with live video darshan and consecrated prasad dispatch will go live shortly.
              </p>
            </div>

            {/* Content Body */}
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="p-5 rounded-2xl bg-cream/60 border border-gold/25 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-maroon mx-auto mb-3">
                    <Flame className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="font-display text-base text-maroon-deep font-bold mb-1">
                    Personalized Sankalp
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Name, Gotra & Nakshatra sankalp recited live during the ritual.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-cream/60 border border-gold/25 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-maroon mx-auto mb-3">
                    <ShieldCheck className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="font-display text-base text-maroon-deep font-bold mb-1">
                    Verified Purohits
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Performed exclusively by trained Vedic Acharyas with authentic vidhi.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-cream/60 border border-gold/25 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-maroon mx-auto mb-3">
                    <Video className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="font-display text-base text-maroon-deep font-bold mb-1">
                    Video & Prasad
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Recorded HD footage of your puja and sacred prasad delivered home.
                  </p>
                </div>
              </div>

              {/* Notification Box */}
              <div className="bg-cream/70 rounded-2xl p-6 md:p-8 border border-gold/20 text-center max-w-xl mx-auto mb-10">
                <h4 className="font-display text-xl text-maroon-deep font-bold mb-2">
                  Be Notified Upon Booking Launch
                </h4>
                <p className="text-xs text-muted-foreground mb-5">
                  Enter your mobile or email to get priority booking access and inaugural blessing discounts.
                </p>

                {notified ? (
                  <div className="bg-white border border-gold/40 rounded-xl p-4 text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-maroon-deep">
                      Thank you! You will be notified the moment bookings open.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                    <input
                      type="text"
                      required
                      value={notifyContact}
                      onChange={(e) => setNotifyContact(e.target.value)}
                      placeholder="Mobile or Email"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white text-maroon-deep text-xs border border-gold/30 focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <button
                      type="submit"
                      className="bg-maroon-deep text-cream hover:bg-maroon font-semibold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
                    >
                      Notify Me
                    </button>
                  </form>
                )}
              </div>

              {/* Navigation CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-gold/20">
                <Link
                  to="/category/$slug"
                  params={{ slug: "online-pooja" }}
                  className="bg-gold text-maroon-deep font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-gold-soft transition shadow-gold flex items-center gap-2"
                >
                  View Upcoming Pooja Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href={`https://wa.me/918766343513?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  Consult on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
