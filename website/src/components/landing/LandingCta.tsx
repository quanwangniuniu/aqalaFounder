"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import AdLink from "@/components/AdLink";

export default function LandingCta() {
  const { t } = useLanguage();

  return (
    <section
      className="px-4 py-16 sm:py-20"
      aria-labelledby="cta-heading"
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2 id="cta-heading" className="sr-only">
          Get started with Aqala
        </h2>

        {/* Quranic verse */}
        <div className="mb-10">
          <blockquote className="quran-verse text-base text-white/50 max-w-md mx-auto">
            {t("home.quranVerse")}
            <cite className="block mt-2 text-sm text-white/30 not-italic">{t("home.quranRef")}</cite>
          </blockquote>
        </div>

        {/* Final CTA */}
        <AdLink
          href="/listen"
          className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#b8944d] text-[#032117] font-semibold text-base px-8 py-4 shadow-lg shadow-[#D4AF37]/20 hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 hover:scale-[1.02] landing-btn-glow transition-all duration-300 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#032117]"
          aria-label="Start listening to real-time translation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" />
            <path d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z" />
          </svg>
          {t("home.startListening")}
        </AdLink>

        {/* Bottom links */}
        <div className="flex items-center justify-center gap-4 mt-10 flex-wrap" role="navigation" aria-label="Secondary actions">
          <Link
            href="/reviews"
            className="text-sm text-white/40 hover:text-white/60 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:ring-offset-2 focus:ring-offset-[#032117] rounded"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {t("home.shareThoughts")}
          </Link>
          <span className="w-1 h-1 rounded-full bg-white/20" aria-hidden />
          <p className="text-sm text-white/30">{t("home.freeForever")}</p>
        </div>
      </div>
    </section>
  );
}
