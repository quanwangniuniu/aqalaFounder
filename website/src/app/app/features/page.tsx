"use client";

import { useState } from "react";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";
import Link from "next/link";
import Image from "next/image";
import MuslimProPremiumBanner from "@/components/muslimpro-replica/MuslimProPremiumBanner";
import MuslimProFeaturesGrid from "@/components/muslimpro-replica/MuslimProFeaturesGrid";
import MuslimProFeaturesTranslationSection from "@/components/muslimpro-replica/MuslimProFeaturesTranslationSection";

const TESTIMONIALS = [
  { quote: "Finally I can follow khutbahs in my language. The real-time translation is a game-changer — I used to zone out when the imam spoke Arabic. Now I understand every word. JazakAllahu Khairan to the Aqala team.", author: "Yusuf K." },
  { quote: "I listen to Quran recitation with Urdu translation side by side. Aqala has brought my family closer to the Book. MashaAllah.", author: "Amina R." },
  { quote: "As a revert, I struggled with Arabic lectures. Aqala's live translation lets me learn at my own pace. The AI enhancement makes complex terms clearer. May Allah bless this project.", author: "James M." },
];

// Aqala feature blocks — unique premium AI-generated images
const FEATURE_BLOCKS = [
  {
    title: "Qibla Finder: Precision for Every Prayer",
    desc: "Wherever you are, we garuntee you're aligned. No matter where you are in the world faith doesn't stop when you travel. Whether you're on a business trip, hiking in the mountains, or in a new city, finding your direction shouldn't be a moment of doubt. Aqala's Qibla Finder isn't just a digital needle, it's a high-precision tool engineered to give you peace of mind before you say Allahu Akbar.",
    image: "/aqala-assets/aqala-prayer-times.jpg",
    imageAlt: "Prayer times — serene worship",
    textFirst: true,
    href: "/app/prayer-times",
  },
  {
    title: "Automatic Quran detection",
    desc: "When you hear Quranic verses, Aqala automatically detects them and shows the surah, verse reference, and translation. Tap any verse to explore details and verify on Quran.com. Explore what you hear with links to Quran.com.",
    image: "/aqala-quran-detection.png",
    imageAlt: "Quran detection — Aqala",
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
              className={`flex flex-col ${block.textFirst ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-12 mb-16 md:mb-24`}
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                  {block.title}
                </h2>
                <p className="text-white/70 mb-4">{block.desc}</p>
                <Link
                  href={block.href}
                  className="text-[#D4AF37] font-semibold hover:underline"
                >
                  Learn more →
                </Link>
              </div>
              <div className="flex-1 flex justify-center max-w-[320px] md:max-w-[400px]">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={block.image}
                    alt={block.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 320px, 400px"
                  />
                </div>
              </div>
            </div>
          ))}
          <MuslimProFeaturesTranslationSection />
        </div>
      </section>

      <MuslimProPremiumBanner />

      {/* Feature grid */}
      <section className="py-8 bg-[#06402B]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-white/70">screens of Aqala app features</p>
        </div>
      </section>

      <MuslimProFeaturesGrid />
    </>
  );
}
