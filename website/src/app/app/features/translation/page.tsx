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

const COMPARISON_ROWS = [
  {
    feature: "Khutbah & Lecture Understanding",
    aqala:
      "Purpose-built for Islamic lectures and khutbahs, preserving meaning and context within the Islamic space.",
    generic:
      "General-purpose translation. Limited understanding of Islamic context. Misrepresentation of individual words.",
  },
  {
    feature: "Quran Verse Detection",
    aqala:
      "Automatically detects verses and produces an interactive reference that enables deeper exploration and understanding.",
    generic: "No native Quran-aware detection or structured verse recognition.",
  },
  {
    feature: "Contextual Accuracy",
    aqala:
      "Designed to convey meaning with care, complementary to the depth of Islamic content and scripts.",
    generic:
      "Often literal, lacking nuance. Underperforming contextual understanding. Translates word by word, therefore losing context of phrases and body texts.",
  },
  {
    feature: "Performance in Long Sessions",
    aqala:
      "Optimised for stability during extended lectures and live events. Purpose built for extended performance requirements.",
    generic:
      "Often tuned for short snippets and short conversational communication, less reliable over long sessions.",
  },
  {
    feature: "Purpose & Focus",
    aqala: "Built specifically for the Ummah, with Islamic use cases and knowledge at its core.",
    generic: "Built for general use across all content types.",
  },
  {
    feature: "Intention",
    aqala: "Built for Muslims, by Muslims. Thoughtfully designed to reflect Islamic values in every detail.",
    generic: "Other platforms lack this intentional focus and cultural grounding.",
  },
];

export default function TranslationFeaturePage() {
  return (
    <>
      <MuslimProAppBar />
      <main className="min-h-screen bg-[#032117]">
        {/* Hero + intro */}
        <section className="pt-12 md:pt-16 pb-8 md:pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center mb-6">
              Why should I pick Aqala and not turn back?
            </h1>
            <div className="max-w-3xl mx-auto text-center mb-8 space-y-4 text-white/80 leading-relaxed">
              <h2 className="text-lg font-semibold text-[#D4AF37]">Our intention.</h2>
              <p className="text-white font-medium">Aqala is built for understanding, not just translation</p>
              <p>
                Aqala goes beyond basic translation by combining deep contextual accuracy with stable, real-time
                performance, purposefully designed for Islamic content &amp; conversation.
              </p>
              <p>
                Every word is delivered with clarity and care, preserving the depth, meaning, and essence behind what you
                hear.
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12 lg:gap-14">
              <div className="flex-1 min-w-0 max-w-3xl">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                  Real-Time Translation: Engineered for the Deen
                </h2>
                <p className="text-[#D4AF37] font-semibold text-xl md:text-2xl mb-5 leading-snug">
                  Beyond words. Into the heart of the message.
                </p>
                <p className="text-white/75 text-base md:text-lg lg:text-xl mb-6 leading-relaxed">
                  At Aqala, we understand that Islamic discourse is unique. A Friday Khutbah or a scholarly lecture
                  carries layers of history, theology, and sacred language that general-purpose AI simply cannot grasp
                  &amp; convey. We&apos;ve built a specialized engine that doesn&apos;t just translate, it interprets
                  with Contextual Islamic Intelligence.
                </p>
                <Link
                  href="/listen"
                  className="inline-flex px-6 py-3 md:px-8 md:py-4 rounded-xl bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#b8944d] transition-colors mp-btn-hover"
                >
                  Start Listening →
                </Link>
              </div>
              <div className="shrink-0 flex justify-center w-full md:w-auto md:pt-1">
                <div className={mpPhoneShotFrameClass}>
                  <div className={mpPhoneShotInnerRoundedClass}>
                    <Image
                      {...mpAqalaAboutImageProps}
                      src="/aqala-about/journey-2025-translation.jpg"
                      alt="Real-time translation — Aqala"
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

        {/* Capabilities */}
        <section className="py-12 md:py-16 bg-[#06402B]/50 border-y border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-5">The Core Capabilities</h3>
            <ul className="space-y-5 text-white/75 text-base md:text-lg leading-relaxed max-w-3xl">
              <li>
                <strong className="text-white">Sub-Second Latency:</strong> Experience translation at the speed of
                speech. Our infrastructure is optimized for &quot;Live-Stream&quot; environments, ensuring you stay in
                sync with the speaker&apos;s emotion and pacing.
              </li>
              <li>
                <strong className="text-white">Context-Aware Islamic AI:</strong> Standard AI often mistranslates
                technical Fiqh (jurisprudence) or Hadith terms. Aqala is trained on a massive corpus of Islamic
                literature to ensure that Taqwa isn&apos;t just &quot;faith&quot; and Ihsan isn&apos;t just
                &quot;goodness&quot; — the spiritual weight remains intact.
              </li>
              <li>
                <strong className="text-white">Automatic Verse Recognition:</strong> As a speaker recites the Quran,
                Aqala instantly identifies the Surah and Ayah, providing the official scriptural translation alongside
                the live speech.
              </li>
              <li>
                <strong className="text-white">Dialect &amp; Accent Adaptation:</strong> From the mosques of Cairo to the
                halls of London, our AI is fine-tuned to recognize 20+ languages and various regional accents, ensuring
                clarity regardless of the speaker&apos;s origin.
              </li>
            </ul>
          </div>
        </section>

        {/* Comparison table */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl md:text-2xl font-bold text-[#D4AF37] text-center mb-6">
              How we compare to generic translation tools
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-lg shadow-black/30">
              <table className="w-full min-w-[720px] bg-[#032117] text-sm md:text-base">
                <thead>
                  <tr className="border-b border-white/10 bg-[#021a12]">
                    <th className="text-left text-white font-semibold px-4 md:px-5 py-4 w-[22%]">Feature</th>
                    <th className="text-left text-[#D4AF37] font-semibold px-4 md:px-5 py-4 w-[39%]">Aqala</th>
                    <th className="text-left text-white/90 font-semibold px-4 md:px-5 py-4 w-[39%]">
                      Generic Translation Tools
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="border-b border-white/10 last:border-b-0 align-top">
                      <td className="px-4 md:px-5 py-4 text-white font-medium">{row.feature}</td>
                      <td className="px-4 md:px-5 py-4 text-white/90 leading-relaxed">{row.aqala}</td>
                      <td className="px-4 md:px-5 py-4 text-white/70 leading-relaxed">{row.generic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-10">
              <Link
                href="/listen"
                className="inline-flex px-8 py-4 rounded-xl bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#b8944d] transition-colors mp-btn-hover"
              >
                Try Aqala Translation →
              </Link>
            </div>
          </div>
        </section>

        {/* Privacy & momentum */}
        <section className="py-12 md:py-16 bg-[#06402B]/30 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-[#D4AF37] mb-4">Your Privacy, Your Journey</h3>
              <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-3xl">
                We process your translation in a secure, encrypted environment. Data is handled &quot;in-flight&quot; and
                never sold. Save your favorite translated lectures to your personal library for future reflection — on
                your terms.
              </p>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-[#D4AF37] mb-4">Global Momentum</h3>
              <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-3xl">
                With usage in 22+ countries, Aqala has processed over 22,000+ minutes of Islamic content — thousands of
                believers who, for the first time, truly understood the Friday message in their own language.
              </p>
            </div>
          </div>
        </section>

        {/* Back to features */}
        <section className="py-8 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link
              href="/app/features"
              className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm"
            >
              ← Back to all features
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
