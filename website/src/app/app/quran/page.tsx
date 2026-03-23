"use client";

import Link from "next/link";
import MuslimProQuranSection from "@/components/muslimpro-replica/MuslimProQuranSection";
import MuslimProAiDeenSection from "@/components/muslimpro-replica/MuslimProAiDeenSection";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";

export default function MuslimProQuranPage() {
  return (
    <>
      <MuslimProAppBar />
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Your Prayer and Quran Companion
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl">
            Let Aqala guide your day with accurate prayer times, real-time translation for Quran and Islamic content, and meaningful tools. Listen to khutbahs and lectures in your language, explore Quran with verse detection, and stay connected across 20+ languages.
          </p>
          <Link href="/listen" className="inline-flex px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44]">
            Download Free App
          </Link>
        </div>
      </section>
      <MuslimProQuranSection />
      <MuslimProAiDeenSection />
    </>
  );
}
