"use client";

import Link from "next/link";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";

export default function MuslimProQalboxPage() {
  return (
    <>
      <MuslimProAppBar />

      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a5c3e]/5 to-transparent">
        <div className="absolute inset-0 opacity-5">
          <img src="/app/banner-bg.svg" alt="" className="w-full h-full object-cover" aria-hidden />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Qalbox</h1>
          <p className="text-lg text-gray-600 max-w-2xl mb-8">
            Watch Muslim films, TV series, and more. Qalbox is the dedicated video platform within Muslim Pro, offering educational and spiritually enriching content.
          </p>
          <div className="aspect-video max-w-2xl rounded-xl overflow-hidden bg-black/30">
            <iframe
              src="https://www.youtube.com/embed/xAtejbEtHQM?modestbranding=1&rel=0"
              title="Qalbox - Muslim Films, TV Series & More"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-4">Watch Qalbox — Muslim Films, TV Series & More</h2>
          <p className="text-white/90 mb-6 max-w-2xl">
            Qalbox is the dedicated video platform within Muslim Pro, offering educational and spiritually enriching content that helps Muslims deepen their faith and engage with topics that matter to them. It provides Quranic recitations, tafsir, hadith studies, Arabic lessons and expert-led discussions, making Islamic knowledge more accessible to a global audience.
          </p>
          <Link
            href="/rooms"
            className="inline-flex px-6 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white hover:text-gray-900 transition-colors"
          >
            Watch Qalbox
          </Link>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get the full experience in the app</h2>
          <p className="text-gray-600 mb-6">Access thousands of hours of Muslim films and TV series in the Muslim Pro app.</p>
          <Link
            href="/app/app"
            className="inline-flex px-8 py-4 rounded-lg bg-[#00a651] text-white font-bold hover:bg-[#008f44] transition-colors"
          >
            Download Free App
          </Link>
        </div>
      </section>
    </>
  );
}
