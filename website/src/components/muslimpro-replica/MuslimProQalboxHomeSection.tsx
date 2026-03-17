"use client";

import Link from "next/link";
import Image from "next/image";

export default function MuslimProQalboxHomeSection() {
  return (
    <section className="py-16 md:py-24 bg-[#021a12] text-white relative overflow-hidden border-y border-white/10">
      <div className="absolute inset-0 bg-gradient-to-b from-[#06402B]/90 to-[#021a12]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="relative aspect-video max-w-2xl rounded-xl overflow-hidden bg-black/30 border border-white/10">
              <Image
                src="/aqala-shared-listening.png"
                alt="Aqala Shared Listening — join rooms to listen and translate together"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                priority
              />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xl md:text-2xl font-bold mb-2 text-[#D4AF37]">Shared Listening</p>
            <p className="text-2xl md:text-3xl font-bold mb-4">Listen Together with the Ummah</p>
            <p className="text-white/90 mb-6">
              Join rooms with others to listen and translate together. Perfect for mosques, study circles, or connecting with Muslims across languages. Aqala makes Islamic content accessible in 20+ languages.
            </p>
            <Link
              href="/rooms"
              className="inline-flex px-6 py-3 rounded-lg bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors"
            >
              Join a Room
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
