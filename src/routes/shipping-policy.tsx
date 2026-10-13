import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/shipping-policy")({
  component: ShippingPolicy,
  head: () => ({
    meta: [
      { title: "Shipping Policy — Aastha Supports" },
      { name: "description", content: "Shipping and delivery information for Aastha Supports orders across India. Free shipping above ₹999." },
      { property: "og:title", content: "Shipping Policy — Aastha Supports" },
      { property: "og:description", content: "Shipping and delivery information for Aastha Supports orders across India. Free shipping above ₹999." },
      { property: "og:url", content: "https://www.aasthasupports.com/shipping-policy" },
      { property: "og:image", content: "https://www.aasthasupports.com/og-image.jpg" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.aasthasupports.com/shipping-policy" }],
  }),
});

function ShippingPolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl text-page font-sans">
        <h1 className="font-sans font-bold text-3xl md:text-4xl text-maroon-deep mb-2 tracking-tight">Shipping Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: August 17, 2026</p>

        <div className="prose prose-stone max-w-none space-y-6">
          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Shipping Coverage & Partners</h2>
            <p>
              We ship to serviceable locations across India in partnership with reputable logistics carriers including Blue Dart, Delhivery, and India Post.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Delivery Timeline</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Metro Cities:</strong> 3-5 business days</li>
              <li><strong>Tier-2 & Tier-3 Cities:</strong> 5-7 business days</li>
              <li><strong>Remote Areas:</strong> 7-10 business days</li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              Note: Delivery times are estimates from the date of dispatch and may vary slightly due to local transit factors or weather conditions.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Shipping Charges</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Orders of ₹999 or more: <strong>FREE Pan-India Shipping</strong></li>
              <li>Orders below ₹999: Flat fee of <strong>₹99</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Order Processing</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Orders are processed within 24-48 hours of payment confirmation</li>
              <li>Energization rituals may add 1-2 days to processing time</li>
              <li>You will receive a tracking number via email/SMS once shipped</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Packaging</h2>
            <p>
              All products are carefully packaged to ensure safe delivery. Fragile items like yantras and gemstones receive extra protective packaging.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Tracking Your Order</h2>
            <p>
              Track your order using the tracking number provided via:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email confirmation</li>
              <li>SMS notification</li>
              <li>Your account dashboard</li>
              <li>Our <a href="/track-order" className="text-maroon hover:text-maroon-deep underline">Track Order</a> page</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Delivery Issues</h2>
            <p>If you face any delivery issues:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Contact our support team immediately</li>
              <li>Provide your order number and tracking details</li>
              <li>We will coordinate with the courier partner to resolve the issue</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Undelivered Packages</h2>
            <p>
              If a package is returned to us due to incorrect address or failed delivery attempts, we will contact you to arrange re-shipment. Additional shipping charges may apply.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Damaged or Lost Shipments</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Report damaged items within 48 hours of delivery</li>
              <li>Provide photos of the damaged product and packaging</li>
              <li>We will arrange replacement or refund as per our returns policy</li>
              <li>Lost shipments will be investigated with the courier partner</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Contact Us</h2>
            <p>For shipping queries, contact us at:</p>
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
