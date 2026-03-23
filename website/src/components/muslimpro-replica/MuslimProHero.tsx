"use client";

import Link from "next/link";
import Image from "next/image";

// Aqala premium hero — AI-generated, unique
const HERO_BG = "/aqala-assets/aqala-hero-mosque.jpg";

export default function MuslimProHero() {
  return (
    <section className="relative min-h-[64vh] flex items-center justify-center overflow-hidden">
      {/* Background: Aqala-themed mosque interior from Unsplash */}
      <div className="absolute inset-0">
        <Image
          src={HERO_BG}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#032117]/75" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-14 md:py-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
          Never Miss the Meaning Again.
        </h1>
        <p className="text-xl sm:text-2xl text-white/95 mb-8 md:mb-10">
          Live translation tool for khutbahs, Islamic content, Quran and more in 20+ languages!
        </p>

        {/* Aqala: Open in Browser (no store badges until mobile apps exist) */}
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/listen"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#E8D5A3] transition-colors mp-btn-hover"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Try Beta Now
          </Link>
          <p className="text-sm md:text-base text-white/80">Aqala app coming soon.</p>
        </div>
      </div>
    </section>
  );
}
