"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * Background images: export at 2400 × 1000 px (JPEG or WebP, ~80% quality).
 * Covers full-bleed carousel at md:h-[400px] with 2× retina; min safe 1920 × 800 px.
 * Filenames below are placeholders — replace with your supplied assets when ready.
 */
const SLIDES = [
  {
    kind: "reviews" as const,
    title: "Reviews",
    reviews: [
      {
        quote:
          "Finally I can follow khutbahs in my language. The real-time translation is a game-changer — I used to zone out when the imam spoke Arabic. Now I understand every word. JazakAllahu Khairan to the Aqala team.",
        author: "Yusuf K.",
      },
      {
        quote:
          "I listen to Quran recitation with Urdu translation side by side. Aqala has brought my family closer to the Book. MashaAllah.",
        author: "Amina R.",
      },
      {
        quote:
          "As a revert, I struggled with Arabic lectures. Aqala's live translation lets me learn at my own pace. The AI enhancement makes complex terms clearer. May Allah bless this project.",
        author: "James M.",
      },
    ],
    cta: "Read more reviews",
    href: "/reviews",
    image: "/aqala-about/journey-2025-translation.jpg",
    imageAlt: "Aqala — community reviews",
  },
  {
    kind: "text" as const,
    title: "The gift that keeps on giving",
    paragraphs: [
      "Understanding and seeking for knowledge is an amanah (trust) by Allah. Aqala allows you to understand knowledge which previously remained hidden, unlocking immense rewards and hasanat.",
    ],
    cta: "Gift Premium",
    href: "/app/premium/gift",
    image: "/aqala-about/journey-present-suite.jpg",
    imageAlt: "Aqala — knowledge and reward",
  },
  {
    kind: "text" as const,
    title: "Subscribe to Aqala Premium!",
    paragraphs: [
      "Ads help us keep running and aoptimise for our users.",
      "Upgrading to premium removes noise and provides an ad free experience free from distraction, but most importantly it directly supports the apps growth and development.",
      "Did you know: You can gift our premium lifetime subcription to anyone of your choice and have it act as sadaqa jariye on your behalf?",
      "Did someone say Jannah?!",
    ],
    cta: "Upgrade to Premium",
    href: "/subscription",
    image: "/aqala-assets/aqala-ai-premium.jpg",
    imageAlt: "Aqala Premium",
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
      <div className="relative h-[320px] sm:h-[360px] md:h-[400px]">
        <Image
          src={s.image}
          alt={s.imageAlt}
          fill
          className="object-cover"
          sizes="100vw"
          priority={index === 0}
        />
        <div className="absolute inset-0 bg-[#032117]/80" />

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

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-3 sm:px-6 lg:px-8 text-center text-white overflow-y-auto py-6 md:py-8">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 md:mb-4 max-w-4xl shrink-0">{s.title}</h3>

          {s.kind === "reviews" ? (
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6 text-left">
              {s.reviews.map((r, i) => (
                <blockquote
                  key={i}
                  className="rounded-xl border border-white/15 bg-black/25 backdrop-blur-sm px-3 py-3 md:px-4 md:py-3.5 text-xs sm:text-sm text-white/90 leading-snug"
                >
                  <p className="line-clamp-5 md:line-clamp-6">&ldquo;{r.quote}&rdquo;</p>
                  <footer className="mt-2 text-[#D4AF37] text-xs font-medium">— {r.author}</footer>
                  <div className="mt-1.5 text-[#D4AF37] text-xs tracking-tight" aria-label="5 stars">
                    ★★★★★
                  </div>
                </blockquote>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4 md:gap-5 mb-4 md:mb-6 max-w-2xl text-sm sm:text-base md:text-lg text-white/95 leading-relaxed">
              {s.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {s.href.startsWith("http") ? (
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 px-6 py-3 md:px-8 md:py-4 rounded-xl bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#b8944d] transition-colors mp-btn-hover text-sm md:text-base"
            >
              {s.cta}
            </a>
          ) : (
            <Link
              href={s.href}
              className="inline-flex shrink-0 px-6 py-3 md:px-8 md:py-4 rounded-xl bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#b8944d] transition-colors mp-btn-hover text-sm md:text-base"
            >
              {s.cta}
            </Link>
          )}
        </div>
      </div>
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
