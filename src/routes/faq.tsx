import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Aastha Supports" },
      {
        name: "description",
        content:
          "Find answers to frequently asked questions about rudraksha, gemstones, online pooja, shipping, returns and Vedic certification at Aastha Supports.",
      },
      { property: "og:title", content: "FAQ — Aastha Supports" },
      {
        property: "og:description",
        content:
          "Answers on rudraksha, gemstones, online pooja, shipping, returns and Vedic certification.",
      },
      { property: "og:url", content: "https://www.aasthasupports.com/faq" },
      { property: "og:image", content: "https://www.aasthasupports.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.aasthasupports.com/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqCategories.flatMap((c) =>
            c.items.map((i) => ({
              "@type": "Question",
              name: i.q,
              acceptedAnswer: { "@type": "Answer", text: i.a },
            })),
          ),
        }),
      },
    ],
  }),
  component: FaqPage,
});

const faqCategories = [
  {
    title: "Orders & Payments",
    items: [
      {
        q: "How do I place an order on Aastha Supports?",
        a: "Simply browse our categories, select your desired product, add to cart, and proceed to checkout. We accept UPI, Credit/Debit cards, Net Banking, and Cash on Delivery for orders above ₹999.",
      },
      {
        q: "Is Cash on Delivery available?",
        a: "Yes, COD is available for physical product orders above ₹999 across most pin codes in India.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "Orders can be modified or cancelled within 2 hours of placement, provided they haven't been dispatched. Contact our care team immediately at hello@aasthasupports.com or WhatsApp us.",
      },
    ],
  },
  {
    title: "Rudraksha & Gemstones",
    items: [
      {
        q: "How do I know my rudraksha is authentic?",
        a: "Every rudraksha comes with authenticity assurance. Lab Testing Certification (IGL / GJSPC) and X-ray verification are available on request to verify the internal chamber (mukhi) count. Additionally, each bead is energised through traditional Vedic rituals.",
      },
      {
        q: "What is the difference between Indonesian and Nepali rudraksha?",
        a: "Nepali rudraksha are generally larger, have deeper grooves (mukhi lines), and are considered more potent for spiritual practices. Indonesian rudraksha are smaller, lighter, and more affordable while still being authentic. Certification is available on request for both varieties.",
      },
      {
        q: "How do I choose the right gemstone for myself?",
        a: "We offer astrological guidance with our in-house Vedic astrologers. Share your birth details (date, time, place) and our experts will suggest the most suitable Navratna gemstone based on your kundali and planetary positions.",
      },
      {
        q: "Do gemstones come with a lab certificate?",
        a: "Lab testing certification is available on request from recognized gemological laboratories for every gemstone. Every gem is verified for natural origin and purity before dispatch.",
      },
    ],
  },
  {
    title: "Online Pooja Services",
    items: [
      {
        q: "How does Online Pooja work?",
        a: "This service is launching soon. Once live, learned pandits will perform sacred rituals on auspicious muhurats. You will receive a live video link, sankalpa darshan, and sanctified prasad delivered to your home.",
      },
      {
        q: "Can I choose the date and time for my pooja?",
        a: "This service is launching soon. Once available, you will be able to select your preferred auspicious date and time, with personalized guidance from our Vedic pandits.",
      },
      {
        q: "What is included in the pooja package?",
        a: "This service is launching soon. Each pooja package will include live sankalpa with your name and gotra, complete mantra chanting, rituals by Vedic scholars, and prasad dispatch.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "We dispatch within 24–48 hours of order confirmation. Delivery time is 3–5 business days for metro cities and 5–7 days for tier-2/3 locations.",
      },
      {
        q: "Is shipping free?",
        a: "Yes, we offer free pan-India shipping on all orders above ₹999. For orders below ₹999, a flat shipping fee of ₹99 applies.",
      },
      {
        q: "How are spiritual products packed?",
        a: "Products are packed in sacred, tamper-proof packaging with cushioned interiors. Rudraksha and gemstones come in a secure velvet pouch or box, treated with respect and purity before dispatch.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day easy return policy for all physical products. Items must be unused, in original packaging, with all tags and certificates intact. (Online pooja policies apply once the service launches.)",
      },
      {
        q: "How do I initiate a return?",
        a: "Contact our support team via WhatsApp or email hello@aasthasupports.com with your order ID. We will arrange a reverse pickup from your address (where serviceable). Refunds are processed to your original payment method within 5–7 business days after product receipt.",
      },
      {
        q: "What if I receive a damaged or wrong product?",
        a: "In the rare case of damage or incorrect delivery, we offer an immediate replacement or full refund — your choice. Please share photos within 24 hours of delivery for faster resolution.",
      },
    ],
  },
  {
    title: "Vedic Consecration & Energisation",
    items: [
      {
        q: "What does 'Vedic Energised' mean?",
        a: "Vedic Energised means the product has been abhimantrit (ritually consecrated) by learned pandits through specific mantras and traditional rituals. This process invokes divine blessings and positive spiritual energy before dispatch.",
      },
      {
        q: "Can I get my own rudraksha energised by Aastha Supports?",
        a: "Yes, we offer Vedic Energisation assistance. Our pandits perform traditional Vedic rituals with devotion and reverence.",
      },
      {
        q: "Are your pandits qualified?",
        a: "All our pandits are verified scholars with degrees in Shastri/Acharya from recognized Vedic institutions. They have years of experience in performing authentic Vedic rituals.",
      },
    ],
  },
];

function FaqPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-maroon-deep py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 font-devanagari text-[20rem] text-gold leading-none flex items-center justify-center pointer-events-none select-none">
          ॐ
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <HelpCircle className="w-12 h-12 text-gold mx-auto mb-5" />
          <p className="text-gold tracking-[0.3em] text-xs">|| ज्ञानं परमं बलम् ||</p>
          <h1 className="font-sans font-bold text-3xl md:text-5xl text-cream mt-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-cream/75 max-w-xl mx-auto">
            Everything you need to know about our products, services, shipping, returns, and Vedic
            practices.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4 max-w-4xl">
          {faqCategories.map((cat) => (
            <div key={cat.title} className="mb-12 last:mb-0">
              <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-5 pb-2 border-b border-gold/30 tracking-tight">
                {cat.title}
              </h2>
              <Accordion type="multiple" className="w-full">
                {cat.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`${cat.title}-${i}`}
                    className="border-b border-gold/15"
                  >
                    <AccordionTrigger className="text-maroon-deep hover:text-gold font-sans font-bold text-left py-5">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-royal text-cream">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-sans font-bold text-2xl md:text-3xl tracking-tight">Still have questions?</h2>
          <p className="mt-4 text-cream/80">
            Our dedicated support team is here to help. Reach out via WhatsApp, email, or call us
            directly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <a
              href="mailto:hello@aasthasupports.com"
              className="bg-gold text-maroon-deep px-8 py-3.5 rounded-md tracking-widest text-xs uppercase font-medium hover:bg-gold-soft transition shadow-gold"
            >
              Email Us
            </a>
            <a
              href="tel:+918287670827"
              className="border border-gold/60 px-8 py-3.5 rounded-md tracking-widest text-xs uppercase hover:bg-gold/15 transition"
            >
              Call Support
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
