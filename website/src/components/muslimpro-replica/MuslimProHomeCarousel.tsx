"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Aqala premium carousel — unique AI-generated images, no repetition
const SLIDES = [
  {
    title: "Real-time translation for Islamic content",
    desc: "Listen to khutbahs, join rooms, and converse across languages. Quran verses, tafsir, and AI summaries — all from any language to any language. 20+ languages including English, Arabic, Urdu, Hindi, Turkish, Indonesian, Bengali, French, German, Spanish, and more.",
    cta: "Get Aqala app",
    href: "/app#get-aqala-app",
    image: "/aqala-shared-listening.png",
    imageAlt: "Real-time translation — Aqala",
  },
  {
    title: "Automatic Quran detection",
    desc: "When you hear Quranic verses, Aqala automatically detects them and shows the surah, verse reference, and translation. Tap any verse to explore details and verify on Quran.com. Explore what you hear!",
    cta: "View on Quran.com",
    href: "https://quran.com",
    image: "/aqala-quran-detection.png",
    imageAlt: "Quran detection — Aqala",
  },
  {
    title: "Aqala Premium — No ads, unlimited translation, AI enhancement",
    desc: "Go ad-free, enjoy unlimited translation time, and invite friends to get $10 off. AI enhancement makes translations clearer. One-time payment, lifetime access.",
    cta: "Upgrade to Premium",
    href: "/subscription",
    image: "/aqala-assets/aqala-ai-premium.jpg",
    imageAlt: "Aqala Premium — exclusive experience",
  },
];

export default function MuslimProHomeCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const s = SLIDES[index];

  const goNext = () => setIndex((prev) => (prev + 1) % SLIDES.length);
  const goPrev = () => setIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => {
      goNext();
    }, 6000);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section
      className="relative py-0 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative h-[400px] md:h-[500px]">
        <Image
          src={s.image}
          alt={s.imageAlt}
          fill
          className="object-cover"
          sizes="100vw"
          priority={index === 0}
        />
        <div className="absolute inset-0 bg-[#032117]/80" />

        {/* Arrow controls */}
        <button
          type="button"
          onClick={() => {
            goPrev();
            setPaused(true);
            window.setTimeout(() => setPaused(false), 7000);
          }}
          className="absolute z-20 left-3 md:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 border border-white/15 text-white/90 hover:bg-black/45 hover:border-white/25 transition-colors backdrop-blur-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
          aria-label="Previous slide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            goNext();
            setPaused(true);
            window.setTimeout(() => setPaused(false), 7000);
          }}
          className="absolute z-20 right-3 md:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 border border-white/15 text-white/90 hover:bg-black/45 hover:border-white/25 transition-colors backdrop-blur-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
          aria-label="Next slide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 max-w-3xl">{s.title}</h3>
          <p className="text-base md:text-lg text-white/95 mb-6 max-w-2xl">{s.desc}</p>
          {s.href.startsWith("http") ? (
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-8 py-4 rounded-xl bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#b8944d] transition-colors mp-btn-hover"
            >
              {s.cta}
            </a>
          ) : (
            <Link
              href={s.href}
              className="inline-flex px-8 py-4 rounded-xl bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#b8944d] transition-colors mp-btn-hover"
            >
              {s.cta}
            </Link>
          )}
        </div>
      </div>
      {/* Pagination */}
      <div className="flex justify-center gap-2 py-4 bg-[#032117]">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIndex(i);
              setPaused(true);
              window.setTimeout(() => setPaused(false), 7000);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${i === index ? "bg-[#D4AF37]" : "bg-white/30 hover:bg-white/50"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
