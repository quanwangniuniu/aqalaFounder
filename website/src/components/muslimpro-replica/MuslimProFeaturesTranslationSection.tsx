import Image from "next/image";
import Link from "next/link";
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
      "Purpose-built for Islamic lectures and khutbahs, preserving meaning and context within the Islamic space",
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
      "Often tuned for short snippets and short conversational communication, less reliable over long sessions",
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
] as const;

export default function MuslimProFeaturesTranslationSection() {
  return (
    <div className="mb-16 md:mb-24">
      <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12 lg:gap-14 mb-12 md:mb-16">
        <div className="flex-1 min-w-0 max-w-3xl">
          <h2 className="text-2xl md:text-3xl lg:text-[2rem] font-bold text-white mb-3 leading-tight">
            Real-Time Translation: Engineered for the Deen
          </h2>
          <p className="text-[#D4AF37] font-semibold text-xl md:text-2xl mb-5 leading-snug">
            Beyond words. Into the heart of the message.
          </p>
          <p className="text-white/75 text-base md:text-lg lg:text-xl mb-5 leading-relaxed">
            At Aqala, we understand that Islamic discourse is unique. A Friday Khutbah or a scholarly lecture carries
            layers of history, theology, and sacred language that general-purpose AI simply cannot grasp & convey.
            We&apos;ve built a specialized engine that doesn&apos;t just translate, it interprets with Contextual Islamic
            Intelligence.
          </p>
          <Link href="/listen" className="inline-flex text-[#D4AF37] text-base md:text-lg font-semibold hover:underline">
            Learn more →
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

      <div className="space-y-12 md:space-y-16">
        <section>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-5">The Core Capabilities</h3>
          <ul className="space-y-5 text-white/75 text-base md:text-lg leading-relaxed">
            <li>
              <strong className="text-white">Sub-Second Latency:</strong> Experience translation at the speed of speech.
              Our infrastructure is optimized for &quot;Live-Stream&quot; environments, ensuring you stay in sync with
              the speaker&apos;s emotion and pacing.
            </li>
            <li>
              <strong className="text-white">Context-Aware Islamic AI:</strong> Standard AI often mistranslates technical
              Fiqh (jurisprudence) or Hadith terms. Aqala is trained on a massive corpus of Islamic literature to ensure
              that Taqwa isn&apos;t just &quot;faith&quot; and Ihsan isn&apos;t just &quot;goodness&quot; — the spiritual
              weight remains intact.
            </li>
            <li>
              <strong className="text-white">Automatic Verse Recognition:</strong> As a speaker recites the Quran, Aqala
              instantly identifies the Surah and Ayah, providing the official scriptural translation alongside the live
              speech.
            </li>
            <li>
              <strong className="text-white">Dialect & Accent Adaptation:</strong> From the mosques of Cairo to the halls
              of London, our AI is fine-tuned to recognize 20+ languages and various regional accents, ensuring clarity
              regardless of the speaker&apos;s origin.
            </li>
          </ul>
        </section>

        <section>
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-[#D4AF37] mb-4 md:mb-5">
              Why Aqala is the New Standard
            </h3>
            <p className="text-white font-semibold text-lg md:text-xl mb-4">Aqala is built for understanding, not just translation</p>
            <p className="text-white/75 text-base md:text-lg mb-4 leading-relaxed">
              Aqala goes beyond basic translation by combining deep contextual accuracy with stable, real-time
              performance, purposefully designed for Islamic content & conversation.
            </p>
            <p className="text-white/75 text-base md:text-lg leading-relaxed">
              Every word is delivered with clarity and care, preserving the depth, meaning, and essence behind what you
              hear.
            </p>
          </div>

          <h4 className="text-xl md:text-2xl font-bold text-[#D4AF37] text-center max-w-3xl mx-auto mb-5 md:mb-6 leading-snug px-2">
            To understand the leap in technology, see how we compare to Generic translation tools when handling sacred
            content
          </h4>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#032117]">
            <table className="w-full min-w-[640px] text-left text-base md:text-lg">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 md:p-4 font-bold text-white w-[22%]">Feature</th>
                  <th className="p-3 md:p-4 font-bold text-[#D4AF37] w-[39%]">Aqala</th>
                  <th className="p-3 md:p-4 font-bold text-white/80 w-[39%]">Generic Translation Tools</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="border-b border-white/5 align-top">
                    <td className="p-3 md:p-4 text-white/90 font-medium">{row.feature}</td>
                    <td className="p-3 md:p-4 text-white/70">{row.aqala}</td>
                    <td className="p-3 md:p-4 text-white/60">{row.generic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="text-left max-w-3xl">
          <h3 className="text-2xl md:text-3xl font-bold text-[#D4AF37] mb-5 md:mb-6">
            Global Momentum & Credibility
          </h3>
          <p className="text-white/75 text-base md:text-lg mb-4 leading-relaxed">
            We aren&apos;t just a &quot;beta&quot; project; we are a proven global infrastructure for the Ummah.
          </p>
          <p className="text-white font-bold text-xl md:text-2xl mb-4 leading-relaxed">
            &quot;A Metric that Never Sleeps.&quot;
          </p>
          <p className="text-white/75 text-base md:text-lg leading-relaxed">
            With an amassed usage in 22+ countries, Aqala has already processed over 22,000+ minutes of Islamic content.
            This represents thousands of believers who, for the first time, truly understood the Friday message in their
            own language.
          </p>
        </section>

        <section>
          <h3 className="text-2xl md:text-3xl font-bold text-[#D4AF37] text-center mb-5 md:mb-6">
            Your Privacy, Your Journey
          </h3>
          <p className="max-w-3xl mx-auto text-center text-xl md:text-2xl font-semibold text-white mb-6 md:mb-8 leading-relaxed px-2">
            We process your translation in a secure, encrypted environment.
          </p>
          <ul className="max-w-3xl mx-auto list-disc marker:text-[#D4AF37] pl-5 sm:pl-6 space-y-4 text-white/75 text-base md:text-lg text-left leading-relaxed mb-6 md:mb-8">
            <li>
              <span className="text-white font-semibold">Real-time Processing:</span> Data is handled
              &quot;in-flight&quot; and never sold.
            </li>
            <li>
              <span className="text-white font-semibold">Content Saving:</span> Save your favorite translated lectures
              to your personal library for future reflection. On your terms.
            </li>
          </ul>
          <p className="max-w-3xl mx-auto text-center text-xl md:text-2xl font-semibold text-white mb-6 md:mb-8 leading-relaxed px-2">
            The message of the Mimbar, now universal.
          </p>
          <ul className="max-w-3xl mx-auto list-disc marker:text-[#D4AF37] pl-5 sm:pl-6 space-y-4 text-white/75 text-base md:text-lg text-left leading-relaxed">
            <li>
              <span className="text-white font-semibold">22,000+ Minutes Translated:</span> We have already processed a
              staggering volume of Islamic content. That&apos;s over 360 hours of pure knowledge delivered to seekers
              worldwide! That clock never stops ticking.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
