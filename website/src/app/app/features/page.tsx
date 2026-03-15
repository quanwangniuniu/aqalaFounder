"use client";

import { useState } from "react";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";
import Link from "next/link";
import Image from "next/image";
import MuslimProPremiumBanner from "@/components/muslimpro-replica/MuslimProPremiumBanner";
import MuslimProFeaturesGrid from "@/components/muslimpro-replica/MuslimProFeaturesGrid";

const TESTIMONIALS = [
  { quote: "It's the best Islamic app I've ever come across, it's super duper. Love it so much. Upgrading to the premium is the best decision I've taken in a long time. Jazakallahu khairan! May Allah reward the developers of this app with jannatul firdausi.", author: "Isa A." },
  { quote: "I love this app with all my heart, as a Muslim it helps me find mosque's near me, what the times to pray are all over the world. It has so many different abilities, you should download and see for yourself. It might be even better in the future.", author: "Amhar O." },
  { quote: "Jazakalla khair ya ikhwa. This app is wonderfully designed and only seems to get better! Perfect for the Muslim living in the west where there are so many different distractions and influences pulling one in many different directions. May Allah grant the brothers and sisters who have contributed to this app a high place in Jannah! Ameen!", author: "Moe T." },
];

const FEATURE_BLOCKS = [
  {
    title: "Prayer Times, Qibla, & Adhan",
    desc: "Never miss a prayer again with accurate prayer times, Qibla finder, and timely adhan notifications - even when you are traveling!",
    image: "/app/phone-mockups/Verified-Prayer-Times.png",
    imageAlt: "Verified Prayer Times",
    textFirst: true,
    href: "/app/prayer-times",
  },
  {
    title: "Holy Quran",
    desc: "Keep the Quran in your pocket wherever you go! Recite, memorize, and even learn essential surahs in the Quran on the go with our exciting Quran features.",
    image: "/app/phone-mockups/Immerse-in-the-Holy-Quran.png",
    imageAlt: "Immerse in the Holy Quran",
    textFirst: false,
    href: "/app/quran",
  },
  {
    title: "Ask AiDeen - Islamic AI Bot",
    desc: "Got a question about Islam? Ask AiDeen - our new AI-powered Islamic bot that can provide you with real-time information about Islam based on the Quran and authentic hadiths.",
    image: "/app/phone-mockups/Ask-Abdullah-AI-Powered-Islamic-Chatbot.png",
    imageAlt: "Ask Abdullah - AI-Powered Islamic Chatbot",
    textFirst: true,
    href: "/app/quran",
  },
  {
    title: "Qalbox & Livestream",
    desc: "Watch popular Muslim films and TV series for an enriching family time, and join live Islamic classes and webinars anytime, anywhere.",
    image: "/app/phone-mockups/Qalbox-by-Muslim-Pro-1.png",
    imageAlt: "Aqala content",
    textFirst: false,
    href: "/rooms",
  },
];

export default function MuslimProFeaturesPage() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const t = TESTIMONIALS[testimonialIndex];

  return (
    <>
      <MuslimProAppBar />
      {/* Hero - Muslim Pro's Features + testimonial carousel */}
      <section className="relative pt-12 md:pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a5c3e]/15 via-white to-white" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 text-center mb-8 md:mb-10">
            Aqala&apos;s Features
          </h2>

          {/* Testimonial carousel */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white/95 backdrop-blur rounded-2xl p-6 md:p-8 border border-gray-200 shadow-lg">
              <blockquote className="text-gray-700 text-center text-base md:text-lg leading-relaxed mb-4">
                &ldquo;<em>{t.quote}</em>&rdquo; <strong>— {t.author}</strong>
              </blockquote>
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setTestimonialIndex((i) => (i === 0 ? 2 : i - 1))}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Previous"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex gap-2">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialIndex(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === testimonialIndex ? "bg-[#00a651]" : "bg-gray-300"}`}
                      aria-label={`Testimonial ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setTestimonialIndex((i) => (i === 2 ? 0 : i + 1))}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Next"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketing statement - H1 */}
      <section className="py-6 md:py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center max-w-4xl mx-auto">
            From prayer times & adhan notifications to the holy quran with 40+ translations - muslim pro is the essential islamic app companion.
          </h1>
        </div>
      </section>

      {/* Feature blocks - alternating image + text (matches Muslim Pro layout) */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {FEATURE_BLOCKS.map((block) => (
            <div
              key={block.title}
              className={`flex flex-col ${block.textFirst ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-12 mb-16 md:mb-24 last:mb-0`}
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  {block.title}
                </h2>
                <p className="text-gray-600 mb-4">{block.desc}</p>
                <Link
                  href={block.href}
                  className="text-[#00a651] font-semibold hover:underline"
                >
                  Learn more →
                </Link>
              </div>
              <div className="flex-1 flex justify-center max-w-[280px] md:max-w-[320px]">
                <div className="relative w-full aspect-[9/19] max-h-[400px]">
                  <Image
                    src={block.image}
                    alt={block.imageAlt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 280px, 320px"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <MuslimProPremiumBanner />

      {/* screens of Muslim Pro app features - caption above grid */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">screens of Aqala app features</p>
        </div>
      </section>

      <MuslimProFeaturesGrid />
    </>
  );
}
