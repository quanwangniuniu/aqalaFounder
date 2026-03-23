"use client";

import Link from "next/link";
import Image from "next/image";
import {
  mpPhoneShotFrameClass,
  mpPhoneShotInnerRoundedClass,
  mpPhoneShotImgFeatureClass,
} from "@/components/muslimpro-replica/marketingImageClasses";

/** Portrait phone screenshots: framed with w-fit to avoid letterboxing in wide boxes. */
type HomeSection = {
  title: string;
  paragraphs: string[];
  cta?: string;
  href?: string;
  image: string;
  imageAlt: string;
  imageFirst: boolean;
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
    image: "/aqala-about/journey-2025-translation.jpg",
    imageAlt: "Real-time translation — Aqala",
    imageFirst: true,
  },
  {
    title: "Prayer times & Qibla",
    paragraphs: [
      "Stay on time with prayer notifications and a clear Qibla direction wherever you are.",
      "Built alongside listening and translation so your day stays grounded in salah and understanding.",
    ],
    cta: "Open app",
    href: "/app",
    image: "/aqala-about/journey-2025-prayer-qibla.jpg",
    imageAlt: "Aqala prayer times and Qibla finder",
    imageFirst: false,
  },
  {
    title: "20+ languages",
    paragraphs: [
      "Choose the language that fits you and your family — from Arabic and Urdu to Turkish and beyond.",
      "One Ummah, many tongues: Aqala is built to help everyone follow along with clarity.",
    ],
    cta: "Learn more",
    href: "/app/features",
    image: "/aqala-about/journey-2025-languages.jpg",
    imageAlt: "Aqala translates to over 20 languages",
    imageFirst: true,
  },
];

export default function MuslimProHomeSections() {
  return (
    <section className="py-0">
      {SECTIONS.map((s, i) => (
        <div key={i} className="py-12 md:py-16 bg-[#032117]">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div
              className={`flex flex-col ${s.imageFirst ? "lg:flex-row" : "lg:flex-row-reverse"} lg:items-start gap-8 lg:gap-12`}
            >
              <div className="shrink-0 flex justify-center w-full lg:w-auto lg:min-w-[280px] px-2 sm:px-4 lg:pt-1">
                <div className={`${mpPhoneShotFrameClass} shadow-2xl shadow-black/40 mp-img-hover`}>
                  <div className={mpPhoneShotInnerRoundedClass}>
                    <Image
                      src={s.image}
                      alt={s.imageAlt}
                      width={473}
                      height={1024}
                      className={mpPhoneShotImgFeatureClass}
                      sizes="(max-width: 1024px) 90vw, 300px"
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0 max-w-2xl px-4 sm:px-6 lg:px-8 mx-auto lg:mx-0 w-full">
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
