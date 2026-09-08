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
          "Speak to our Vedic astrologers and customer care team — phone, WhatsApp, email or visit our Lucknow office.",
      },
      { property: "og:title", content: "Contact — Aastha Support" },
      {
        property: "og:description",
        content: "Speak to our Vedic astrologers and customer care team.",
      },
      { property: "og:url", content: "https://www.aasthasupports.com/contact" },
    ],
    links: [{ rel: "canonical", href: "https://www.aasthasupports.com/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Aastha Support",
          image: "https://www.aasthasupports.com/og-image.jpg",
          url: "https://www.aasthasupports.com/contact",
          telephone: "+91-82876-70827",
          email: "aastha.support.26@gmail.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Mampur bana",
            addressLocality: "Lucknow",
            addressRegion: "Uttar Pradesh",
            postalCode: "226201",
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
                v1: "+91 82876 70827",
                v2: "Mon–Sat · 9am – 8pm IST",
                href: "tel:+918287670827",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp",
                v1: "+91 82876 70827",
                v2: "wa.me/91 · Instant replies",
                href: "https://wa.me/918287670827?text=Namaste!%20I%20have%20an%20inquiry%20regarding%20Aastha%20Supports.",
                isPopup: true,
              },
              {
                icon: Mail,
                title: "Email Us",
                v1: "aastha.support.26@gmail.com",
                v2: "Replied within 24 hours",
                href: "mailto:aastha.support.26@gmail.com",
              },
              {
                icon: MapPin,
                title: "Visit Us",
                v1: "Mampur bana, Lucknow",
                v2: "Uttar Pradesh, Bharat 226201",
                href: undefined,
              },
            ].map((c) => {
              const Content = (
                <div
                  className={`bg-white rounded-xl p-6 border border-gold/20 shadow-soft flex gap-5 transition ${
                    c.href ? "hover:border-gold/50 hover:shadow-md cursor-pointer" : ""
                  }`}
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
              );

              if (c.href) {
                return (
                  <a
                    key={c.title}
                    href={c.href}
                    target={c.isPopup ? "_blank" : undefined}
                    rel={c.isPopup ? "noopener noreferrer" : undefined}
                    onClick={
                      c.isPopup
                        ? (e) => {
                            e.preventDefault();
                            window.open(
                              c.href,
                              "whatsapp_popup",
                              "width=600,height=700,scrollbars=yes,resizable=yes"
                            );
                          }
                        : undefined
                    }
                    className="block"
                  >
                    {Content}
                  </a>
                );
              }

              return <div key={c.title}>{Content}</div>;
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
