"use client";

import Link from "next/link";

export default function SupportPage() {
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
          <h1 className="text-xl font-semibold">Help &amp; Support</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-5 space-y-8 pb-16">
        {/* Contact Section */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
            Contact Us
          </h2>
          <div className="space-y-3">
            <a
              href="mailto:support@aqala.io"
              className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Email Support</p>
                <p className="text-xs text-white/50">support@aqala.io</p>
              </div>
            </a>

            <a
              href="https://www.instagram.com/aqala.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#D4AF37">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Instagram</p>
                <p className="text-xs text-white/50">@aqala.io</p>
              </div>
            </a>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            <details className="group bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                <p className="text-sm font-medium text-white pr-4">What is Aqala?</p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50 flex-shrink-0 group-open:rotate-180 transition-transform">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-white/60 leading-relaxed">
                  Aqala is a faith-based platform that provides real-time Quran translation and
                  transliteration, prayer times, Qibla direction, and live audio rooms for Islamic
                  learning. It connects Muslims worldwide through shared understanding.
                </p>
              </div>
            </details>

            <details className="group bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                <p className="text-sm font-medium text-white pr-4">How does live translation work?</p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50 flex-shrink-0 group-open:rotate-180 transition-transform">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-white/60 leading-relaxed">
                  Aqala uses advanced speech-to-text technology to convert spoken Arabic into text
                  in real-time. The app then identifies Quranic verses and provides translations
                  and transliterations in multiple languages. Please note that automated translations
                  may not be perfectly accurate and should be used as a learning aid.
                </p>
              </div>
            </details>

            <details className="group bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                <p className="text-sm font-medium text-white pr-4">How do I report inappropriate content?</p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50 flex-shrink-0 group-open:rotate-180 transition-transform">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-white/60 leading-relaxed">
                  You can report users by visiting their profile and tapping the menu icon, then
                  selecting &ldquo;Report User.&rdquo; You can choose a reason and provide
                  additional details. Our moderation team reviews all reports promptly. You can
                  also block users to prevent them from contacting you.
                </p>
              </div>
            </details>

            <details className="group bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                <p className="text-sm font-medium text-white pr-4">How do I delete my account?</p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50 flex-shrink-0 group-open:rotate-180 transition-transform">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-white/60 leading-relaxed">
                  You can delete your account from Account Settings. Alternatively, contact us at{" "}
                  <a href="mailto:support@aqala.io" className="text-[#D4AF37] hover:underline">
                    support@aqala.io
                  </a>{" "}
                  and we will process your deletion request within 30 days.
                </p>
              </div>
            </details>

            <details className="group bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                <p className="text-sm font-medium text-white pr-4">What data does Aqala collect?</p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50 flex-shrink-0 group-open:rotate-180 transition-transform">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-white/60 leading-relaxed">
                  Aqala collects basic account information (name, email), and optionally your
                  location (for prayer times) and microphone access (for live translation). For full
                  details, please see our{" "}
                  <Link href="/privacy" className="text-[#D4AF37] hover:underline">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </details>

            <details className="group bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                <p className="text-sm font-medium text-white pr-4">Is Aqala free to use?</p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50 flex-shrink-0 group-open:rotate-180 transition-transform">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-white/60 leading-relaxed">
                  Yes, Aqala is free to use with all core features available. We offer an optional
                  Premium subscription that removes ads for a one-time payment.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* Legal Links */}
        <section>
          <h2 className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
            Legal
          </h2>
          <div className="space-y-2">
            <Link
              href="/privacy"
              className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <span className="text-sm text-white">Privacy Policy</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>

            <Link
              href="/terms"
              className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span className="text-sm text-white">Terms of Service</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* App Info */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-white/30">Aqala v1.0.0</p>
          <p className="text-xs text-white/20 mt-1">Made with love for the Ummah</p>
        </div>
      </div>
    </div>
  );
}
