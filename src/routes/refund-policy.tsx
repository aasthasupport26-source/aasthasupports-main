import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPolicy,
  head: () => ({
    meta: [
      { title: "Refund Policy — Aastha Supports" },
      { name: "description", content: "Refund and cancellation policy for Aastha Supports. 7-day easy returns on physical products." },
      { property: "og:title", content: "Refund Policy — Aastha Supports" },
      { property: "og:description", content: "Refund and cancellation policy for Aastha Supports. 7-day easy returns on physical products." },
      { property: "og:url", content: "https://www.aasthasupports.com/refund-policy" },
      { property: "og:image", content: "https://www.aasthasupports.com/og-image.jpg" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.aasthasupports.com/refund-policy" }],
  }),
});

function RefundPolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl text-page font-sans">
        <h1 className="font-sans font-bold text-3xl md:text-4xl text-maroon-deep mb-2 tracking-tight">Refund & Return Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: August 17, 2026</p>

        <div className="prose prose-stone max-w-none space-y-6">
          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">7-Day Easy Returns Eligibility</h2>
            <p>We accept returns within 7 days of delivery for physical products (rudraksha, malas, bracelets, gemstones, yantras) under the following conditions:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Item is unused, unworn, and in original packaging</li>
              <li>All tags, boxes, and certificates (if provided) are intact</li>
              <li>Product received is damaged, defective, or incorrect</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Non-Refundable Items</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Customized, name-inscribed, or personalized items</li>
              <li>Prasad items after dispatch</li>
              <li>Online pooja services that have already commenced (applicable once the Online Pooja service launches)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Refund Process & Pickup</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact our support team within 7 days of delivery via WhatsApp or email hello@aasthasupports.com with your order ID</li>
              <li>We will arrange a free reverse pickup from your address (where serviceable)</li>
              <li>Once the product is received and inspected at our facility, your refund is approved within 48 hours</li>
              <li>Refund will be credited to your original payment method (or UPI/bank transfer for COD orders) within 5–7 business days</li>
            </ol>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Pooja Booking Cancellations</h2>
            <p className="text-xs text-gold font-medium mb-2">✦ Applicable once the Online Pooja service launches</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>24+ hours before muhurat:</strong> 100% full refund</li>
              <li><strong>Within 24 hours of muhurat:</strong> 50% partial refund</li>
              <li><strong>After ritual has commenced:</strong> Non-refundable</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Return Shipping</h2>
            <p>
              For defective or wrong products, we cover return shipping costs. For other returns, customer bears the shipping cost.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Refund Timeline</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Credit/Debit Card: 5-7 business days</li>
              <li>UPI/Net Banking: 3-5 business days</li>
              <li>Wallet: 2-3 business days</li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              Note: Bank processing times may vary. Contact your bank if refund is delayed beyond stated timeline.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Partial Refunds</h2>
            <p>Partial refunds may be issued for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Products with minor defects that don't affect functionality</li>
              <li>Products returned without original packaging</li>
              <li>Products showing signs of use beyond inspection</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Exchanges</h2>
            <p>
              We offer exchanges for defective products or wrong items delivered. Exchange requests must be made within 7 days of delivery.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Contact for Refunds</h2>
            <p>To initiate a refund, contact us at:</p>
            <ul className="list-none space-y-1">
              <li>Email: hello@aasthasupports.com</li>
              <li>Phone: +91-82876-70827</li>
              <li>WhatsApp: +91-82876-70827</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}
