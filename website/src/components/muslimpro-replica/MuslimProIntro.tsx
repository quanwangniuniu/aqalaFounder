"use client";

import Image from "next/image";
import {
  mpAqalaAboutImageProps,
  mpPhoneShotFrameClass,
  mpPhoneShotInnerRoundedClass,
  mpPhoneShotImgFeatureClass,
} from "@/components/muslimpro-replica/marketingImageClasses";

export default function MuslimProIntro() {
  return (
    <section className="py-16 md:py-24 bg-[#032117]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Language should never be a barrier to understanding Islam
            </h2>
            <div className="flex flex-col gap-8 md:gap-10 text-lg text-white/75 leading-relaxed">
              <p>At Aqala, we believe understanding is at the heart of connection in Islam.</p>
              <p>
                The Quran was revealed as guidance for all of humanity, and its message is meant to be understood,
                reflected upon, and lived. Yet for many, language remains a barrier.
              </p>
              <p>
                That&apos;s why we care deeply about translation — not just word-for-word, but meaning and context —
                so that every khutbah, lecture, verse and conversation can be truly understood.
              </p>
              <p>When understanding grows, so does connection, reflection, and faith.</p>
            </div>
          </div>
          <figure className="order-1 lg:order-2 flex flex-col items-center lg:items-end lg:pt-1">
            <div className={`${mpPhoneShotFrameClass} lg:mx-0 shadow-xl shadow-black/30`}>
              <div className={mpPhoneShotInnerRoundedClass}>
                <Image
                  {...mpAqalaAboutImageProps}
                  src="/aqala-about/journey-2024-concept.jpg"
                  alt="Aqala brand and app — Connecting through comprehension"
                  width={473}
                  height={1024}
                  className={mpPhoneShotImgFeatureClass}
                  sizes="(max-width: 1024px) 90vw, 300px"
                />
              </div>
            </div>
            <figcaption className="text-white/45 text-xs mt-3 text-center lg:text-right w-[280px] sm:w-[300px] max-w-full leading-snug">
              Our brand &amp; vision 
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
