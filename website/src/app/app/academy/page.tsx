"use client";

import Link from "next/link";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";

const COURSES = [
  {
    title: "Quran Recitation for Beginners",
    desc: "Learn to recite the Quran with proper Tajweed. Step-by-step lessons for children and adults.",
    icon: "📖",
    href: "/app/quran",
  },
  {
    title: "Arabic for Kids",
    desc: "Fun, interactive Arabic lessons designed for young learners. Letters, words, and simple phrases.",
    icon: "🔤",
    href: "/app/academy",
  },
  {
    title: "Islamic Stories & Duas",
    desc: "Engaging stories of the Prophets and daily duas. Build a strong foundation in faith.",
    icon: "📚",
    href: "/app/academy",
  },
  {
    title: "Ramadan & Fasting",
    desc: "Understand the virtues of Ramadan, how to fast, and make the most of the blessed month.",
    icon: "🌙",
    href: "/app/blog",
  },
];

export default function MuslimProAcademyPage() {
  return (
    <>
      <MuslimProAppBar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a5c3e]/5 to-transparent">
        <div className="absolute inset-0 opacity-5">
          <img src="/app/banner-bg.svg" alt="" className="w-full h-full object-cover" aria-hidden />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Academy</h1>
          <p className="text-lg text-gray-600 max-w-2xl mb-8">
            Islamic courses and educational content for the whole family. Learn Quran, Arabic, and Islamic values at your own pace.
          </p>
        </div>
      </section>

      {/* Course grid */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Courses & Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COURSES.map((course) => (
              <Link
                key={course.title}
                href={course.href}
                className="mp-card-hover flex gap-4 p-6 rounded-2xl border border-gray-200 hover:border-[#00a651]/30 transition-colors"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-[#0a5c3e]/10 flex items-center justify-center text-2xl">
                  {course.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.desc}</p>
                  <span className="inline-block mt-2 text-[#00a651] font-semibold text-sm hover:underline">
                    Start learning →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Kids section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Safe & Fun for Kids</h2>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Academy content is carefully curated to be age-appropriate and engaging. Parents can guide children through Quran, daily duas, and kid-friendly videos that help instill Islamic values in a fun and meaningful way.
          </p>
          <Link
            href="/app/app"
            className="inline-flex px-6 py-3 rounded-lg bg-[#00a651] text-white font-semibold hover:bg-[#008f44] transition-colors"
          >
            Download Free App
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get the full experience in the app</h2>
          <p className="text-gray-600 mb-6">Access all Academy courses, videos, and interactive lessons in the Aqala app.</p>
          <Link
            href="/app/app"
            className="inline-flex px-8 py-4 rounded-lg bg-[#00a651] text-white font-bold hover:bg-[#008f44] transition-colors"
          >
            Download Free App
          </Link>
        </div>
      </section>
    </>
  );
}
