import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Phone, Mail, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitContactForm } from "@/lib/contact.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Aastha Supports" },
      {
        name: "description",
        content:
          "Speak to our Vedic astrologers and customer care team — phone, WhatsApp, email or visit our Lucknow office.",
      },
      { property: "og:title", content: "Contact — Aastha Supports" },
      {
        property: "og:description",
        content: "Speak to our Vedic astrologers and customer care team.",
      },
      { property: "og:url", content: "https://www.aasthasupports.com/contact" },
      { property: "og:image", content: "https://www.aasthasupports.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.aasthasupports.com/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Aastha Supports",
          image: "https://www.aasthasupports.com/og-image.jpg",
          url: "https://www.aasthasupports.com/contact",
          telephone: "+91-82876-70827",
          email: "hello@aasthasupports.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Mampur bana",
            addressLocality: "Lucknow",
            addressRegion: "Uttar Pradesh",
            postalCode: "226201",
            addressCountry: "India",
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
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const submitForm = useServerFn(submitContactForm);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreedToPrivacy) {
      toast.error("Please agree to the Privacy Policy to submit.");
      return;
    }
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
      toast.success("Thank you! Your message has been sent.");
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
          <h1 className="font-sans font-bold text-4xl md:text-6xl mt-3 tracking-tight">Get in Touch</h1>
          <p className="mt-4 text-cream/80 max-w-xl mx-auto">
            Speak to our Vedic astrologers for guidance, or reach our dedicated care team for any order or product inquiry.
          </p>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10">
          {/* Form */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-soft border border-gold/20">
            <h2 className="font-sans font-bold text-2xl md:text-3xl text-maroon-deep tracking-tight">Send a Message</h2>
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
                      Name *
                    </label>
                    <input
                      required
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      className="mt-1.5 w-full rounded-md border border-gold/30 bg-cream px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase text-maroon-deep">
                      Phone *
                    </label>
                    <input
                      required
                      name="phone"
                      type="tel"
                      pattern="[0-9+ -]{10,15}"
                      title="Please enter a valid 10-digit phone number"
                      placeholder="+91 98765 43210"
                      className="mt-1.5 w-full rounded-md border border-gold/30 bg-cream px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-maroon-deep">
                    Email *
                  </label>
                  <input
                    required
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="mt-1.5 w-full rounded-md border border-gold/30 bg-cream px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-maroon-deep">
                    How can we help? *
                  </label>
                  <textarea
                    required
                    name="message"
                    rows={5}
                    placeholder="Tell us about your question or requirement..."
                    className="mt-1.5 w-full rounded-md border border-gold/30 bg-cream px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold resize-none"
                  />
                </div>
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="privacyConsent"
                    name="privacyConsent"
                    required
                    checked={agreedToPrivacy}
                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gold/40 text-maroon focus:ring-gold"
                  />
                  <label htmlFor="privacyConsent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <a href="/privacy-policy" className="underline text-maroon font-medium hover:text-gold">
                      Privacy Policy
                    </a>{" "}
                    and consent to having Aastha Supports contact me regarding this inquiry.
                  </label>
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
          <div className="space-y-5">
            {[
              {
                icon: Phone,
                title: "Call Us",
                v1: "+91 82876 70827",
                v2: "Mon–Sat · 9am – 8pm IST",
                href: "tel:+918287670827",
              },
              {
                icon: WhatsAppIcon,
                title: "WhatsApp",
                v1: "+91 82876 70827",
                v2: "Quick replies · Direct support",
                href: "https://wa.me/918287670827?text=Namaste!%20I%20have%20an%20inquiry%20regarding%20Aastha%20Supports.",
                isPopup: true,
              },
              {
                icon: Mail,
                title: "Email Us",
                v1: "hello@aasthasupports.com",
                v2: "Replied within 24 hours",
                href: "mailto:hello@aasthasupports.com",
              },
              {
                icon: MapPin,
                title: "Registered Address",
                v1: "Mampur bana, Lucknow",
                v2: "Uttar Pradesh 226201, India",
                href: undefined,
              },
            ].map((c) => {
              const Content = (
                <div
                  className={`bg-white rounded-xl p-5 border border-gold/20 shadow-soft flex gap-5 transition ${
                    c.href ? "hover:border-gold/50 hover:shadow-md cursor-pointer" : ""
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                    <c.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-lg md:text-xl text-maroon-deep">{c.title}</h3>
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

            {/* Grievance Officer Block (D-05) */}
            <div className="bg-white/80 rounded-xl p-5 border border-gold/30 shadow-soft">
              <h3 className="font-sans font-bold text-base text-maroon-deep">Grievance Redressal Officer</h3>
              <p className="text-xs text-muted-foreground mt-1">
                In accordance with Information Technology Act 2000 and Consumer Protection (E-Commerce) Rules 2020:
              </p>
              <div className="mt-2 text-xs space-y-1 text-foreground/80">
                <p><span className="font-semibold text-maroon-deep">Officer:</span> Grievance Officer, Aastha Supports</p>
                <p><span className="font-semibold text-maroon-deep">Email:</span> grievance@aasthasupports.com / hello@aasthasupports.com</p>
                <p><span className="font-semibold text-maroon-deep">Phone:</span> +91 82876 70827 (Mon–Sat, 9am–8pm IST)</p>
                <p className="text-[11px] text-muted-foreground pt-1">
                  Complaints acknowledged within 48 hours and resolved within 30 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
