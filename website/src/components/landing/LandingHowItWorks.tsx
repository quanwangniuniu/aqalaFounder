"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const STEPS = [
  {
    step: 1,
    titleKey: "landing.chooseLanguage",
    descKey: "landing.chooseLanguageDesc",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    step: 2,
    titleKey: "landing.startListeningStep",
    descKey: "landing.startListeningDesc",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#D4AF37">
        <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" />
        <path d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z" />
      </svg>
    ),
  },
  {
    step: 3,
    titleKey: "landing.readTranslation",
    descKey: "landing.readTranslationDesc",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

export default function LandingHowItWorks() {
  const { t } = useLanguage();

  return (
    <section
      className="px-4 py-16 sm:py-20"
      aria-labelledby="how-heading"
    >
      <div className="max-w-4xl mx-auto">
        <h2 id="how-heading" className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
          {t("landing.howItWorks")}
        </h2>
        <p className="text-white/60 text-center text-sm sm:text-base max-w-xl mx-auto mb-12">
          {t("landing.howItWorksSubtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 landing-reveal-stagger">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="relative text-center rounded-2xl p-4 hover:bg-white/5 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4">
                {s.icon}
              </div>
              <p className="text-[#D4AF37] text-sm font-semibold mb-1">{t("landing.step")} {s.step}</p>
              <h3 className="text-white font-semibold mb-2">{t(s.titleKey)}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{t(s.descKey)}</p>
            </div>
          ))}
        </div>

        {/* Quran Detection sub-section with product image */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 sm:p-8 md:p-10 transition-all duration-300 hover:border-white/15">
          <div className="absolute top-0 left-0 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" aria-hidden />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:gap-12">
            <div className="flex-1 order-2 lg:order-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                {t("landing.automaticQuran")}
              </h3>
              <p className="text-white/70 leading-relaxed mb-4">
                {t("landing.automaticQuranDesc")}
              </p>
              <p className="text-[#D4AF37] font-medium text-sm sm:text-base">
                {t("landing.exploreWhatYouHear")}
              </p>
              <Link
                href="https://quran.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-[#D4AF37] hover:text-[#E8D5A3] font-medium transition-colors"
              >
                {t("landing.viewOnQuran")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </Link>
            </div>
            <div className="flex-1 order-1 lg:order-2 flex justify-center lg:justify-end mb-6 lg:mb-0">
              <div className="relative w-full max-w-sm landing-img-hover rounded-2xl">
                <Image
                  src="/aqala-quran-detection.png"
                  alt="Aqala automatically detects Quran verses and shows surah details, Arabic text, and translation. Explore what you hear with links to Quran.com."
                  width={600}
                  height={700}
                  className="w-full h-auto rounded-2xl border border-white/10 shadow-xl"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/90 font-medium hover:bg-white/10 hover:border-[#D4AF37]/30 transition-all text-sm"
          >
            {t("landing.sourcesTransparency")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
