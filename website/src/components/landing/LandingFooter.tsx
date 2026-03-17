"use client";

import Link from "next/link";
import { useLanguage, LANGUAGE_OPTIONS } from "@/contexts/LanguageContext";
import { useState, useRef, useEffect } from "react";

export default function LandingFooter() {
  const { t, isRTL, language, setLanguage, getLanguageOption } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const currentLang = getLanguageOption(language);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    }
    if (showLangMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLangMenu]);

  return (
    <footer
      className="mt-auto bg-black/20 backdrop-blur-md border-t border-white/5"
      role="contentinfo"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
        {/* Policy / site info links */}
        <div className="flex items-center justify-center gap-4 mb-6 text-sm flex-wrap">
          <Link href="/privacy" className="text-white/50 hover:text-[#D4AF37] transition-colors">
            {t("landing.privacy")}
          </Link>
          <span className="w-1 h-1 rounded-full bg-white/20" aria-hidden />
          <Link href="/how-it-works" className="text-white/50 hover:text-[#D4AF37] transition-colors">
            {t("landing.howItWorks")}
          </Link>
          <span className="w-1 h-1 rounded-full bg-white/20" aria-hidden />
          <Link href="/site-map" className="text-white/50 hover:text-[#D4AF37] transition-colors">
            {t("landing.sitemap")}
          </Link>
          <span className="w-1 h-1 rounded-full bg-white/20" aria-hidden />
          <Link href="/app/about" className="text-white/50 hover:text-[#D4AF37] transition-colors">
            {t("landing.about")}
          </Link>
        </div>

        {/* Actions row - mirrors production footer */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
          <a
            href="https://www.instagram.com/aqala.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-[#D4AF37] hover:bg-white/5 transition-all"
            aria-label="Follow us on Instagram"
          >
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">{t("footer.instagram")}</span>
          </a>

          <Link
            href="/donate"
            className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-[#D4AF37] hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">{t("footer.donate")}</span>
          </Link>

          <Link
            href="/reviews"
            className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-[#D4AF37] hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">{t("footer.reviews")}</span>
          </Link>

          <Link
            href="/subscription"
            className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-[#D4AF37] hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">{t("landing.getPremium")}</span>
          </Link>

          <Link
            href="/support"
            className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-[#D4AF37] hover:bg-white/5 transition-all"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">{t("landing.support")}</span>
          </Link>

          {/* Language selector */}
          <div ref={langMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-[#D4AF37] hover:bg-white/5 transition-all"
              aria-label="Change language"
              aria-expanded={showLangMenu}
            >
              <span className="text-base">{currentLang?.flag}</span>
              <svg className={`w-3 h-3 transition-transform ${showLangMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showLangMenu && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 max-h-64 overflow-y-auto bg-[#0a1f17] border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-[9999] py-1">
                <div className="grid grid-cols-2 gap-1 p-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        language === lang.code ? "bg-[#D4AF37]/15 text-[#E8D5A3]" : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="truncate">{lang.label}</span>
                      {language === lang.code && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#D4AF37] ml-auto flex-shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="text-center mt-6 pt-6 border-t border-white/5">
          <a
            href="mailto:contact@aqala.org"
            className="text-white/40 hover:text-[#D4AF37] text-sm transition-colors"
          >
            contact@aqala.org
          </a>
        </div>
      </div>
    </footer>
  );
}
