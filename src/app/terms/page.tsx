"use client";

import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold">Terms of Service</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-5 space-y-8 pb-16">
        {/* Last Updated */}
        <p className="text-sm text-white/40">Last updated: February 17, 2026</p>

        {/* Introduction */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            1. Acceptance of Terms
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              By accessing or using Aqala (the &ldquo;Service&rdquo;), including our mobile
              application and website, you agree to be bound by these Terms of Service
              (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you may not access or use
              the Service.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              We reserve the right to update these Terms at any time. Continued use of the Service
              after changes constitutes acceptance of the revised Terms.
            </p>
          </div>
        </section>

        {/* Service Description */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            2. Service Description
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              Aqala is a faith-based platform providing real-time Quran translation and
              transliteration, prayer times and Qibla direction, live audio rooms for Islamic
              learning, social features, and direct messaging.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              Translations and transliterations are generated using automated speech-to-text
              technology and may not be perfectly accurate. They are provided as a learning aid
              and should not be treated as authoritative religious rulings or a replacement for
              qualified scholarly guidance.
            </p>
          </div>
        </section>

        {/* User Accounts */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            3. User Accounts
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              You must be at least 13 years old to create an account. By creating an account, you
              represent that you meet this age requirement.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. Notify us immediately if you
              suspect unauthorized access.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              You agree to provide accurate, current, and complete information when creating your
              account and to update it as necessary.
            </p>
          </div>
        </section>

        {/* Community Guidelines */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            4. Community Guidelines
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              Aqala is a respectful platform centered around Islamic learning and community. When
              using the Service, you agree to:
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span>Treat all users with respect and dignity</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span>Not post or share content that is hateful, discriminatory, harassing, or threatening</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span>Not post or share sexually explicit, violent, or graphic content</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span>Not spread misinformation or misrepresent religious texts</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span>Not impersonate other users, scholars, or public figures</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span>Not spam, solicit, or promote unrelated commercial content</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span>Not attempt to harass, bully, or intimidate other users</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span>Not use the Service for any illegal purpose</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Prohibited Conduct */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            5. Prohibited Conduct
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              The following activities are strictly prohibited:
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex gap-2">
                <span className="text-red-400 mt-1">&#x2022;</span>
                <span>Attempting to gain unauthorized access to other accounts or systems</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400 mt-1">&#x2022;</span>
                <span>Reverse engineering, decompiling, or disassembling any part of the Service</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400 mt-1">&#x2022;</span>
                <span>Using bots, scrapers, or automated tools to access the Service</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400 mt-1">&#x2022;</span>
                <span>Circumventing security measures, content moderation, or access restrictions</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400 mt-1">&#x2022;</span>
                <span>Distributing malware, viruses, or any harmful code</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400 mt-1">&#x2022;</span>
                <span>Collecting or harvesting personal data of other users</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400 mt-1">&#x2022;</span>
                <span>Creating multiple accounts for deceptive purposes</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Content Moderation */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            6. Content Moderation &amp; Reporting
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              We maintain the right to review, moderate, and remove any content that violates
              these Terms or our Community Guidelines. Users may report objectionable content or
              abusive behavior through the in-app reporting system.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              We will review reports in a timely manner and take appropriate action, which may
              include content removal, account suspension, or permanent account termination.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              Users who are found to violate these Terms may be blocked from the Service without
              prior notice.
            </p>
          </div>
        </section>

        {/* Intellectual Property */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            7. Intellectual Property
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              The Service, including its design, features, and content (excluding user-generated
              content), is owned by Aqala and protected by intellectual property laws. You may not
              copy, modify, distribute, or create derivative works based on the Service without our
              written permission.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              By posting content on the Service, you grant us a non-exclusive, worldwide,
              royalty-free license to use, display, and distribute that content in connection with
              operating the Service. You retain ownership of your content.
            </p>
          </div>
        </section>

        {/* Religious Content Disclaimer */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            8. Religious Content Disclaimer
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              Aqala provides tools for accessing and understanding religious content. Automated
              translations, transliterations, and verse identifications are provided as-is and
              may contain inaccuracies.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              The Service should not be used as the sole basis for religious rulings (fatwa),
              legal decisions, or medical advice. Users are encouraged to consult qualified
              scholars and professionals for authoritative guidance.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              Aqala does not endorse or take responsibility for views expressed by users in
              rooms, chats, or any other user-generated content.
            </p>
          </div>
        </section>

        {/* Disclaimers & Limitations */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            9. Disclaimers &amp; Limitation of Liability
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
              warranties of any kind. We do not warrant that the Service will be uninterrupted,
              error-free, or free of harmful components.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              To the maximum extent permitted by law, Aqala shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of the
              Service.
            </p>
          </div>
        </section>

        {/* Account Termination */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            10. Account Termination
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              You may delete your account at any time through the Account Settings. We may suspend
              or terminate your account if you violate these Terms, engage in prohibited conduct,
              or upon request by law enforcement.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              Upon termination, your right to use the Service will immediately cease. Data deletion
              will follow the procedures outlined in our{" "}
              <Link href="/privacy" className="text-[#D4AF37] hover:underline">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </section>

        {/* Governing Law */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            11. Governing Law
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
            <p className="text-sm text-white/70 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of
              Australia, without regard to its conflict of law provisions. Any disputes arising
              from these Terms will be resolved in the courts of Australia.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            12. Contact Us
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="text-sm text-white/70 space-y-1">
              <p>
                Email:{" "}
                <a href="mailto:support@aqala.io" className="text-[#D4AF37] hover:underline">
                  support@aqala.io
                </a>
              </p>
              <p>
                Website:{" "}
                <a href="https://aqala.io" className="text-[#D4AF37] hover:underline">
                  aqala.io
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
