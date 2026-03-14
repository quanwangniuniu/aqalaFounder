"use client";

import Link from "next/link";

export default function MuslimProQuranSection() {
  return (
    <section id="quran" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 order-2 lg:order-1">
            <div className="w-full max-w-sm h-64 bg-gradient-to-br from-[#00a651]/20 to-emerald-500/20 rounded-2xl flex items-center justify-center">
              <span className="text-6xl text-[#00a651]/40">﴾</span>
            </div>
          </div>
          <div className="flex-1 order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Immerse & Learn the Holy Quran
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Muslim Pro features the full Quran with Arabic scripts, coloured Tajweed, 40+ translations and more. Now, you can also learn more about selected surahs and use our tools to kick start your Quran memorizing journey.
            </p>
            <Link
              href="/listen"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44] transition-colors"
            >
              Read the Quran
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
