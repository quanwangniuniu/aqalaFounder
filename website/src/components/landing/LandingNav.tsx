"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, LANGUAGE_OPTIONS, type LanguageOption } from "@/contexts/LanguageContext";
import UserAvatar from "@/components/UserAvatar";
import AdLink from "@/components/AdLink";

function LanguageSelector({
  language,
  setLanguage,
  getLanguageOption,
  isRTL,
}: {
  language: string;
  setLanguage: (code: string) => void;
  getLanguageOption: (code: string) => LanguageOption | undefined;
  isRTL: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = getLanguageOption(language);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative" dir={isRTL ? "rtl" : "ltr"}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 hover:bg-white/10 transition-all text-sm text-white/80 min-h-[44px]"
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-base" aria-hidden>{current?.flag}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute top-full mt-2 right-0 w-56 max-h-64 overflow-y-auto bg-[#0a1f17] border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-[9999] py-1"
          aria-label="Select language"
        >
          <div className="grid grid-cols-2 gap-1 p-2">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                role="option"
                aria-selected={language === lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all min-h-[44px] ${
                  language === lang.code
                    ? "bg-[#D4AF37]/15 text-[#E8D5A3]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span aria-hidden>{lang.flag}</span>
                <span className="truncate">{lang.label}</span>
                {language === lang.code && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#D4AF37] ml-auto flex-shrink-0" aria-hidden>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LandingNav() {
  const { user, loading: authLoading } = useAuth();
  const { t, language, setLanguage, getLanguageOption, isRTL } = useLanguage();

  return (
    <nav
      className="sticky top-0 z-50 w-full px-4 py-3 bg-[#032117]/80 backdrop-blur-xl border-b border-white/5"
      aria-label="Main navigation"
    >
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-4">
        <Link
          href="/app"
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:ring-offset-2 focus:ring-offset-[#032117] rounded-lg"
          aria-label="Aqala app home"
        >
          <Image
            src="/aqala-logo.png"
            alt=""
            width={40}
            height={40}
            priority
            className="invert drop-shadow-lg w-auto"
          />
          <span className="sr-only">Aqala</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/app/about"
            className="inline-flex px-3 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            {t("landing.about")}
          </Link>
          <LanguageSelector
            language={language}
            setLanguage={setLanguage}
            getLanguageOption={getLanguageOption}
            isRTL={isRTL}
          />

          {!authLoading && (
            <>
              {user && (
                <>
                  <Link
                    href="/search"
                    className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 hover:bg-white/10 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Search"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </Link>
                  <UserAvatar className="w-10 h-10" />
                </>
              )}
              {!user && (
                <Link
                  href="/auth/login"
                  className="px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 hover:bg-white/10 transition-all text-sm font-medium text-white min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:ring-offset-2 focus:ring-offset-[#032117]"
                >
                  {t("landing.signIn")}
                </Link>
              )}
              <AdLink
                href="/listen"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#b8944d] text-[#021a12] font-semibold text-sm hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:ring-offset-2 focus:ring-offset-[#032117]"
              >
                {t("home.startListening")}
              </AdLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
