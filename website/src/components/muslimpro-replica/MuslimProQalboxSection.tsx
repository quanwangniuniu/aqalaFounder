"use client";

import Link from "next/link";

export default function MuslimProQalboxSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Watch Qalbox - Muslim Films, TV Series & More
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Qalbox is the dedicated video platform within Muslim Pro, offering educational and spiritually enriching content that helps Muslims deepen their faith and engage with topics that matter to them.
            </p>
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44] transition-colors"
            >
              Watch Qalbox
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          </div>
          <div className="flex-1">
            <div className="w-full max-w-sm aspect-video bg-gray-900 rounded-2xl flex items-center justify-center">
              <svg className="w-16 h-16 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
