import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/shipping-policy")({
  component: ShippingPolicy,
  head: () => ({
    meta: [
      { title: "Shipping Policy — Aastha Support" },
      { name: "description", content: "Shipping and delivery information for Aastha Support orders." },
      { name: "robots", content: "index, follow" },
    ],
  }),
});

function ShippingPolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-display text-4xl text-maroon-deep mb-2">Shipping Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: August 17, 2026</p>

        <div className="prose prose-stone max-w-none space-y-6">
          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Shipping Coverage</h2>
            <p>
              We ship to all locations across India. International shipping is available on request for select products.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Delivery Timeline</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Metro Cities:</strong> 3-5 business days</li>
              <li><strong>Other Cities:</strong> 5-7 business days</li>
              <li><strong>Remote Areas:</strong> 7-10 business days</li>
              <li><strong>International:</strong> 10-15 business days</li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              Note: Delivery times are estimates and may vary due to courier delays, weather conditions, or other unforeseen circumstances.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Shipping Charges</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Orders above ₹999: <strong>Free Shipping</strong></li>
              <li>Orders below ₹999: ₹50-150 based on weight and location</li>
              <li>Express delivery available at additional cost</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Order Processing</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Orders are processed within 24-48 hours of payment confirmation</li>
              <li>Energization rituals may add 1-2 days to processing time</li>
              <li>You will receive a tracking number via email/SMS once shipped</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Packaging</h2>
            <p>
              All products are carefully packaged to ensure safe delivery. Fragile items like yantras and gemstones receive extra protective packaging.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Tracking Your Order</h2>
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
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Delivery Issues</h2>
            <p>If you face any delivery issues:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Contact our support team immediately</li>
              <li>Provide your order number and tracking details</li>
              <li>We will coordinate with the courier partner to resolve the issue</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Undelivered Packages</h2>
            <p>
              If a package is returned to us due to incorrect address or failed delivery attempts, we will contact you to arrange re-shipment. Additional shipping charges may apply.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Damaged or Lost Shipments</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Report damaged items within 48 hours of delivery</li>
              <li>Provide photos of the damaged product and packaging</li>
              <li>We will arrange replacement or refund as per our returns policy</li>
              <li>Lost shipments will be investigated with the courier partner</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Contact Us</h2>
            <p>For shipping queries, contact us at:</p>
            <ul className="list-none space-y-1">
              <li>Email: shipping@aasthasupport.com</li>
              <li>Phone: +91-99999-99999</li>
              <li>WhatsApp: +91-99999-99999</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}
