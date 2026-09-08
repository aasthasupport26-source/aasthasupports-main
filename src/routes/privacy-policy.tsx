import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicy,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Aastha Support" },
      { name: "description", content: "Privacy policy for Aastha Support. Learn how we collect, use, and protect your personal information." },
      { name: "robots", content: "index, follow" },
    ],
  }),
});

function PrivacyPolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl text-page font-sans">
        <h1 className="font-sans font-bold text-3xl md:text-4xl text-maroon-deep mb-2 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: August 17, 2026</p>

        <div className="prose prose-stone max-w-none space-y-6">
          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Introduction</h2>
            <p>
              Aastha Support ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Information We Collect</h2>
            <h3 className="font-sans font-bold text-base md:text-lg text-maroon mb-2">Personal Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Name, email address, phone number</li>
              <li>Shipping and billing addresses</li>
              <li>Payment information (processed securely through Razorpay)</li>
              <li>Birth details for pooja bookings (optional)</li>
            </ul>
            <h3 className="font-sans font-bold text-base md:text-lg text-maroon mb-2 mt-4">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>IP address, browser type, device information</li>
              <li>Cookies and usage data</li>
              <li>Pages visited and time spent on site</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Process orders and bookings</li>
              <li>Communicate about your purchases</li>
              <li>Provide customer support</li>
              <li>Send promotional emails (with your consent)</li>
              <li>Improve our services and website</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Data Sharing</h2>
            <p>We do not sell your personal information. We share data only with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Payment processors (Razorpay)</li>
              <li>Shipping partners</li>
              <li>Service providers who assist our operations</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Cookies</h2>
            <p>
              We use cookies to enhance your experience. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Children's Privacy</h2>
            <p>
              Our services are not intended for children under 13. We do not knowingly collect data from children.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Changes to This Policy</h2>
            <p>
              We may update this policy periodically. Changes will be posted on this page with an updated date.
            </p>
          </section>

          <section>
            <h2 className="font-sans font-bold text-xl md:text-2xl text-maroon-deep mb-3 tracking-tight">Contact Us</h2>
            <p>For privacy concerns or requests, contact us at:</p>
            <ul className="list-none space-y-1">
              <li>Email: aastha.support.26@gmail.com</li>
              <li>Phone: +91-82876-70827</li>
              <li>Address: Mampur bana, Lucknow, Uttar Pradesh 226201, India</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}
