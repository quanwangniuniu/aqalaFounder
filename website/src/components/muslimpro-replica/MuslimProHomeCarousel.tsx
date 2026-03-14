"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const SLIDES = [
  {
    title: "Everything you need for Ramadan, in one place",
    desc: "From daily fasting times and iftar du'as to ready-to-use Ramadan greetings, the Ramadan Hub is designed to be your main reference point throughout Ramadan 2026 — so you spend less time searching and more time focusing on the month.",
    cta: "Get Ready for Ramadan",
    href: "/muslimpro-demo/blog",
    image: "/muslimpro-demo/homepage/Ramadan-Hub-Header.jpg",
    imageAlt: "Ramadan Hub Header",
  },
  {
    title: "Fulfil Umrah For Your Loved Ones",
    desc: "Gift a Badal Umrah to be performed in Makkah on behalf of your loved one. Whether for the deceased, the sick, or those unable to perform it themselves, this service ensures their reward is preserved. Each request is handled securely with our trusted partner Tawkeel, giving you peace of mind while honoring those dearest to you.",
    cta: "Learn More",
    href: "/muslimpro-demo/about",
    image: "/muslimpro-demo/homepage/A-large-crowd-of-Muslims-doing-their-tawaf-around-the-Kaabah-scaled.jpg",
    imageAlt: "Muslims doing tawaf around the Kaabah",
  },
  {
    title: "Upgrade to Muslim Pro Premium!",
    desc: "Ads help us keep Muslim Pro running, but upgrading to Premium offers you an uninterrupted experience while directly supporting the app's growth and development. Explore our promos and discounts to find the perfect plan for you. Upgrade to Muslim Pro Premium today and enjoy an ad-free experience + unlock all features!",
    cta: "Upgrade to Premium",
    href: "/subscription",
    image: "/muslimpro-demo/muslim-pro-features.jpg",
    imageAlt: "Muslim Pro app features",
  },
];

export default function MuslimProHomeCarousel() {
  const [index, setIndex] = useState(0);
  const s = SLIDES[index];

  return (
    <section className="relative py-0 overflow-hidden">
      <div className="relative h-[400px] md:h-[500px]">
        <Image
          src={s.image}
          alt={s.imageAlt}
          fill
          className="object-cover"
          sizes="100vw"
          priority={index === 0}
        />
        <div className="absolute inset-0 bg-[#0E1C25]/76" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 max-w-3xl">{s.title}</h3>
          <p className="text-base md:text-lg text-white/95 mb-6 max-w-2xl">{s.desc}</p>
          <Link
            href={s.href}
            className="inline-flex px-8 py-4 rounded-lg bg-[#00a651] text-white font-bold hover:bg-[#008f44] transition-colors"
          >
            {s.cta}
          </Link>
        </div>
      </div>
      {/* Pagination */}
      <div className="flex justify-center gap-2 py-4 bg-gray-50">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${i === index ? "bg-[#00a651]" : "bg-gray-300 hover:bg-gray-400"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
