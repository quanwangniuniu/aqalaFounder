"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import AdLink from "@/components/AdLink";

export default function LandingHero() {
  const { t } = useLanguage();

  return (
    <section
      className="relative px-4 py-16 sm:py-24"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Decorative glow - reduced motion respected via globals.css */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" aria-hidden />

        <div className="relative">
          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-4 sm:mb-6"
          >
            {t("home.headline1")}
            <span className="block text-gradient-gold mt-1">{t("home.headline2")}</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-8 max-w-2xl mx-auto">
            {t("home.subheadline")}
            <span className="block mt-1 text-white/60">{t("home.subheadline2")}</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <AdLink
              href="/listen"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#b8944d] text-[#032117] font-semibold text-base sm:text-lg px-6 py-3 h-12 shadow-lg shadow-[#D4AF37]/20 hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 hover:scale-[1.02] landing-btn-glow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#032117]"
              aria-label="Start listening to real-time translation"
            >
              <span className="w-9 h-9 rounded-lg bg-white/25 flex items-center justify-center text-white" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" />
                  <path d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z" />
                </svg>
              </span>
              {t("home.startListening")}
            </AdLink>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 h-12 rounded-xl bg-white/5 border border-white/10 text-white/90 font-medium hover:bg-white/10 hover:border-[#D4AF37]/30 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#032117]"
            >
              {t("landing.howItWorks")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
