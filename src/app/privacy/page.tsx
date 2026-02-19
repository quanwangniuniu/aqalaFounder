import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Aqala Privacy Policy: how we collect, use, and protect your data. Covers account data, cookies, Google AdSense, and your rights.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center justify-between max-w-[554px] mx-auto">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-semibold text-white">Privacy Policy</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-[554px] mx-auto prose prose-invert prose-sm space-y-6 text-white/80">
          <p className="text-white/60 text-xs">
            Last updated: February 2025
          </p>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">1. Introduction</h2>
            <p>
              Aqala (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates aqala.org and the Aqala app, providing real-time translation and multilingual communication. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">2. Information We Collect</h2>
            <p className="mb-2">We may collect:</p>
            <ul className="list-disc pl-5 space-y-1 text-white/70">
              <li><strong className="text-white/80">Account data:</strong> When you sign up (e.g., email, display name, profile photo), we store this via Firebase Authentication.</li>
              <li><strong className="text-white/80">Usage data:</strong> How you use the app (e.g., features used, sessions) to improve our service and fix issues.</li>
              <li><strong className="text-white/80">Device and technical data:</strong> Device type, browser, and similar technical information.</li>
              <li><strong className="text-white/80">Content you provide:</strong> Messages, room names, and other content you create within the service, stored to provide the product.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">3. Cookies and Similar Technologies</h2>
            <p>
              We use cookies and similar technologies for authentication, preferences, and security. Third-party services we use (including Google AdSense and analytics) may set their own cookies. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">4. How We Use Your Information</h2>
            <p>
              We use collected information to provide and improve Aqala, personalize your experience, process payments (via Stripe), communicate with you, enforce our terms, and comply with law. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">5. Google AdSense and Advertising</h2>
            <p>
              We use Google AdSense to show ads on some pages. Google may collect and use data (e.g., cookies, device identifiers) to serve ads and measure performance. Their use of data is governed by Google&apos;s Privacy Policy and AdSense Program Policies. You can manage ad personalization at{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D4AF37] hover:underline"
              >
                adssettings.google.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">6. Third-Party Services</h2>
            <p>
              We use Firebase (authentication, database, hosting), Stripe (payments), and may use analytics or other tools. Each has its own privacy practices; we encourage you to review their policies. We only share data with these providers as needed to operate our service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">7. Data Retention and Security</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide the service and comply with legal obligations. We implement reasonable security measures to protect your data; no system is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">8. Your Rights</h2>
            <p>
              Depending on where you live, you may have the right to access, correct, delete, or export your data, or to object to or restrict certain processing. You can update account details in the app; for other requests or to delete your account, contact us (see Contact below).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">9. Children</h2>
            <p>
              Our service is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us so we can delete it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will post the updated version on this page and update the &quot;Last updated&quot; date. Continued use of Aqala after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">11. Contact</h2>
            <p>
              For privacy-related questions, data requests, or to report concerns, contact us at{" "}
              <a
                href="mailto:contact@aqala.org"
                className="text-[#D4AF37] hover:underline"
              >
                contact@aqala.org
              </a>
              . You can also use the contact details on our{" "}
              <Link href="/about" className="text-[#D4AF37] hover:underline">
                About & Contact
              </Link>{" "}
              page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
