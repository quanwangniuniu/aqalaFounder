"use client";

import Link from "next/link";

export default function MuslimProAiDeenSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Real-time Translation - Aqala&apos;s AI-Powered Understanding
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Ask AiDeen is a companion in your journey of faith, offering you information about topics in Islam on-the-go. Ask AiDeen is trained to answer your Islamic queries based on the holy Quran and authentic hadiths.
            </p>
            <Link
              href="/listen"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors"
            >
              Ask AiDeen
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>
          <div className="flex-1">
            <div className="w-full max-w-sm h-48 bg-gradient-to-br from-[#032117]/10 to-[#D4AF37]/20 rounded-2xl flex items-center justify-center">
              <svg className="w-24 h-24 text-[#D4AF37]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
