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

  // Get translations for selected language (use centralized translations)
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
      // Small delay to ensure smooth animation
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isFirstVisit]);

  const handleConfirm = () => {
    setLanguage(selectedLang);
    setIsAnimatingOut(true);

    // Wait for animation to complete before hiding
    setTimeout(() => {
      completeFirstVisit();
      setIsVisible(false);
    }, 400);
  };

  if (!isFirstVisit || !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-500 ${
        isAnimatingOut ? "lang-modal-backdrop-out" : "lang-modal-backdrop-in"
      }`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 lang-modal-bg" />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="lang-modal-shape lang-modal-shape-1" />
        <div className="lang-modal-shape lang-modal-shape-2" />
        <div className="lang-modal-shape lang-modal-shape-3" />
      </div>

      {/* Modal content */}
      <div
        className={`relative w-full max-w-lg mx-4 transition-all duration-500 ${
          isAnimatingOut ? "lang-modal-content-out" : "lang-modal-content-in"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="relative px-8 pt-10 pb-6 text-center">
            {/* Decorative top accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full" />

            {/* Arabic-styled icon with crescent and globe */}
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#032117] to-[#06402B] flex items-center justify-center shadow-lg lang-modal-icon">
              <svg
                width="36"
                height="36"
                viewBox="0 0 48 48"
                fill="none"
                className="text-[#D4AF37]"
              >
                {/* Globe outline */}
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Globe meridian lines */}
                <ellipse
                  cx="24"
                  cy="24"
                  rx="8"
                  ry="18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path d="M6 24h36" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M9 14h30"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <path
                  d="M9 34h30"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.6"
                />
                {/* Arabic letter ع (Ayn) - stylized */}
                <path
                  d="M20 20c2 0 3.5 1 4 2.5s0 3-1.5 4c-1.5 1-3 1.5-4.5 1.5-2.5 0-4-1.5-4-3.5 0-1.5 1-2.5 2-3"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Crescent moon */}
                <path
                  d="M32 16c-2.5 2-4 5-4 8.5 0 3.5 1.5 6.5 4 8.5 4-1.5 7-5.5 7-10s-3-8-7-7z"
                  fill="currentColor"
                  opacity="0.9"
                />
                {/* Star */}
                <path
                  d="M36 20l0.8 1.6 1.7 0.2-1.2 1.2 0.3 1.7-1.6-0.8-1.6 0.8 0.3-1.7-1.2-1.2 1.7-0.2z"
                  fill="currentColor"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-[#032117] mb-2 transition-all duration-300">
              {t.title}
            </h2>
            <p className="text-gray-600 text-sm transition-all duration-300">
              {t.subtitle}
            </p>
          </div>

          {/* Language grid */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1 lang-modal-grid">
              {LANGUAGE_OPTIONS.map((lang, index) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`group relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 lang-modal-item ${
                    selectedLang === lang.code
                      ? "bg-gradient-to-br from-[#032117] to-[#06402B] text-white shadow-lg scale-[1.02]"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Selection indicator */}
                  {selectedLang === lang.code && (
                    <div className="absolute top-2 right-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-[#D4AF37]"
                      >
                        <path
                          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  )}

                  <span className="text-2xl mb-1.5">{lang.flag}</span>
                  <span className="font-medium text-sm">{lang.label}</span>
                  <span
                    className={`text-xs ${
                      selectedLang === lang.code
                        ? "text-white/70"
                        : "text-gray-400"
                    }`}
                  >
                    {lang.nativeLabel}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 pt-2">
            <button
              onClick={handleConfirm}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#b8944d] text-[#032117] font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] lang-modal-btn"
            >
              <span
                className={`flex items-center justify-center gap-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                {t.continueBtn}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`transition-transform ${
                    isRTL ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </button>

            <p className="text-center text-xs text-gray-400 mt-4 transition-all duration-300">
              {t.settingsNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
