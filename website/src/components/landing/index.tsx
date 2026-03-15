"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import LandingNav from "./LandingNav";
import LandingHero from "./LandingHero";
import LandingFeatures from "./LandingFeatures";
import LandingTrust from "./LandingTrust";
import LandingHowItWorks from "./LandingHowItWorks";
import LandingValueProp from "./LandingValueProp";
import LandingCta from "./LandingCta";
import LandingFooter from "./LandingFooter";
import LandingScrollReveal from "./LandingScrollReveal";

export default function LandingPage() {
  const { isRTL } = useLanguage();

  return (
    <div className="relative min-h-screen overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#D4AF37] focus:text-[#032117] focus:rounded-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      <div className="relative z-10 min-h-screen flex flex-col">
        <LandingNav />
        <main id="main-content" className="flex-1 flex flex-col" role="main">
          <LandingHero />
          <LandingScrollReveal>
            <LandingFeatures />
          </LandingScrollReveal>
          <LandingScrollReveal>
            <LandingTrust />
          </LandingScrollReveal>
          <LandingScrollReveal>
            <LandingHowItWorks />
          </LandingScrollReveal>
          <LandingScrollReveal>
            <LandingValueProp />
          </LandingScrollReveal>
          <LandingScrollReveal>
            <LandingCta />
          </LandingScrollReveal>
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
