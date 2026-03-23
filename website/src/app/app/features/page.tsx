"use client";

import { useState } from "react";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";
import Link from "next/link";
import Image from "next/image";
import MuslimProPremiumBanner from "@/components/muslimpro-replica/MuslimProPremiumBanner";
import MuslimProFeaturesGrid from "@/components/muslimpro-replica/MuslimProFeaturesGrid";
import MuslimProFeaturesTranslationSection from "@/components/muslimpro-replica/MuslimProFeaturesTranslationSection";
import {
  mpPhoneShotFrameClass,
  mpPhoneShotInnerRoundedClass,
  mpPhoneShotImgFeatureClass,
  mpPhoneShotImgGridClass,
} from "@/components/muslimpro-replica/marketingImageClasses";

const TESTIMONIALS = [
  { quote: "Finally I can follow khutbahs in my language. The real-time translation is a game-changer — I used to zone out when the imam spoke Arabic. Now I understand every word. JazakAllahu Khairan to the Aqala team.", author: "Yusuf K." },
  { quote: "I listen to Quran recitation with Urdu translation side by side. Aqala has brought my family closer to the Book. MashaAllah.", author: "Amina R." },
  { quote: "As a revert, I struggled with Arabic lectures. Aqala's live translation lets me learn at my own pace. The AI enhancement makes complex terms clearer. May Allah bless this project.", author: "James M." },
];

// Aqala feature blocks — unique premium AI-generated images
const FEATURE_BLOCKS = [
  {
    title: "Qibla Finder: Precision for Every Prayer",
    desc: "Wherever you are, we guarantee you're aligned. No matter where you are in the world faith doesn't stop when you travel. Whether you're on a business trip, hiking in the mountains, or in a new city, finding your direction shouldn't be a moment of doubt. Aqala's Qibla Finder isn't just a digital needle, it's a high-precision tool engineered to give you peace of mind before you say Allahu Akbar.",
    image: "/aqala-about/journey-2025-prayer-qibla.jpg",
    imageAlt: "Aqala prayer times and Qibla finder",
    textFirst: true,
    href: "/app/prayer-times",
  },
  {
    title: "Automatic Quran detection",
    desc: "When you hear Quranic verses, Aqala automatically detects them and shows the surah, verse reference, and translation. Tap any verse to explore details and verify on Quran.com. Explore what you hear with links to Quran.com.",
    image: "/aqala-about/journey-present-quran-detection.jpg",
    imageAlt: "Automatic Quran detection while you listen",
    textFirst: false,
    href: "/listen",
  },
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

      {/* Feature blocks */}
      <section className="py-12 md:py-20 bg-[#032117]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {FEATURE_BLOCKS.slice(0, 2).map((block) => (
            <div
              key={block.title}
              className={`flex flex-col ${block.textFirst ? "md:flex-row" : "md:flex-row-reverse"} md:items-start gap-8 md:gap-12 lg:gap-14 mb-16 md:mb-24`}
            >
              <div className="flex-1 min-w-0 max-w-3xl">
                <h2 className="text-2xl md:text-3xl lg:text-[2rem] font-bold text-white mb-4 leading-tight">
                  {block.title}
                </h2>
                <p className="text-white/75 text-base md:text-lg lg:text-xl mb-5 leading-relaxed">{block.desc}</p>
                <Link
                  href={block.href}
                  className="inline-flex text-[#D4AF37] text-base md:text-lg font-semibold hover:underline"
                >
                  Learn more →
                </Link>
              </div>
              <div className="shrink-0 flex justify-center w-full md:w-auto md:pt-1">
                <div className={mpPhoneShotFrameClass}>
                  <div className={mpPhoneShotInnerRoundedClass}>
                    <Image
                      src={block.image}
                      alt={block.imageAlt}
                      width={473}
                      height={1024}
                      className={mpPhoneShotImgFeatureClass}
                      sizes="(max-width: 768px) 280px, 300px"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <MuslimProFeaturesTranslationSection />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                      src={item.src}
                      alt={item.alt}
                      width={473}
                      height={1024}
                      className={mpPhoneShotImgGridClass}
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px"
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

      <MuslimProFeaturesGrid />
    </>
  );
}
