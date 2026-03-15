"use client";

import Link from "next/link";
import MuslimProQuranSection from "@/components/muslimpro-replica/MuslimProQuranSection";
import MuslimProAiDeenSection from "@/components/muslimpro-replica/MuslimProAiDeenSection";
import MuslimProQalboxSection from "@/components/muslimpro-replica/MuslimProQalboxSection";
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
            Let Muslim Pro guide your day with accurate prayer times, beautiful Quran recitations, and meaningful Islamic reminders. Get real-time Adhan alerts, track your ibadah, ask our AI assistant, and stay inspired every step of the way.
          </p>
          <Link href="/listen" className="inline-flex px-6 py-3 rounded-full bg-[#00a651] text-white font-semibold hover:bg-[#008f44]">
            Download Free App
          </Link>
        </div>
      </section>
      <MuslimProQuranSection />
      <MuslimProAiDeenSection />
      <MuslimProQalboxSection />
    </>
  );
}
