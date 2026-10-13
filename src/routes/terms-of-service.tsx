import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfService,
  head: () => ({
    meta: [
      { title: "Terms of Service — Aastha Supports" },
      { name: "description", content: "Terms and conditions for using Aastha Supports services and website." },
      { property: "og:title", content: "Terms of Service — Aastha Supports" },
      { property: "og:description", content: "Terms and conditions for using Aastha Supports services and website." },
      { property: "og:url", content: "https://www.aasthasupports.com/terms-of-service" },
      { property: "og:image", content: "https://www.aasthasupports.com/og-image.jpg" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.aasthasupports.com/terms-of-service" }],
  }),
});

function TermsOfService() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl text-page font-sans">
        <h1 className="font-sans font-bold text-3xl md:text-4xl text-maroon-deep mb-2 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: August 17, 2026</p>

        <div className="prose prose-stone max-w-none space-y-6">
          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Acceptance of Terms</h2>
            <p>
              By accessing and using Aastha Supports' website and services, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Services</h2>
            <p>Aastha Supports provides:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Sale of authentic spiritual products (rudraksha, gemstones, malas, yantras) with certification available on request</li>
              <li>Online pooja booking and live streaming services (launching soon)</li>
              <li>Spiritual consultation and Vedic guidance</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Product Authenticity & Disclaimer</h2>
            <p>
              Every product is sourced from verified origins and quality-checked. Lab testing and certification are available on request. Items are energized through traditional Vedic rituals. Spiritual products are sold for faith and wellness support; they are not a substitute for medical treatment. Individual experiences and results may vary.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Orders and Payment</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All prices are in Indian Rupees (INR) and inclusive of applicable taxes</li>
              <li>Payment is processed securely through Razorpay</li>
              <li>Orders are confirmed upon successful payment verification</li>
              <li>We reserve the right to cancel orders in case of unforeseen stock discrepancies or pricing errors</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Pooja Bookings</h2>
            <p className="text-xs text-gold font-medium mb-2">✦ Applicable once the Online Pooja service launches</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Bookings must be made in advance for scheduled muhurats</li>
              <li>Rescheduling is subject to availability</li>
              <li>Cancellations made 24 hours before the scheduled time are eligible for refund</li>
              <li>Live streaming links and sankalpa details will be shared prior to the ritual</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Shipping and Delivery</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>We ship pan-India through trusted courier partners (Blue Dart, Delhivery, India Post)</li>
              <li>Free shipping on all orders above ₹999; flat ₹99 for orders below ₹999</li>
              <li>Standard delivery takes 3–7 business days depending on location</li>
              <li>Tracking details are provided via email and WhatsApp once dispatched</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Returns and Refunds</h2>
            <p>We provide a 7-day easy return policy on unused physical products in original condition. Please refer to our <a href="/returns-policy" className="text-maroon hover:text-maroon-deep underline">Returns Policy</a> and <a href="/refund-policy" className="text-maroon hover:text-maroon-deep underline">Refund Policy</a> for full details.</p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use our services for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of the website</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Intellectual Property</h2>
            <p>
              All content on this website, including text, images, logos, and designs, is the property of Aastha Supports and protected by copyright laws.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Limitation of Liability</h2>
            <p>
              Aastha Supports is not liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Spiritual products are sold for faith-based purposes.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Lucknow, Uttar Pradesh.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Contact Information</h2>
            <p>For questions about these terms, contact us at:</p>
            <ul className="list-none space-y-1">
              <li>Email: hello@aasthasupports.com</li>
              <li>Phone: +91-82876-70827</li>
              <li>Address: Mampur bana, Lucknow, Uttar Pradesh 226201, India</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}
