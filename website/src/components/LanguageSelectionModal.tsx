"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useLanguage,
  LANGUAGE_OPTIONS,
  TRANSLATIONS,
  RTL_LANGUAGES,
} from "@/contexts/LanguageContext";

export default function LanguageSelectionModal() {
  const { language, setLanguage, isFirstVisit, completeFirstVisit } =
    useLanguage();
  const [selectedLang, setSelectedLang] = useState(language);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Get translations for selected language
  const t = useMemo(() => {
    const translations = TRANSLATIONS[selectedLang] || TRANSLATIONS["en"];
    return {
      title: translations["modal.title"],
      subtitle: translations["modal.subtitle"],
      continueBtn: translations["modal.continue"],
      settingsNote: translations["modal.settingsNote"],
    };
  }, [selectedLang]);

  // Check if selected language is RTL
  const isRTL = RTL_LANGUAGES.includes(selectedLang);

  // Animate in when first visit is detected
  useEffect(() => {
    if (isFirstVisit) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isFirstVisit]);

  const handleConfirm = () => {
    setLanguage(selectedLang);
    setIsAnimatingOut(true);

    setTimeout(() => {
      completeFirstVisit();
      setIsVisible(false);
    }, 300);
  };

  if (!isFirstVisit || !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isAnimatingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md transition-all duration-300 ${
          isAnimatingOut ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Glow effect */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#D4AF37]/30 via-[#D4AF37]/10 to-[#D4AF37]/30 opacity-50" />
        
        <div className="relative bg-[#032117] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
          {/* Header - RTL aware */}
          <div className="px-6 pt-8 pb-4 text-center" dir={isRTL ? "rtl" : "ltr"}>
            {/* Icon */}
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-[#D4AF37]"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>

            <h2
              className="text-xl font-medium text-white mb-1"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {t.title}
            </h2>
            <p className="text-white/50 text-sm">{t.subtitle}</p>
          </div>

          {/* Language grid - always LTR to prevent jumping */}
          <div className="px-4 pb-4" dir="ltr">
            <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                    selectedLang === lang.code
                      ? "bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]/50"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {/* Checkmark */}
                  {selectedLang === lang.code && (
                    <div className="absolute top-1.5 right-1.5">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-[#D4AF37]"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}

                  <span className="text-xl mb-1">{lang.flag}</span>
                  <span
                    className={`text-xs font-medium ${
                      selectedLang === lang.code
                        ? "text-[#E8D5A3]"
                        : "text-white/80"
                    }`}
                  >
                    {lang.label}
                  </span>
                  <span
                    className={`text-[10px] ${
                      selectedLang === lang.code
                        ? "text-[#D4AF37]/70"
                        : "text-white/40"
                    }`}
                  >
                    {lang.nativeLabel}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer - RTL aware */}
          <div className="px-6 pb-6 pt-2" dir={isRTL ? "rtl" : "ltr"}>
            <button
              onClick={handleConfirm}
              className="w-full py-3 px-6 rounded-xl bg-[#D4AF37] text-[#032117] font-semibold text-sm hover:bg-[#E8D5A3] transition-all duration-200 active:scale-[0.98]"
            >
              <span
                className={`flex items-center justify-center gap-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                {t.continueBtn}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={isRTL ? "rotate-180" : ""}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>

            <p className="text-center text-[11px] text-white/30 mt-3">
              {t.settingsNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
