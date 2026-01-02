"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

interface VerseData {
  verseKey: string;
  verseNumber: number;
  arabicText: string;
  translation: string;
}

interface VerseResponse {
  chapter: number;
  chapterName: string;
  chapterNameArabic: string;
  verses: VerseData[];
  startVerse: number;
  endVerse: number;
  totalVerses: number;
  revelationPlace: string;
}

interface VerseModalProps {
  verseKey: string | null; // e.g., "18:38" or "18:38-42"
  onClose: () => void;
  targetLang?: string;
}

// Arabic number conversion
function toArabicNumber(num: number): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((d) => arabicNumerals[parseInt(d)])
    .join("");
}

export default function VerseModal({
  verseKey,
  onClose,
  targetLang = "en",
}: VerseModalProps) {
  const [data, setData] = useState<VerseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const highlightedVerseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Scroll to highlighted verse after data loads
  useEffect(() => {
    if (data && highlightedVerseRef.current && scrollContainerRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        highlightedVerseRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data]);

  // Fetch verse data when verseKey changes
  useEffect(() => {
    if (!verseKey) {
      setData(null);
      return;
    }

    // Capture verseKey in a const to satisfy TypeScript
    const key = verseKey;

    async function fetchVerse() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/verse?key=${encodeURIComponent(key)}&lang=${targetLang}`
        );
        if (!res.ok) throw new Error("Failed to fetch verse");
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e?.message || "Failed to load verse");
      } finally {
        setLoading(false);
      }
    }

    fetchVerse();
  }, [verseKey, targetLang]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (verseKey) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [verseKey]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!verseKey || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="verse-modal-title"
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal container */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: "linear-gradient(180deg, #0c1f2d 0%, #0d4f5c 100%)",
        }}
      >
        {/* Close button - positioned above all content */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Close"
          type="button"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Content */}
        <div ref={scrollContainerRef} className="relative overflow-y-auto max-h-[85vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 px-8">
              {/* Loading spinner */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-[#c9a962] rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-white/60 text-sm">Loading surah...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-8">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <p className="mt-4 text-red-400">{error}</p>
            </div>
          ) : data ? (
            <>
              {/* Header with Surah info */}
              <div className="sticky top-0 z-10 px-6 py-5 border-b border-white/10" style={{ background: "linear-gradient(180deg, #0c1f2d 0%, #0c1f2d 80%, transparent 100%)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2
                      id="verse-modal-title"
                      className="text-2xl font-semibold"
                      style={{
                        background:
                          "linear-gradient(135deg, #e4d4a5 0%, #c9a962 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {data.chapterName}
                    </h2>
                    <p className="text-white/50 text-sm mt-1">
                      Surah {data.chapter} • {data.totalVerses} verses
                      {data.revelationPlace && ` • ${data.revelationPlace === "makkah" ? "Meccan" : "Medinan"}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-3xl"
                      style={{
                        fontFamily: "'Amiri', serif",
                        color: "#c9a962",
                      }}
                    >
                      {data.chapterNameArabic}
                    </p>
                  </div>
                </div>
                {/* Highlighted verse indicator */}
                <div className="mt-3 flex items-center gap-2 text-xs text-[#c9a962]">
                  <div className="w-3 h-3 rounded-full bg-[#c9a962]/30 border border-[#c9a962]" />
                  <span>
                    Scrolled to verse{data.startVerse === data.endVerse ? ` ${data.startVerse}` : `s ${data.startVerse}-${data.endVerse}`}
                  </span>
                </div>
              </div>

              {/* Bismillah for all surahs except At-Tawbah (9) */}
              {data.chapter !== 9 && data.chapter !== 1 && (
                <div className="py-6 text-center border-b border-white/5">
                  <p
                    className="text-2xl text-white/80"
                    style={{ fontFamily: "'Amiri', serif" }}
                    dir="rtl"
                  >
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                  </p>
                </div>
              )}

              {/* All Verses */}
              <div className="px-6 py-6 space-y-6">
                {data.verses.map((verse) => {
                  const isHighlighted =
                    verse.verseNumber >= data.startVerse &&
                    verse.verseNumber <= data.endVerse;
                  const isFirstHighlighted = verse.verseNumber === data.startVerse;

                  return (
                    <div
                      key={verse.verseKey}
                      ref={isFirstHighlighted ? highlightedVerseRef : undefined}
                      className={`relative rounded-xl transition-all duration-300 ${
                        isHighlighted
                          ? "bg-[#c9a962]/10 border border-[#c9a962]/30 p-5 -mx-2"
                          : "p-3 hover:bg-white/5"
                      }`}
                    >
                      {/* Highlighted badge */}
                      {isHighlighted && isFirstHighlighted && (
                        <div className="absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-medium bg-[#c9a962] text-[#0c1f2d]">
                          Referenced Verse{data.startVerse !== data.endVerse ? "s" : ""}
                        </div>
                      )}

                      {/* Arabic text with verse number ornament */}
                      <div className="relative">
                        <p
                          className={`text-right leading-[2.5] select-text ${
                            isHighlighted ? "text-[1.75rem] text-white" : "text-xl text-white/95"
                          }`}
                          style={{
                            fontFamily: "'Amiri', 'Scheherazade New', serif",
                            textShadow: isHighlighted ? "0 2px 20px rgba(201, 169, 98, 0.2)" : "none",
                          }}
                          dir="rtl"
                        >
                          {verse.arabicText}
                          {/* Verse number ornament */}
                          <span
                            className="inline-flex items-center justify-center mx-2 align-middle"
                            style={{ verticalAlign: "middle" }}
                          >
                            <span
                              className={`flex items-center justify-center rounded-full border-2 ${
                                isHighlighted ? "w-10 h-10 text-base" : "w-8 h-8 text-sm"
                              }`}
                              style={{
                                borderColor: isHighlighted ? "#c9a962" : "rgba(201, 169, 98, 0.6)",
                                color: isHighlighted ? "#c9a962" : "rgba(201, 169, 98, 0.8)",
                                fontFamily: "'Amiri', serif",
                              }}
                            >
                              {toArabicNumber(verse.verseNumber)}
                            </span>
                          </span>
                        </p>
                      </div>

                      {/* Translation - show for all verses */}
                      {verse.translation && (
                        <>
                          {/* Separator line */}
                          <div className={`flex items-center gap-4 ${isHighlighted ? "my-4" : "my-2"}`}>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c9a962]/20 to-transparent" />
                            {isHighlighted && (
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: "#c9a962" }}
                              />
                            )}
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c9a962]/20 to-transparent" />
                          </div>

                          {/* Translation */}
                          <div className={`pl-4 border-l-2 ${isHighlighted ? "border-[#c9a962]/40" : "border-[#c9a962]/30"}`}>
                            <p
                              className={`leading-relaxed select-text ${
                                isHighlighted 
                                  ? "text-white/90 text-lg" 
                                  : "text-white/80 text-base"
                              }`}
                              style={{
                                fontFamily: "'Crimson Pro', Georgia, serif",
                              }}
                            >
                              {verse.translation}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer with quran.com link */}
              <div className="sticky bottom-0 px-6 py-4 border-t border-white/10 bg-[#0c1f2d]/95 backdrop-blur-sm">
                <div className="flex items-center justify-end">
                  <a
                    href={`https://quran.com/${data.chapter}/${data.startVerse}${
                      data.startVerse !== data.endVerse
                        ? `-${data.endVerse}`
                        : ""
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#c9a962] hover:text-[#e4d4a5] transition-colors"
                  >
                    View on Quran.com
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );

  // Use portal to render at document body level
  return createPortal(modalContent, document.body);
}

