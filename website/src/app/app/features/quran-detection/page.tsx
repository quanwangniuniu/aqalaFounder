"use client";

import Image from "next/image";
import Link from "next/link";
import MuslimProAppBar from "@/components/muslimpro-replica/MuslimProAppBar";
import {
  mpAqalaAboutImageProps,
  mpPhoneShotFrameClass,
  mpPhoneShotInnerRoundedClass,
  mpPhoneShotImgFeatureClass,
} from "@/components/muslimpro-replica/marketingImageClasses";

export default function QuranDetectionFeaturePage() {
  return (
    <>
      <MuslimProAppBar />
      <main className="min-h-screen bg-[#032117]">
        <section className="pt-12 md:pt-20 pb-12 md:pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row-reverse md:items-start gap-8 md:gap-12 lg:gap-14">
              <div className="flex-1 min-w-0 max-w-3xl md:order-2">
                <h1 className="text-2xl md:text-3xl lg:text-[2rem] font-bold text-white mb-4 leading-tight">
                  Automatic Quran Detection
                </h1>
                <p className="text-white/75 text-base md:text-lg lg:text-xl mb-6 leading-relaxed">
                  When you hear Quranic verses, Aqala automatically detects them and shows the surah, verse reference,
                  and translation. Tap any verse to explore details and verify on Quran.com.
                </p>
                <p className="text-white/75 text-base md:text-lg lg:text-xl mb-8 leading-relaxed">
                  Explore what you hear with links to Quran.com — deeper understanding, one verse at a time.
                </p>
                <Link
                  href="/listen"
                  className="inline-flex px-6 py-3 md:px-8 md:py-4 rounded-xl bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#b8944d] transition-colors mp-btn-hover"
                >
                  Start Listening →
                </Link>
              </div>
              <div className="shrink-0 flex justify-center w-full md:w-auto md:pt-1 md:order-1">
                <div className={mpPhoneShotFrameClass}>
                  <div className={mpPhoneShotInnerRoundedClass}>
                    <Image
                      {...mpAqalaAboutImageProps}
                      src="/aqala-about/journey-present-quran-detection.jpg"
                      alt="Automatic Quran detection while you listen"
                      width={473}
                      height={1024}
                      className={mpPhoneShotImgFeatureClass}
                      sizes="(max-width: 768px) 280px, 300px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link href="/app/features" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm">
              ← Back to all features
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
