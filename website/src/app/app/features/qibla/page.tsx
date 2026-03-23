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

export default function QiblaFeaturePage() {
  return (
    <>
      <MuslimProAppBar />
      <main className="min-h-screen bg-[#032117]">
        <section className="pt-12 md:pt-20 pb-12 md:pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12 lg:gap-14">
              <div className="flex-1 min-w-0 max-w-3xl">
                <h1 className="text-2xl md:text-3xl lg:text-[2rem] font-bold text-white mb-4 leading-tight">
                  Qibla Finder: Precision for Every Prayer
                </h1>
                <p className="text-white/75 text-base md:text-lg lg:text-xl mb-6 leading-relaxed">
                  Wherever you are, we guarantee you&apos;re aligned. No matter where you are in the world faith doesn&apos;t
                  stop when you travel. Whether you&apos;re on a business trip, hiking in the mountains, or in a new city,
                  finding your direction shouldn&apos;t be a moment of doubt.
                </p>
                <p className="text-white/75 text-base md:text-lg lg:text-xl mb-8 leading-relaxed">
                  Aqala&apos;s Qibla Finder isn&apos;t just a digital needle, it&apos;s a high-precision tool engineered to
                  give you peace of mind before you say Allahu Akbar.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/qibla"
                    className="inline-flex px-6 py-3 md:px-8 md:py-4 rounded-xl bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#b8944d] transition-colors mp-btn-hover"
                  >
                    Open Qibla Finder →
                  </Link>
                  <Link
                    href="/app/prayer-times"
                    className="inline-flex px-6 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
                  >
                    Prayer Times &amp; More
                  </Link>
                </div>
              </div>
              <div className="shrink-0 flex justify-center w-full md:w-auto md:pt-1">
                <div className={mpPhoneShotFrameClass}>
                  <div className={mpPhoneShotInnerRoundedClass}>
                    <Image
                      {...mpAqalaAboutImageProps}
                      src="/aqala-about/journey-2025-prayer-qibla.jpg"
                      alt="Aqala prayer times and Qibla finder"
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
