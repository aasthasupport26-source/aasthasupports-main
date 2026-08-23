import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitContactForm } from "@/lib/contact.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Aastha Support" },
      {
        name: "description",
        content:
          "Speak to our Vedic astrologers and customer care team — phone, WhatsApp, email or visit our Haridwar ashram.",
      },
      { property: "og:title", content: "Contact — Aastha Support" },
      {
        property: "og:description",
        content: "Speak to our Vedic astrologers and customer care team.",
      },
      { property: "og:url", content: "https://aasthasupport.com/contact" },
    ],
    links: [{ rel: "canonical", href: "https://aasthasupport.com/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Aastha Support",
          image: "https://aasthasupport.com/og-image.jpg",
          url: "https://aasthasupport.com/contact",
          telephone: "+91-99999-99999",
          email: "care@aasthasupport.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Aastha Bhawan",
            addressLocality: "Haridwar",
            addressRegion: "Uttarakhand",
            postalCode: "249401",
            addressCountry: "IN",
          },
          openingHours: "Mo-Sa 09:00-20:00",
        }),
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const submitForm = useServerFn(submitContactForm);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    try {
      await submitForm({ data });
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="bg-royal py-20 text-cream">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gold tracking-[0.4em] text-xs">✦ संपर्क ✦</p>
          <h1 className="font-display text-5xl md:text-6xl mt-3">Get in Touch</h1>
          <p className="mt-4 text-cream/80 max-w-xl mx-auto">
            Speak to our Vedic astrologers for free guidance, or reach our care team for any query.
          </p>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10">
          {/* Form */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-soft border border-gold/20">
            <h2 className="font-display text-3xl text-maroon-deep">Send a Message</h2>
            <div className="divider-gold w-24 mt-3 mb-6" />

            {submitted ? (
              <div className="py-10 text-center">
                <p className="font-devanagari text-gold text-2xl">|| धन्यवाद ||</p>
                <p className="mt-3 text-foreground/80">
                  We have received your message. Our team will reach out within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs tracking-widest uppercase text-maroon-deep">
                      Name
                    </label>
                    <input
                      required
                      name="name"
                      type="text"
                      className="mt-1.5 w-full rounded-md border border-gold/30 bg-cream px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase text-maroon-deep">
                      Phone
                    </label>
                    <input
                      required
                      name="phone"
                      type="tel"
                      className="mt-1.5 w-full rounded-md border border-gold/30 bg-cream px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-maroon-deep">
                    Email
                  </label>
                  <input
                    required
                    name="email"
                    type="email"
                    className="mt-1.5 w-full rounded-md border border-gold/30 bg-cream px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-maroon-deep">
                    How can we help?
                  </label>
                  <textarea
                    required
                    name="message"
                    rows={5}
                    className="mt-1.5 w-full rounded-md border border-gold/30 bg-cream px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-royal text-cream px-6 py-4 rounded-md font-medium tracking-widest text-xs uppercase hover:opacity-90 transition shadow-royal disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {[
              {
                icon: Phone,
                title: "Call Us",
                v1: "+91 99999 99999",
                v2: "Mon–Sat · 9am – 8pm IST",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp",
                v1: "+91 99999 99999",
                v2: "Instant replies for queries",
              },
              {
                icon: Mail,
                title: "Email Us",
                v1: "care@aasthasupport.com",
                v2: "Replied within 24 hours",
              },
              {
                icon: MapPin,
                title: "Visit Ashram",
                v1: "Aastha Bhawan, Haridwar",
                v2: "Uttarakhand, Bharat 249401",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="bg-white rounded-xl p-6 border border-gold/20 shadow-soft flex gap-5"
              >
                <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                  <c.icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-maroon-deep">{c.title}</h3>
                  <p className="text-maroon mt-1 font-medium">{c.v1}</p>
                  <p className="text-xs text-muted-foreground tracking-wider mt-0.5">{c.v2}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
