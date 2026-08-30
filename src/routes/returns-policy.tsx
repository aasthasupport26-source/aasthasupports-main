import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ShieldCheck, Truck, RotateCcw, Clock, PackageCheck, Ban, Lock, Globe } from "lucide-react";

export const Route = createFileRoute("/returns-policy")({
  head: () => ({
    meta: [
      { title: "Returns, Shipping & Policies — Aastha Support" },
      {
        name: "description",
        content:
          "Read Aastha Support's returns, shipping, cancellation, privacy policy and terms of service. 7-day easy returns. Free shipping above ₹999.",
      },
      { property: "og:title", content: "Returns, Shipping & Policies — Aastha Support" },
      {
        property: "og:description",
        content: "7-day easy returns. Free shipping above ₹999. Read our complete policies.",
      },
      { property: "og:url", content: "https://aasthasupport.com/returns-policy" },
    ],
    links: [{ rel: "canonical", href: "https://aasthasupport.com/returns-policy" }],
  }),
  component: ReturnsPolicyPage,
});

const policySections = [
  {
    id: "returns",
    icon: RotateCcw,
    title: "Return & Refund Policy",
    content: [
      {
        heading: "7-Day No-Questions-Asked Returns",
        text: "We accept returns within 7 days of delivery for all physical products (rudraksha, malas, bracelets, gemstones, yantras). The product must be unused, in original packaging, and include all certificates and tags.",
      },
      {
        heading: "How to Return",
        text: "Contact us via WhatsApp or email aastha.support.26@gmail.com with your order ID. We will arrange a free reverse pickup from your address. Once the product is received and inspected, your refund is initiated within 48 hours.",
      },
      {
        heading: "Refund Timeline",
        text: "Refunds are processed to the original payment method within 5–7 business days. For COD orders, we request your UPI ID or bank details for the refund transfer.",
      },
      {
        heading: "Non-Returnable Items",
        text: "Online pooja services that have already commenced, prasad after dispatch, personalised/energised items where the customer name has been inscribed, and items damaged due to customer misuse.",
      },
    ],
  },
  {
    id: "shipping",
    icon: Truck,
    title: "Shipping Policy",
    content: [
      {
        heading: "Free Shipping",
        text: "We offer free pan-India shipping on all orders above ₹999. For orders below ₹999, a flat shipping fee of ₹99 applies.",
      },
      {
        heading: "Dispatch Time",
        text: "Orders are dispatched within 24–48 hours (excluding Sundays and public holidays). Online pooja prasad is dispatched within 7 days after the ritual is completed.",
      },
      {
        heading: "Delivery Timeline",
        text: "Metro cities: 3–5 business days. Tier-2/3 cities: 5–7 business days. Remote locations: 7–10 business days. We partner with Blue Dart, Delhivery, and India Post for reliable delivery.",
      },
      {
        heading: "Tracking",
        text: "Once dispatched, you will receive an email and WhatsApp message with your tracking number and courier partner details.",
      },
    ],
  },
  {
    id: "cancellation",
    icon: Ban,
    title: "Cancellation Policy",
    content: [
      {
        heading: "Order Cancellation",
        text: "Orders can be cancelled within 2 hours of placement for a full refund, provided the order has not been dispatched. After dispatch, our standard return policy applies.",
      },
      {
        heading: "Pooja Booking Cancellation",
        text: "Online pooja bookings can be cancelled up to 24 hours before the scheduled muhurat for a full refund. Cancellations within 24 hours receive a 50% refund. No refund if the ritual has already begun.",
      },
      {
        heading: "Failed Delivery",
        text: "If delivery fails due to an incorrect address or unavailability, we attempt re-delivery once. After two failed attempts, the order is returned to us and a refund (minus shipping) is processed.",
      },
    ],
  },
  {
    id: "privacy",
    icon: Lock,
    title: "Privacy Policy",
    content: [
      {
        heading: "Data We Collect",
        text: "We collect your name, address, phone number, and email for order fulfillment. For pooja services, we also collect birth details (date, time, place) for sankalpa and astrological recommendations.",
      },
      {
        heading: "How We Use Your Data",
        text: "Your data is used solely for order processing, delivery, and customer support. Birth details are shared only with our astrologers and pandits for ritual and recommendation purposes.",
      },
      {
        heading: "Data Security",
        text: "We use industry-standard SSL encryption for all transactions. Your payment details are processed securely via Razorpay and never stored on our servers.",
      },
      {
        heading: "Third Parties",
        text: "We do not sell or rent your personal data. We only share delivery details with our logistics partners (Blue Dart, Delhivery) and payment data with Razorpay.",
      },
    ],
  },
  {
    id: "terms",
    icon: Globe,
    title: "Terms of Service",
    content: [
      {
        heading: "Product Disclaimer",
        text: "Spiritual products are meant for faith and wellness support. They are not substitutes for medical treatment. We recommend consulting healthcare professionals for health concerns.",
      },
      {
        heading: "Authenticity Guarantee",
        text: "Every product is sourced from verified origins and lab-tested. In the rare case of a discrepancy, we offer immediate replacement or full refund.",
      },
      {
        heading: "Intellectual Property",
        text: "All content, images, and branding on aasthasupport.com are the property of Aastha Support. Unauthorised reproduction is strictly prohibited.",
      },
      {
        heading: "Governing Law",
        text: "These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Haridwar, Uttarakhand.",
      },
    ],
  },
];

const trustHighlights = [
  { icon: ShieldCheck, title: "Secure Checkout", desc: "SSL encrypted payments" },
  { icon: PackageCheck, title: "Insured Delivery", desc: "Every package insured" },
  { icon: Clock, title: "24/7 Support", desc: "WhatsApp & call support" },
  { icon: RotateCcw, title: "7-Day Returns", desc: "No questions asked" },
];

function ReturnsPolicyPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-maroon-deep py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 font-devanagari text-[20rem] text-gold leading-none flex items-center justify-center pointer-events-none select-none">
          ॐ
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <p className="text-gold tracking-[0.3em] text-xs">|| विश्वास एवं सुरक्षा ||</p>
          <h1 className="font-display text-4xl md:text-5xl text-cream mt-4">
            Returns, Shipping & Policies
          </h1>
          <p className="mt-4 text-cream/75 max-w-2xl mx-auto">
            Transparency is the foundation of trust. Read our complete policies on returns,
            shipping, cancellations, privacy, and terms.
          </p>
        </div>
      </section>

      {/* Trust highlights */}
      <section className="bg-cream border-b border-gold/15">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustHighlights.map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-maroon-deep/5 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-maroon-deep" />
                </div>
                <div>
                  <p className="font-medium text-sm text-maroon-deep">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Policy sections */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4 max-w-4xl">
          {policySections.map((section) => (
            <div key={section.id} id={section.id} className="mb-16 last:mb-0 scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-gold" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-maroon-deep">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-6">
                {section.content.map((block, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 border border-gold/15 hover:border-gold/40 transition shadow-soft"
                  >
                    <h3 className="font-display text-lg text-maroon-deep mb-2">{block.heading}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{block.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-royal text-cream">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-3xl">Need help with an order?</h2>
          <p className="mt-4 text-cream/80">
            Our support team is available 24/7. Reach out via WhatsApp, email, or phone — we
            typically respond within minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <a
              href="tel:+919999999999"
              className="bg-gold text-maroon-deep px-8 py-3.5 rounded-md tracking-widest text-xs uppercase font-medium hover:bg-gold-soft transition shadow-gold"
            >
              Call Now
            </a>
            <a
              href="mailto:aastha.support.26@gmail.com"
              className="border border-gold/60 px-8 py-3.5 rounded-md tracking-widest text-xs uppercase hover:bg-gold/15 transition"
            >
              Email Support
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
