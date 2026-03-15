"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LandingTrust() {
  const { t } = useLanguage();

  const testimonials = [
    { quoteKey: "landing.testimonial1", author: "Amina K." },
    { quoteKey: "landing.testimonial2", author: "Hassan R." },
    { quoteKey: "landing.testimonial3", author: "Fatima M." },
  ];

  return (
    <section
      className="px-4 py-16 sm:py-20"
      aria-labelledby="trust-heading"
    >
      <div className="max-w-5xl mx-auto">
        <h2 id="trust-heading" className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
          {t("landing.trustedByUmmah")}
        </h2>
        <p className="text-white/60 text-center text-sm sm:text-base max-w-2xl mx-auto mb-12">
          {t("landing.trustSubtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 landing-reveal-stagger">
          {testimonials.map((testimonial, i) => (
            <blockquote
              key={i}
              className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 hover:border-[#D4AF37]/30 landing-card-hover"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" aria-hidden />
              <p className="relative text-white/80 text-sm leading-relaxed mb-4">
                &ldquo;{t(testimonial.quoteKey)}&rdquo;
              </p>
              <div className="flex gap-1 text-[#D4AF37] text-base" aria-label="5 stars">
                {[1, 2, 3, 4, 5].map((j) => (
                  <span key={j} aria-hidden>★</span>
                ))}
              </div>
              <footer className="mt-3 text-xs text-white/50">— {testimonial.author}</footer>
            </blockquote>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-white/50 text-sm">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#D4AF37] flex-shrink-0">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>{t("landing.freeCoreFeatures")}</span>
          </div>
          <a
            href="https://quran.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors duration-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#D4AF37] flex-shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>{t("landing.verifiedSources")}</span>
          </a>
          <Link href="/privacy" className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors duration-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#D4AF37] flex-shrink-0">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span>{t("landing.privacyFirst")}</span>
          </Link>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/reviews"
            className="text-sm text-[#D4AF37] hover:text-[#E8D5A3] font-medium transition-colors inline-flex items-center gap-1.5"
          >
            {t("home.shareThoughts")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
