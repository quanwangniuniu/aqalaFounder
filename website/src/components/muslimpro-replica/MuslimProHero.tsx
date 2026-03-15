"use client";

import Link from "next/link";
import Image from "next/image";

export default function MuslimProHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background image (poster for video - Muslim Pro uses video) */}
      <div className="absolute inset-0">
        <Image
          src="/app/homepage/home_img.png"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
          Your Islamic App Companion
        </h1>
        <p className="text-xl sm:text-2xl text-white/95 mb-8 md:mb-10">
          Practice Your Deen - Anytime, Anywhere
        </p>

        {/* App Store + Google Play buttons - Aqala (link to web app until mobile apps available) */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/listen"
            className="inline-block hover:opacity-90 transition-opacity"
          >
            <img
              src="/app/homepage/appstore-200-69.png"
              alt="Open Aqala on App Store"
              width={200}
              height={69}
              className="h-[52px] w-auto"
            />
          </Link>
          <Link
            href="/listen"
            className="inline-block hover:opacity-90 transition-opacity"
          >
            <img
              src="/app/homepage/play_store-200.png"
              alt="Open Aqala on Google Play"
              width={200}
              height={69}
              className="h-[52px] w-auto"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
