import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfService,
  head: () => ({
    meta: [
      { title: "Terms of Service — Aastha Support" },
      { name: "description", content: "Terms and conditions for using Aastha Support services." },
      { name: "robots", content: "index, follow" },
    ],
  }),
});

function TermsOfService() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-display text-4xl text-maroon-deep mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: August 17, 2026</p>

        <div className="prose prose-stone max-w-none space-y-6">
          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Acceptance of Terms</h2>
            <p>
              By accessing and using Aastha Support's website and services, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Services</h2>
            <p>Aastha Support provides:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Sale of certified spiritual products (rudraksha, gemstones, malas, yantras)</li>
              <li>Online pooja booking and live streaming services</li>
              <li>Spiritual consultation and guidance</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Product Authenticity</h2>
            <p>
              All products are certified and energized by Vedic pandits. We guarantee authenticity but spiritual results may vary based on individual faith and circumstances.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Orders and Payment</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All prices are in Indian Rupees (INR)</li>
              <li>Payment is processed securely through Razorpay</li>
              <li>Orders are confirmed upon successful payment</li>
              <li>We reserve the right to cancel orders in case of pricing errors</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Pooja Bookings</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Bookings must be made at least 48 hours in advance</li>
              <li>Rescheduling is subject to availability</li>
              <li>Cancellations made 24 hours before the scheduled time are eligible for refund</li>
              <li>Live streaming links will be shared 1 hour before the pooja</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Shipping and Delivery</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>We ship pan-India through trusted courier partners</li>
              <li>Delivery typically takes 5-7 business days</li>
              <li>Shipping charges apply as per product weight and location</li>
              <li>International shipping available on request</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Returns and Refunds</h2>
            <p>Please refer to our <a href="/returns-policy" className="text-maroon hover:text-maroon-deep underline">Returns Policy</a> for detailed information.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use our services for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of the website</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Intellectual Property</h2>
            <p>
              All content on this website, including text, images, logos, and designs, is the property of Aastha Support and protected by copyright laws.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Limitation of Liability</h2>
            <p>
              Aastha Support is not liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Spiritual products are sold for faith-based purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Haridwar, Uttarakhand.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-maroon-deep mb-3">Contact Information</h2>
            <p>For questions about these terms, contact us at:</p>
            <ul className="list-none space-y-1">
              <li>Email: aastha.support.26@gmail.com</li>
              <li>Phone: +91-99999-99999</li>
              <li>Address: Aastha Bhawan, Haridwar, Uttarakhand 249401, India</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}
