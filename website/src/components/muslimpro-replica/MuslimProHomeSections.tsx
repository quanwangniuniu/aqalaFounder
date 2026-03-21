"use client";

import Link from "next/link";
import Image from "next/image";

type HomeSection = {
  title: string;
  desc: string;
  cta: string;
  href: string;
  image: string;
  imageAlt: string;
  imageFirst: boolean;
  imageFit: "cover" | "contain";
  imageAspectClass: string;
};

// Aqala premium sections — unique AI-generated images per section
const SECTIONS: HomeSection[] = [
  {
    title: "Real-time translation for Islamic content",
    desc: "Listen to khutbahs, join rooms, and converse across languages. Quran verses, tafsir, and AI summaries — all from any language to any language. 20+ languages — English, Arabic, Urdu, Hindi, Turkish, Indonesian, Bengali, French, German, Spanish, and more. Sources & methodology",
    cta: "Get Aqala app",
    href: "/app#get-aqala-app",
    image: "/aqala-shared-listening.png",
    imageAlt: "Real-time translation — Aqala",
    imageFirst: true,
    imageFit: "cover",
    imageAspectClass: "aspect-[4/3]",
  },
  {
    title: "Automatic Quran detection",
    desc: "When you hear Quranic verses, Aqala automatically detects them and shows the surah, verse reference, and translation. Tap any verse to explore details and verify on Quran.com. Aqala automatically detects Quran verses and shows surah details, Arabic text, and translation. Explore what you hear with links to Quran.com. Sources & AI transparency",
    cta: "Try Quran detection",
    href: "/app#quran-detection",
    image: "/aqala-quran-detection.png",
    imageAlt: "Quran detection — Aqala",
    imageFirst: false,
    imageFit: "cover",
    imageAspectClass: "aspect-video",
  },
  {
    title: "Shared listening rooms",
    desc: "Join rooms with others to listen and translate together. Perfect for mosques, study circles, or connecting with the Ummah across languages.",
    cta: "Join a Room",
    href: "/rooms",
    image: "/aqala-shared-listening.png",
    imageAlt: "Shared listening — Aqala",
    imageFirst: true,
    imageFit: "cover",
    imageAspectClass: "aspect-[4/3]",
  },
];

export default function MuslimProHomeSections() {
  return (
    <section className="py-0">
      {SECTIONS.map((s, i) => (
        <div key={i} className="py-12 md:py-16 bg-[#032117]">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div
              className={`flex flex-col ${s.imageFirst ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-8 lg:gap-12`}
            >
              <div className="flex-1 max-w-xl mx-auto w-full px-2 sm:px-4">
                <div className={`relative ${s.imageAspectClass} max-h-[460px] rounded-3xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden bg-[#083726] mp-img-hover`}>
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    fill
                    className={s.imageFit === "contain" ? "object-contain" : "object-cover"}
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              </div>
              <div className="flex-1 px-4 sm:px-6 lg:px-8 min-w-0">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{s.title}</h2>
                <p className="text-white/70 leading-relaxed max-w-prose mb-6">{s.desc}</p>
                {s.href.startsWith("http") ? (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex px-6 py-3 rounded-lg bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors mp-btn-hover"
                  >
                    {s.cta}
                  </a>
                ) : (
                  <Link
                    href={s.href}
                    className="inline-flex px-6 py-3 rounded-lg bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors mp-btn-hover"
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
