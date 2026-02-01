"use client";

import { useEffect, useRef, useState } from "react";
import {
  TranslationEntry,
  subscribeTranslations,
  LiveStreamEntry,
  subscribeLiveStream,
} from "@/lib/firebase/translationHistory";

interface LiveTranslationViewProps {
  mosqueId: string;
  activeTranslatorId: string | null;
}

export default function LiveTranslationView({
  mosqueId,
  activeTranslatorId,
}: LiveTranslationViewProps) {
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [liveStream, setLiveStream] = useState<LiveStreamEntry | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Subscribe to real-time live stream for <1 second latency
  useEffect(() => {
    if (!mosqueId) {
      setLiveStream(null);
      return;
    }

    const unsubscribe = subscribeLiveStream(
      mosqueId,
      (stream) => {
        setLiveStream(stream);
      },
      (err) => {
        // Ignore permission errors
        if (
          err?.code === "permission-denied" ||
          err?.message?.includes("permission")
        ) {
          setLiveStream(null);
          return;
        }
        console.error("Error loading live stream:", err);
      }
    );
    return () => unsubscribe();
  }, [mosqueId]);

  // Subscribe to finalized/refined translations for history
  useEffect(() => {
    if (!mosqueId) {
      setTranslations([]);
      return;
    }

    const unsubscribe = subscribeTranslations(
      mosqueId,
      (incoming) => {
        // Show all translations from the mosque (all translators, all sessions)
        setTranslations(incoming);
      },
      (err) => {
        // Ignore permission errors (may occur if Firebase rules don't allow unauthenticated reads)
        if (
          err?.code === "permission-denied" ||
          err?.message?.includes("permission")
        ) {
          setTranslations([]);
          return;
        }
        console.error("Error loading live translations:", err);
      }
    );
    return () => unsubscribe();
  }, [mosqueId]);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [translations.length, liveStream?.currentText, autoScroll]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isNearBottom);
  };

  if (!activeTranslatorId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center bg-[#1a1f2e]">
        <p className="text-zinc-400 text-lg">
          Waiting for lead reciter to start...
        </p>
      </div>
    );
  }

  // Determine what to display:
  // - If live stream is active, show the real-time translation
  // - Otherwise, show the historical refined translations
  const isLiveActive =
    liveStream?.isActive && liveStream.translatorId === activeTranslatorId;
  const liveText = isLiveActive ? liveStream.currentText : "";
  const livePartial = isLiveActive ? liveStream.partialText : "";
  const sourceText = isLiveActive ? liveStream.sourceText || "" : "";
  const sourcePartial = isLiveActive ? liveStream.sourcePartial || "" : "";
  const hasLiveContent =
    liveText.trim().length > 0 || livePartial.trim().length > 0;
  const hasSourceContent =
    sourceText.trim().length > 0 || sourcePartial.trim().length > 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#1a1f2e] overflow-hidden">
      {/* Header bar */}
      <div className="px-6 py-3 border-b border-[#2a3142] flex-shrink-0 flex-grow-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLiveActive && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0a5c3e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#06402B]"></span>
              </span>
            )}
            <span className="text-sm text-zinc-400 font-medium tracking-wide uppercase">
              {isLiveActive ? "Live" : "History"}
            </span>
          </div>
          {isLiveActive && liveStream.targetLang && (
            <span className="text-xs text-zinc-500 font-mono">
              {liveStream.sourceLang && liveStream.sourceLang !== "unknown"
                ? `${liveStream.sourceLang.toUpperCase()} → ${liveStream.targetLang.toUpperCase()}`
                : liveStream.targetLang.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Reference/source text (original language) - Arabic style */}
      {isLiveActive && hasSourceContent && (
        <div className="px-8 py-4 border-b border-[#2a3142] bg-[#1e2433] flex-shrink-0 flex-grow-0 max-h-[150px] overflow-y-auto">
          <p
            className="text-right text-2xl leading-[2.5] text-[#d4af37] font-['Amiri',_'Scheherazade_New',_serif]"
            dir="rtl"
            style={{ fontFeatureSettings: '"ss01"' }}
          >
            {sourceText}
            {sourcePartial && (
              <span className="text-[#b8963a]/60"> {sourcePartial}</span>
            )}
          </p>
        </div>
      )}

      {/* Main scrollable translation area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto scroll-smooth"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#3a4556 transparent",
        }}
      >
        <div className="px-8 pt-6 pb-24 space-y-0">
          {/* Show live stream when active */}
          {isLiveActive && hasLiveContent ? (
            <div className="translation-verse animate-fadeIn">
              <p className="text-xl leading-[2] text-[#e8e6e3] font-['Crimson_Pro',_Georgia,_serif] tracking-wide">
                {liveText}
                {livePartial && (
                  <span className="text-zinc-500 animate-pulse">
                    {" "}
                    {livePartial}
                  </span>
                )}
              </p>
            </div>
          ) : isLiveActive ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-zinc-500">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
                <span className="text-lg">Listening...</span>
              </div>
            </div>
          ) : translations.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-zinc-500 text-lg">
                Waiting for translations...
              </p>
            </div>
          ) : (
            translations.map((entry, index) => (
              <div
                key={entry.id}
                className="translation-verse group py-4 border-b border-[#2a3142]/50 last:border-0"
              >
                {/* Verse number indicator */}
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2a3142] flex items-center justify-center text-xs text-zinc-500 font-mono mt-1">
                    {index + 1}
                  </span>
                  <p className="flex-1 text-xl leading-[2] text-[#e8e6e3] font-['Crimson_Pro',_Georgia,_serif] tracking-wide">
                    {entry.translatedText}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Scroll indicator when not at bottom */}
        {!autoScroll && (
          <button
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({
                  top: scrollContainerRef.current.scrollHeight,
                  behavior: "smooth",
                });
              }
            }}
            className="fixed bottom-24 right-8 w-10 h-10 rounded-full bg-[#2a3142] border border-[#3a4556] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#3a4556] transition-all shadow-lg"
            aria-label="Scroll to latest"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Custom styles */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Crimson+Pro:wght@400;500&display=swap");

        .translation-verse {
          animation: fadeSlideIn 0.3s ease-out;
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Custom scrollbar for webkit browsers */
        div::-webkit-scrollbar {
          width: 6px;
        }

        div::-webkit-scrollbar-track {
          background: transparent;
        }

        div::-webkit-scrollbar-thumb {
          background: #3a4556;
          border-radius: 3px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: #4a5566;
        }
      `}</style>
    </div>
  );
}
