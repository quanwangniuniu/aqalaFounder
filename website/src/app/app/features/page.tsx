"use client";

import { useState } from "react";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";
import Image from "next/image";
import MuslimProPremiumBanner from "@/components/muslimpro-replica/MuslimProPremiumBanner";
import MuslimProFeaturesGrid from "@/components/muslimpro-replica/MuslimProFeaturesGrid";
import {
  mpAqalaAboutImageProps,
  mpPhoneShotFrameClass,
  mpPhoneShotInnerRoundedClass,
  mpPhoneShotImgGridClass,
} from "@/components/muslimpro-replica/marketingImageClasses";

const TESTIMONIALS = [
  { quote: "Finally I can follow khutbahs in my language. The real-time translation is a game-changer — I used to zone out when the imam spoke Arabic. Now I understand every word. JazakAllahu Khairan to the Aqala team.", author: "Yusuf K." },
  { quote: "I listen to Quran recitation with Urdu translation side by side. Aqala has brought my family closer to the Book. MashaAllah.", author: "Amina R." },
  { quote: "As a revert, I struggled with Arabic lectures. Aqala's live translation lets me learn at my own pace. The AI enhancement makes complex terms clearer. May Allah bless this project.", author: "James M." },
];

export default function MuslimProFeaturesPage() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const t = TESTIMONIALS[testimonialIndex];

  return (
    <>
      <MuslimProAppBar />
      {/* Hero - Aqala Features + testimonial carousel */}
      <section className="relative pt-12 md:pt-20 pb-12 overflow-hidden bg-[#032117]">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-8 md:mb-10">
            Aqala&apos;s Features
          </h2>

          {/* Testimonial carousel */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 md:p-8 border border-white/10">
              <blockquote className="text-white/90 text-center text-base md:text-lg leading-relaxed mb-4">
                &ldquo;<em>{t.quote}</em>&rdquo; <strong className="text-[#D4AF37]">— {t.author}</strong>
              </blockquote>
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setTestimonialIndex((i) => (i === 0 ? 2 : i - 1))}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Previous"
                >
                  <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex gap-2">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialIndex(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === testimonialIndex ? "bg-[#D4AF37]" : "bg-white/30"}`}
                      aria-label={`Testimonial ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setTestimonialIndex((i) => (i === 2 ? 0 : i + 1))}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Next"
                >
                  <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketing statement - H1 */}
      <section className="py-6 md:py-8 bg-[#06402B]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl md:text-2xl font-bold text-white text-center max-w-4xl mx-auto">
            From prayer times & adhan notifications to the holy Quran with real-time translation in 20+ languages — Aqala is your essential Islamic app companion.
          </h1>
        </div>
      </section>

      {/* Feature grid — each card links to a middle page that describes the feature and links to the actual tool */}
      <section className="py-12 md:py-16 bg-[#032117]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-white/65 text-center max-w-2xl mx-auto mb-10">
            Click any feature to learn more, then use the button to open it.
          </p>
          <MuslimProFeaturesGrid />
        </div>
      </section>

      <MuslimProPremiumBanner />

      {/* Product screenshots (moved from About — desktop-friendly max heights) */}
      <section className="py-12 md:py-16 bg-[#06402B]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-2">
            Screens from the app
          </h2>
          <p className="text-sm text-white/65 text-center max-w-2xl mx-auto mb-10 md:mb-12">
            Real product UI: home, translation, languages, prayer &amp; Qibla, Quran detection, and more.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                src: "/aqala-about/mission-listen-home.jpg",
                alt: "Aqala home — Don\u2019t just listen. Understand.",
                caption: "Home & listen",
              },
              {
                src: "/aqala-about/journey-2024-concept.jpg",
                alt: "Aqala brand and app — Connecting through comprehension",
                caption: "Brand & vision",
              },
              {
                src: "/aqala-about/journey-2025-translation.jpg",
                alt: "Real-time translation for khutbahs, lectures, Quran and Islamic content",
                caption: "Real-time translation",
              },
              {
                src: "/aqala-about/journey-2025-languages.jpg",
                alt: "Aqala translates to over 20 languages",
                caption: "20+ languages",
              },
              {
                src: "/aqala-about/journey-2025-prayer-qibla.jpg",
                alt: "Aqala prayer times and Qibla finder",
                caption: "Prayer & Qibla",
              },
              {
                src: "/aqala-about/journey-present-quran-detection.jpg",
                alt: "Automatic Quran detection while you listen",
                caption: "Quran detection",
              },
              {
                src: "/aqala-about/journey-present-suite.jpg",
                alt: "Aqala app — Listen, prayer, Qibla, settings and more",
                caption: "Full suite",
              },
            ].map((item) => (
              <figure key={item.src} className="flex flex-col items-center">
                <div className={mpPhoneShotFrameClass}>
                  <div className={mpPhoneShotInnerRoundedClass}>
                    <Image
                      {...mpAqalaAboutImageProps}
                      src={item.src}
                      alt={item.alt}
                      width={473}
                      height={1024}
                      className={mpPhoneShotImgGridClass}
                      sizes="(max-width: 1023px) 46vw, 22vw"
                    />
                  </div>
                </div>
                <figcaption className="text-white/55 text-xs mt-2.5 text-center max-w-[220px]">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
