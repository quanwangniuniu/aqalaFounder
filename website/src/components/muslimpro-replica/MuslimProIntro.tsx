"use client";

import Link from "next/link";

export default function MuslimProIntro() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 muslimpro-demo-arabic" dir="rtl">
          إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Innamal a&apos;malu binniyat (Indeed all actions are based on the intentions)
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
          At Muslim Pro, we provide religious tools and a personalised stream of content & resources that engage, inspire, and support Muslims around the world. From prayer times and the Holy Quran to Islamic resources and content - Muslim Pro is your digital home for all things Muslim.
        </p>
      </div>
    </section>
  );
}
