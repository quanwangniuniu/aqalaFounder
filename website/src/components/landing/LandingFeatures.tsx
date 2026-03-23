"use client";

import Link from "next/link";
import AdLink from "@/components/AdLink";
import { usePrayer } from "@/contexts/PrayerContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrayerTime } from "@/lib/prayer/calculations";

const features = [
  {
    href: "/prayers",
    labelKey: "landing.prayerTimes",
    sublabelKey: "landing.schedule",
    ariaLabelKey: "landing.viewPrayerTimes",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: "/qibla",
    labelKey: "landing.qiblaFinder",
    sublabelKey: "landing.compassGuide",
    ariaLabelKey: "landing.findQibla",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" fill="#D4AF37" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/quran",
    labelKey: "landing.quran",
    sublabelKey: "landing.quranReflect",
    ariaLabelKey: "landing.openQuran",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" aria-hidden>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" />
        <path d="M8 7h8M8 11h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/donate",
    labelKey: "landing.donate",
    sublabelKey: "landing.supportProject",
    ariaLabelKey: "landing.donateSupport",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#D4AF37" aria-hidden>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
];

export default function LandingFeatures() {
  const { nextPrayer, loading: prayerLoading } = usePrayer();
  const { t } = useLanguage();

  return (
    <section
      className="px-4 py-16 sm:py-20"
      aria-labelledby="features-heading"
    >
      <div className="max-w-4xl mx-auto">
        <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-10">
          {t("landing.everythingYouNeed")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 landing-reveal-stagger">
          {features.map((f) => {
            const LinkComponent = f.href === "/donate" ? Link : AdLink;
            const isPrayer = f.href === "/prayers";
            return (
              <LinkComponent
                key={f.href}
                href={f.href}
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5 sm:p-6 hover:bg-white/10 hover:border-[#D4AF37]/30 landing-card-hover min-h-[140px] flex flex-col focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:ring-offset-2 focus:ring-offset-[#032117]"
                aria-label={t(f.ariaLabelKey)}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:bg-[#D4AF37]/10 transition-colors" aria-hidden />
                <div className="relative flex-1 flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    {f.icon}
                  </div>
                  <p className="text-xs text-white/50 mb-0.5">{t(f.labelKey)}</p>
                  {isPrayer && prayerLoading ? (
                    <div className="h-8 flex items-center" aria-busy="true">
                      <span className="text-sm text-white/40">{t("landing.loading")}</span>
                    </div>
                  ) : isPrayer && nextPrayer ? (
                    <>
                      <p className="text-base font-semibold text-white leading-tight">{nextPrayer.name}</p>
                      <p className="text-xs text-[#D4AF37]/80">{formatPrayerTime(nextPrayer.time)}</p>
                    </>
                  ) : (
                    <p className="text-sm text-white/60">{t(f.sublabelKey)}</p>
                  )}
                  {!isPrayer && <p className="text-xs text-white/40 mt-1">{t(f.sublabelKey)}</p>}
                </div>
              </LinkComponent>
            );
          })}
        </div>
      </div>
    </section>
  );
}
