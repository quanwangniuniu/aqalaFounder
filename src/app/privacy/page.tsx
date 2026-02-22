"use client";

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Aqala Privacy Policy: how we collect, use, and protect your data. Covers account data, cookies, Google AdSense, and your rights.",
};


export default function PrivacyPolicyPage() {
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
          <h1 className="text-xl font-semibold">Privacy Policy</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-5 space-y-8 pb-16">
        {/* Last Updated */}
        <p className="text-sm text-white/40">Last updated: February 17, 2026</p>

        {/* Introduction */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            Introduction
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              Aqala (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to
              protecting your privacy. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our mobile application and website
              (collectively, the &ldquo;Service&rdquo;).
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              Please read this privacy policy carefully. By using the Service, you agree to the
              collection and use of information in accordance with this policy. If you do not agree
              with the terms of this privacy policy, please do not access the Service.
            </p>
          </div>
        </section>

        {/* Information We Collect */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            Information We Collect
          </h2>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Account Information</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                When you create an account, we collect your name, email address, and profile photo.
                If you sign in with Google or Apple, we receive basic profile information from those
                services. You may also optionally set a username and bio.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Location Data</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                We request location access solely to provide accurate prayer times and Qibla
                direction. Location data is processed on-device and is not stored on our servers
                or shared with third parties.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Microphone Data</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Microphone access is required for live translation broadcasting features. Audio is
                streamed in real-time for speech-to-text processing and is not recorded or stored
                permanently. Audio streams are discarded immediately after translation processing.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Camera &amp; Photo Library</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Camera and photo library access are used exclusively for setting your profile
                picture. Photos are uploaded to our secure image hosting service (Cloudinary) and
                are associated with your account.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Usage Data</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                We collect anonymous usage data such as listening time, room participation history,
                and app interaction patterns. This data is used to improve the Service and provide
                features like listener progression and experience levels.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Messages &amp; Chat</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Direct messages and room chat messages are stored securely on our servers (Firebase
                Firestore) to enable messaging functionality. Messages are only accessible to the
                participants in the conversation or room.
              </p>
            </div>
          </div>
        </section>

        {/* Third-Party Services */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            Third-Party Services
          </h2>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Firebase (Google)</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                We use Firebase for authentication, data storage, and basic analytics. Firebase may
                collect device identifiers and usage statistics.{" "}
                <a
                  href="https://firebase.google.com/support/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] hover:underline"
                >
                  Firebase Privacy Policy
                </a>
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Vercel Analytics</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                We use Vercel Analytics to understand how our web application is used. This service
                collects anonymous, aggregated data about page views and performance. It does not
                use cookies or collect personally identifiable information.{" "}
                <a
                  href="https://vercel.com/docs/analytics/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] hover:underline"
                >
                  Vercel Analytics Privacy Policy
                </a>
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Session Recording (OpenReplay)</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                With your consent, we may record browsing sessions on our web application using
                OpenReplay to identify bugs and improve user experience. Session recordings may
                include your interactions with the app but do not capture passwords or sensitive
                form inputs. You can opt out of session recording at any time in your account
                settings.{" "}
                <a
                  href="https://openreplay.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] hover:underline"
                >
                  OpenReplay Privacy Policy
                </a>
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Cloudinary</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Profile photos are hosted on Cloudinary, a secure cloud-based image hosting service.
                Only your profile photo is stored.{" "}
                <a
                  href="https://cloudinary.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] hover:underline"
                >
                  Cloudinary Privacy Policy
                </a>
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Soniox (Speech-to-Text)</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Live audio from broadcasting sessions is streamed to Soniox for real-time
                speech-to-text conversion. Audio is processed in real-time and is not stored by
                Soniox after processing.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">Advertising (Google AdMob)</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Our mobile app may display ads through Google AdMob. AdMob may collect device
                identifiers and usage data for ad personalization. Premium subscribers do not see
                ads.{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] hover:underline"
                >
                  Google Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            How We Use Your Information
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span>To provide and maintain the Service, including prayer times, Qibla direction, live translation, and social features</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span>To manage your account and provide customer support</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span>To improve the Service by understanding how it is used</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span>To communicate with you about updates or issues related to the Service</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span>To detect and prevent fraud, abuse, or violations of our Terms of Service</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span>To enforce content moderation and community safety standards</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Data Retention & Deletion */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            Data Retention &amp; Deletion
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              We retain your personal data only for as long as necessary to provide the Service
              and fulfill the purposes described in this policy. When you delete your account,
              we will delete or anonymize your personal data within 30 days, except where we are
              required to retain it by law.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              You can request deletion of your account and all associated data by navigating to
              Account Settings and selecting &ldquo;Delete Account&rdquo;, or by contacting us at
              the email address below.
            </p>
          </div>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            Your Rights
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
            <p className="text-sm text-white/70 leading-relaxed mb-3">
              Depending on your jurisdiction, you may have the following rights regarding your
              personal data:
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span><strong className="text-white/90">Access</strong> &ndash; Request a copy of the personal data we hold about you</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span><strong className="text-white/90">Correction</strong> &ndash; Request correction of inaccurate data</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span><strong className="text-white/90">Deletion</strong> &ndash; Request deletion of your personal data</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span><strong className="text-white/90">Portability</strong> &ndash; Request a machine-readable copy of your data</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D4AF37] mt-1">&#x2022;</span>
                <span><strong className="text-white/90">Withdraw consent</strong> &ndash; Opt out of optional data collection at any time</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Children's Privacy */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            Children&apos;s Privacy
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              The Service is not directed to children under 13 years of age. We do not knowingly
              collect personal information from children under 13. If we become aware that we have
              collected personal data from a child under 13 without parental consent, we will take
              steps to delete that information.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              If you are a parent or guardian and believe your child has provided us with personal
              information, please contact us so we can take appropriate action.
            </p>
          </div>
        </section>

        {/* Security */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            Security
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
            <p className="text-sm text-white/70 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect
              your personal data, including encryption in transit (TLS/SSL), secure data storage
              through Firebase, and access controls. However, no method of transmission over the
              internet or electronic storage is 100% secure, and we cannot guarantee absolute
              security.
            </p>
          </div>
        </section>

        {/* Changes to This Policy */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            Changes to This Policy
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
            <p className="text-sm text-white/70 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new policy on this page and updating the &ldquo;Last
              Updated&rdquo; date. You are advised to review this Privacy Policy periodically for
              any changes.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
            Contact Us
          </h2>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
            <p className="text-sm text-white/70 leading-relaxed">
              If you have any questions about this Privacy Policy or wish to exercise your data
              rights, please contact us:
            </p>
            <div className="text-sm text-white/70 space-y-1">
              <p>
                Email:{" "}
                <a href="mailto:privacy@aqala.io" className="text-[#D4AF37] hover:underline">
                  privacy@aqala.io
                </a>
              </p>
              <p>
                Website:{" "}
                <a href="https://aqala.io" className="text-[#D4AF37] hover:underline">
                  aqala.io
                </a>
              </p>
              <p>
                Instagram:{" "}
                <a
                  href="https://www.instagram.com/aqala.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D4AF37] hover:underline"
                >
                  @aqala.io
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
