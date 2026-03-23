"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * Section images (replace when you have app screenshots):
 * - 4:3 blocks: 1600 × 1200 px (min 1200 × 900), JPEG/WebP ~80%
 * - 16:9 (Quran block): 1920 × 1080 px (min 1600 × 900)
 * Images use object-cover inside rounded frames; safe area centre-weighted.
 */
type HomeSection = {
  title: string;
  paragraphs: string[];
  cta?: string;
  href?: string;
  image: string;
  imageAlt: string;
  imageFirst: boolean;
  imageFit: "cover" | "contain";
  imageAspectClass: string;
};

const SECTIONS: HomeSection[] = [
  {
    title: "Real-time translation",
    paragraphs: [
      "Follow khutbahs, lectures, and Quran recitation in your own language — live.",
      "Aqala delivers real-time translation with care, helping you understand not just the words, but the meaning.",
      "Listen, understand and stay connected across 20+ languages including Arabic, Urdu, and Turkish — with prayer times, Qibla finder, and more.",
      "Built for the Ummah, by the Ummah.",
    ],
    cta: "Try Beta Now",
    href: "/listen",
    image: "/aqala-shared-listening.png",
    imageAlt: "Real-time translation — Aqala",
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
                    sizes="(max-width: 768px) 100vw, 560px"
                  />
                </div>
              </div>
              <div className="flex-1 px-4 sm:px-6 lg:px-8 min-w-0">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{s.title}</h2>
                <div className="flex flex-col gap-4 text-white/70 leading-relaxed max-w-prose mb-6">
                  {s.paragraphs.map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
                {s.cta && s.href ? (
                  s.href.startsWith("http") ? (
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
                  )
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
