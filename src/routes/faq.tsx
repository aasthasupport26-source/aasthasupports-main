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
      { title: "FAQ — Aastha Support" },
      {
        name: "description",
        content:
          "Find answers to frequently asked questions about rudraksha, gemstones, online pooja, shipping, returns and Vedic certification at Aastha Support.",
      },
      { property: "og:title", content: "FAQ — Aastha Support" },
      {
        property: "og:description",
        content:
          "Answers on rudraksha, gemstones, online pooja, shipping, returns and Vedic certification.",
      },
      { property: "og:url", content: "https://aasthasupport.com/faq" },
    ],
    links: [{ rel: "canonical", href: "https://aasthasupport.com/faq" }],
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
        q: "How do I place an order on Aastha Support?",
        a: "Simply browse our categories, select your desired product or pooja service, add to cart, and proceed to checkout. We accept UPI, Credit/Debit cards, Net Banking, and Cash on Delivery for orders above ₹999.",
      },
      {
        q: "Is Cash on Delivery available?",
        a: "Yes, COD is available for orders above ₹999 across most pin codes in India. For spiritual services like Online Pooja, full advance payment is required to confirm the booking.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "Orders can be modified or cancelled within 2 hours of placement, provided they haven't been dispatched or the pooja hasn't started. Contact our care team immediately at care@aasthasupport.com or WhatsApp us.",
      },
    ],
  },
  {
    title: "Rudraksha & Gemstones",
    items: [
      {
        q: "How do I know my rudraksha is authentic?",
        a: "Every rudraksha comes with a Lab Testing Certificate from a NABL-accredited laboratory. We also provide X-ray verification images showing the internal chamber (mukhi) count. Additionally, each bead is energised through Vedic rituals at our Haridwar ashram.",
      },
      {
        q: "What is the difference between Indonesian and Nepali rudraksha?",
        a: "Nepali rudraksha are generally larger, have deeper grooves (mukhi lines), and are considered more potent for spiritual practices. Indonesian rudraksha are smaller, lighter, and more affordable while still being authentic. Both are lab-certified by us.",
      },
      {
        q: "How do I choose the right gemstone for myself?",
        a: "We offer a free astrological consultation with our in-house Vedic astrologers. Share your birth details (date, time, place) and our experts will recommend the most suitable Navratna gemstone based on your kundali and planetary positions.",
      },
      {
        q: "Do gemstones come with a lab certificate?",
        a: "Yes, every gemstone (Manik, Moti, Moonga, Panna, Pukhraj, Neelam, Gomed, Lehsunia) comes with a certificate of authenticity from a recognized gemological laboratory. Certificate details are mentioned on the product page.",
      },
    ],
  },
  {
    title: "Online Pooja Services",
    items: [
      {
        q: "How does Online Pooja work?",
        a: "Once you book a pooja, our pandit ji performs the ritual at our Haridwar ashram on the auspicious date you choose. You receive a live video link, photos, and a sankalpa video recording. Prasad is shipped to your address within 7 days.",
      },
      {
        q: "Can I choose the date and time for my pooja?",
        a: "Absolutely. During checkout, you can select your preferred muhurat. Our astrologer team also suggests the most auspicious date based on your nakshatra if you need guidance.",
      },
      {
        q: "What is included in the pooja package?",
        a: "Every online pooja includes: live video darshan, sankalpa with your name and gotra, complete ritual performance by learned pandits, prasad dispatch, and a digital certificate of completion. Some premium packages include additional havan and daan.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "We dispatch within 24–48 hours of order confirmation. Delivery time is 3–5 business days for metro cities and 5–7 days for tier-2/3 locations. Online pooja prasad ships within 7 days after ritual completion.",
      },
      {
        q: "Is shipping free?",
        a: "Yes, we offer free pan-India shipping on all orders above ₹999. For orders below ₹999, a flat shipping fee of ₹99 applies.",
      },
      {
        q: "How are spiritual products packed?",
        a: "Products are packed in sacred, tamper-proof packaging with cushioned interiors. Rudraksha and gemstones come in a velvet box with the certificate. The package is blessed with Ganga jal before dispatch.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day no-questions-asked return policy for all physical products. Items must be unused and in original packaging with the certificate intact. Online pooja services are non-refundable once the ritual has begun, but can be rescheduled.",
      },
      {
        q: "How do I initiate a return?",
        a: "Contact our support team via WhatsApp or email care@aasthasupport.com with your order ID. We will arrange a reverse pickup within 48 hours. Refunds are processed to your original payment method within 5–7 business days after product receipt.",
      },
      {
        q: "What if I receive a damaged or wrong product?",
        a: "In the rare case of damage or incorrect delivery, we offer instant replacement or full refund — your choice. Please share photos within 24 hours of delivery for faster resolution.",
      },
    ],
  },
  {
    title: "Vedic Certification & Energisation",
    items: [
      {
        q: "What does 'Vedic Energised' mean?",
        a: "Vedic Energised means the product has been abhimantrit (ritually consecrated) by learned pandits through specific mantras and havan. This process is believed to activate the spiritual energy of the item, making it more effective for the wearer.",
      },
      {
        q: "Can I get my own rudraksha energised by Aastha Support?",
        a: "Yes, we offer a standalone Vedic Energisation service. You can ship your rudraksha or mala to our Haridwar ashram. Our pandits will perform the rituals and return it with a completion certificate.",
      },
      {
        q: "Are your pandits qualified?",
        a: "All our pandits are verified scholars with degrees in Shastri/Acharya from recognized Vedic universities like Sampurnanand Sanskrit Vishwavidyalaya. They have years of experience in performing Vedic rituals.",
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
          <h1 className="font-display text-4xl md:text-5xl text-cream mt-4">
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
              <h2 className="font-display text-2xl text-maroon-deep mb-5 pb-2 border-b border-gold/30">
                {cat.title}
              </h2>
              <Accordion type="multiple" className="w-full">
                {cat.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`${cat.title}-${i}`}
                    className="border-b border-gold/15"
                  >
                    <AccordionTrigger className="text-maroon-deep hover:text-gold font-medium text-left py-5">
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
          <h2 className="font-display text-3xl">Still have questions?</h2>
          <p className="mt-4 text-cream/80">
            Our dedicated support team is here to help. Reach out via WhatsApp, email, or call us
            directly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <a
              href="mailto:care@aasthasupport.com"
              className="bg-gold text-maroon-deep px-8 py-3.5 rounded-md tracking-widest text-xs uppercase font-medium hover:bg-gold-soft transition shadow-gold"
            >
              Email Us
            </a>
            <a
              href="tel:+919999999999"
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
