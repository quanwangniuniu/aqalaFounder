import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About & Contact",
  description:
    "About Aqala: real-time translation and multilingual communication. Contact us for support, partnerships, or press.",
};

export default function AboutPage() {
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
          <h1 className="text-lg font-semibold text-white">About & Contact</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-[554px] mx-auto space-y-8">
          <section>
            <h2 className="text-base font-semibold text-white mb-2">About Aqala</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Aqala connects people through comprehension. We provide real-time translation and seamless multilingual communication so that language is no longer a barrier to learning, sharing, and connecting—whether you&apos;re listening to a khutba, joining a room, or having a conversation across languages.
            </p>
            <p className="text-white/80 text-sm leading-relaxed mt-3">
              Our mission is to make knowledge and connection accessible across languages, with a focus on serving communities that benefit from instant, accurate translation in both speech and text.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">Contact</h2>
            <p className="text-white/70 text-sm mb-3">
              For support, partnerships, or press inquiries, reach us at:
            </p>
            <a
              href="mailto:contact@aqala.org"
              className="inline-flex items-center gap-2 text-[#D4AF37] hover:underline font-medium"
            >
              contact@aqala.org
            </a>
            <p className="text-white/50 text-xs mt-3">
              We aim to respond within a few business days.
            </p>
          </section>

          <section className="pt-4 border-t border-white/5">
            <Link
              href="/"
              className="text-white/50 text-sm hover:text-white/70 transition-colors"
            >
              ← Back to Home
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
