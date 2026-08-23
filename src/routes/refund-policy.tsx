import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPolicy,
  head: () => ({
    meta: [
      { title: "Refund Policy — Aastha Support" },
      { name: "description", content: "Refund and cancellation policy for Aastha Support." },
      { name: "robots", content: "index, follow" },
    ],
  }),
});

function RefundPolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-display text-4xl text-maroon-deep mb-2">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: August 17, 2026</p>

        <div className="prose prose-stone max-w-none space-y-6">
          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Refund Eligibility</h2>
            <p>Refunds are available under the following conditions:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Product received is damaged or defective</li>
              <li>Wrong product delivered</li>
              <li>Product does not match description</li>
              <li>Pooja booking cancelled 24+ hours before scheduled time</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Non-Refundable Items</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Energized products (unless defective)</li>
              <li>Customized or personalized items</li>
              <li>Pooja bookings cancelled less than 24 hours before scheduled time</li>
              <li>Digital products (e-books, recorded poojas)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Refund Process</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact our support team within 7 days of delivery</li>
              <li>Provide order number and reason for refund</li>
              <li>Submit photos if claiming damage or wrong product</li>
              <li>Our team will review and approve eligible refunds within 2-3 business days</li>
              <li>Refund will be processed to original payment method within 7-10 business days</li>
            </ol>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Pooja Booking Refunds</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>24+ hours before:</strong> 100% refund</li>
              <li><strong>12-24 hours before:</strong> 50% refund</li>
              <li><strong>Less than 12 hours:</strong> No refund</li>
              <li>Rescheduling is free if done 24+ hours in advance</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Return Shipping</h2>
            <p>
              For defective or wrong products, we cover return shipping costs. For other returns, customer bears the shipping cost.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Refund Timeline</h2>
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
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Partial Refunds</h2>
            <p>Partial refunds may be issued for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Products with minor defects that don't affect functionality</li>
              <li>Products returned without original packaging</li>
              <li>Products showing signs of use beyond inspection</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Exchanges</h2>
            <p>
              We offer exchanges for defective products or wrong items delivered. Exchange requests must be made within 7 days of delivery.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Contact for Refunds</h2>
            <p>To initiate a refund, contact us at:</p>
            <ul className="list-none space-y-1">
              <li>Email: refunds@aasthasupport.com</li>
              <li>Phone: +91-99999-99999</li>
              <li>WhatsApp: +91-99999-99999</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}
