"use client";

import Link from "next/link";
import Image from "next/image";

// Aqala premium sections — unique AI-generated images per section
const SECTIONS = [
  {
    title: "Real-time translation for Islamic content",
    desc: "Listen to khutbahs, join rooms, and converse across languages. Quran verses, tafsir, and AI summaries — all from any language to any language. 20+ languages — English, Arabic, Urdu, Hindi, Turkish, Indonesian, Bengali, French, German, Spanish, and more. Sources & methodology",
    cta: "Start Listening",
    href: "/listen",
    image: "/aqala-shared-listening.png",
    imageAlt: "Real-time translation — Aqala",
    imageFirst: true,
  },
  {
    title: "Automatic Quran detection",
    desc: "When you hear Quranic verses, Aqala automatically detects them and shows the surah, verse reference, and translation. Tap any verse to explore details and verify on Quran.com. Aqala automatically detects Quran verses and shows surah details, Arabic text, and translation. Explore what you hear with links to Quran.com. Sources & AI transparency",
    cta: "View on Quran.com",
    href: "https://quran.com",
    image: "/aqala-quran-detection.png",
    imageAlt: "Quran detection — Aqala",
    imageFirst: false,
  },
  {
    title: "Shared listening rooms",
    desc: "Join rooms with others to listen and translate together. Perfect for mosques, study circles, or connecting with the Ummah across languages.",
    cta: "Join a Room",
    href: "/rooms",
    image: "/aqala-shared-listening.png",
    imageAlt: "Shared listening — Aqala",
    imageFirst: true,
  },
];

export default function MuslimProHomeSections() {
  return (
    <section className="py-0">
      {SECTIONS.map((s, i) => (
        <div key={i} className="py-16 md:py-24 bg-[#032117]">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div
              className={`flex flex-col ${s.imageFirst ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-12`}
            >
              <div className="flex-1 max-w-xl mx-auto w-full px-2 sm:px-4">
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
              <div className="flex-1 px-4 sm:px-6 lg:px-8 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{s.title}</h1>
                <p className="text-white/70 mb-6">{s.desc}</p>
                {s.href.startsWith("http") ? (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex px-6 py-3 rounded-lg bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors"
                  >
                    {s.cta}
                  </a>
                ) : (
                  <Link
                    href={s.href}
                    className="inline-flex px-6 py-3 rounded-lg bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors"
                  >
                    {s.cta}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
