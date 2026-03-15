"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LandingValueProp() {
  const { t } = useLanguage();

  return (
    <section
      className="px-4 py-16 sm:py-20"
      aria-labelledby="value-heading"
    >
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 sm:p-8 md:p-10 transition-all duration-300 hover:border-white/15">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" aria-hidden />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-[40px] translate-y-1/2 -translate-x-1/2" aria-hidden />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:gap-12">
            {/* Text content */}
            <div className="flex-1 text-center lg:text-left mb-8 lg:mb-0">
              <h2 id="value-heading" className="text-xl sm:text-2xl font-semibold text-white mb-4">
                {t("landing.realtimeTranslation")}
              </h2>
              <p className="text-white/70 leading-relaxed mb-6">
                {t("landing.valuePropDesc")}
              </p>
              <p className="text-white/60 text-sm mb-6">
                <span className="font-semibold text-[#D4AF37]">{t("landing.languagesCount")}</span>
                {" "}— {t("landing.languagesList")}
              </p>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:text-[#E8D5A3] font-medium transition-colors"
              >
                {t("landing.sourcesMethodology")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Product image: Instant translation */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md landing-img-hover rounded-2xl">
                <Image
                  src="/landing-translate-any-language.png"
                  alt="Aqala instantly translates Islamic content to 20+ languages. Arabic to French, Spanish, German, Turkish and more."
                  width={800}
                  height={600}
                  className="w-full h-auto rounded-2xl border border-white/10 shadow-xl"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
