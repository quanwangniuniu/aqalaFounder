"use client";

import Link from "next/link";

export default function MuslimProQalboxHomeSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a5c3e]/90 to-gray-900" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
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
          <div className="flex-1">
            <p className="text-xl md:text-2xl font-bold mb-2">Watch Qalbox</p>
            <p className="text-2xl md:text-3xl font-bold mb-4">Muslim Films, TV Series & More</p>
            <p className="text-white/90 mb-6">
              Aqala offers real-time translation for Islamic content — Qur&apos;an, khutbahs, and lectures. Understand and engage with topics that matter to you, in your language. Making Islamic knowledge more accessible to a global audience.
            </p>
            <Link
              href="/rooms"
              className="inline-flex px-6 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Watch Qalbox
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
