"use client";

import Link from "next/link";
import Image from "next/image";

const SECTIONS = [
  {
    title: "Get Verified Prayer Times, Qibla & Adhan Notifications",
    desc: "Muslim Pro is recognized as having the most accurate prayer times among Muslim lifestyle apps, being the first app to offer verified prayer times for major cities across the world.",
    cta: "Get Prayer Times",
    href: "/muslimpro-demo/prayer-times",
    image: "/muslimpro-demo/homepage/Muslim-Pro-prayer-times-adhan-notification.png",
    imageAlt: "Muslim Pro app screen of prayer times",
    imageFirst: true,
  },
  {
    title: "Immerse & Learn the Holy Quran",
    desc: "Muslim Pro features the full Quran with Arabic scripts, coloured Tajweed, 40+ translations and more. Now, you can also learn more about selected surahs and use our tools to kick start your Quran memorizing journey.",
    cta: "Read the Quran",
    href: "/muslimpro-demo/quran",
    image: "/muslimpro-demo/homepage/muslim-pro-quran-learn-memorize.png",
    imageAlt: "Muslim Pro app Quran lessons interface",
    imageFirst: false,
  },
  {
    title: "Ask AiDeen - Muslim Pro's AI Islamic Chatbot",
    desc: "Ask AiDeen is a companion in your journey of faith, offering you information about topics in Islam on-the-go. Ask AiDeen is trained to answer your Islamic queries based on the holy Quran and authentic hadiths.",
    cta: "Ask AiDeen",
    href: "/muslimpro-demo/quran",
    image: "/muslimpro-demo/homepage/Muslim-Pro-ask-aideen-islamic-ai-chatbpt.png",
    imageAlt: "Muslim Pro Ask AiDeen Islamic AI chatbot",
    imageFirst: true,
  },
];

export default function MuslimProHomeSections() {
  return (
    <section className="py-0">
      {SECTIONS.map((s, i) => (
        <div
          key={i}
          className={`flex flex-col ${s.imageFirst ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-12 py-16 md:py-24 bg-white`}
        >
          <div className="flex-1 max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative aspect-square max-h-[400px]">
              <Image
                src={s.image}
                alt={s.imageAlt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </div>
          <div className="flex-1 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{s.title}</h1>
            <p className="text-gray-600 mb-6">{s.desc}</p>
            <Link
              href={s.href}
              className="inline-flex px-6 py-3 rounded-lg bg-[#00a651] text-white font-semibold hover:bg-[#008f44] transition-colors"
            >
              {s.cta}
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}
