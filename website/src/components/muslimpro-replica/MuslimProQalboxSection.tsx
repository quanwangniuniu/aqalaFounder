"use client";

import Link from "next/link";

export default function MuslimProQalboxSection() {
  return (
    <section className="py-16 md:py-24 bg-[#032117] border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Shared Listening — Listen Together
            </h2>
            <p className="text-lg text-white/80 mb-6">
              Aqala offers shared listening rooms where you can listen and translate Islamic content together with others. Real-time translation for Qur&apos;an, khutbahs, and lectures in 20+ languages.
            </p>
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors"
            >
              Join a Room
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          </div>
          <div className="flex-1">
            <div className="w-full max-w-sm aspect-video bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <svg className="w-16 h-16 text-[#D4AF37]/50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" />
                <path d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
