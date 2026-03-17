"use client";

import Link from "next/link";
import Image from "next/image";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";

export default function SharedListeningPage() {
  return (
    <>
      <MuslimProAppBar />

      <section className="relative overflow-hidden bg-[#032117]">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Shared Listening</h1>
          <p className="text-lg text-white/80 max-w-2xl mb-8">
            Join rooms with others to listen and translate together. Perfect for mosques, study circles, and connecting with the Ummah across languages.
          </p>
          <div className="relative aspect-video max-w-2xl rounded-xl overflow-hidden bg-black/30 border border-white/10">
            <Image
              src="/aqala-shared-listening.png"
              alt="Aqala Shared Listening — listen and translate together"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#06402B] text-white border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-4">Listen Together with the Ummah</h2>
          <p className="text-white/90 mb-6 max-w-2xl">
            Aqala offers shared listening rooms where you can listen and translate Islamic content together with others. Real-time translation makes Quran, khutbahs, and lectures accessible in 20+ languages.
          </p>
          <Link
            href="/rooms"
            className="inline-flex px-6 py-3 rounded-lg bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors"
          >
            Join a Room
          </Link>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#032117] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Get the full experience</h2>
          <p className="text-white/70 mb-6">Join shared listening rooms and connect with the Ummah in the Aqala app.</p>
          <Link
            href="/listen"
            className="inline-flex px-8 py-4 rounded-lg bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#E8D5A3] transition-colors"
          >
            Start Listening
          </Link>
        </div>
      </section>
    </>
  );
}
