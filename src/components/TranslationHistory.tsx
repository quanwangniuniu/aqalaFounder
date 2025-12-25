"use client";

import { useEffect, useRef, useState } from "react";
import { TranslationEntry, subscribeTranslations } from "@/lib/firebase/translationHistory";
import { useAuth } from "@/contexts/AuthContext";

interface TranslationHistoryProps {
  mosqueId: string;
}

export default function TranslationHistory({ mosqueId }: TranslationHistoryProps) {
  const { user } = useAuth();
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!mosqueId || !user) {
      setTranslations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeTranslations(
      mosqueId,
      (incoming) => {
        setTranslations(incoming);
        setLoading(false);
      },
      (err) => {
        // Ignore permission errors when user signs out (expected behavior)
        if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
          setTranslations([]);
          setLoading(false);
          return;
        }
        console.error("Error loading translation history:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [mosqueId, user]);

  // Auto-scroll to bottom when new translations arrive
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current && translations.length > 0) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [translations, autoScroll]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    return date.toLocaleDateString();
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isNearBottom);
  };

  return (
    <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
        <div>
          <h3 className="font-medium">Translation History</h3>
          <p className="text-xs text-zinc-600">{translations.length} {translations.length === 1 ? "entry" : "entries"}</p>
        </div>
        {translations.length > 0 && (
          <button
            onClick={() => {
              setAutoScroll(true);
              scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: "smooth" });
            }}
            className="text-xs text-[#7D00D4] hover:underline"
          >
            Scroll to latest
          </button>
        )}
      </div>
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="max-h-[400px] overflow-y-auto p-4 space-y-4"
      >
        {loading ? (
          <div className="text-center py-8 text-sm text-zinc-600">Loading history...</div>
        ) : translations.length === 0 ? (
          <div className="text-center py-8 text-sm text-zinc-600">No translations yet. History will appear here as translations are made.</div>
        ) : (
          translations.map((entry) => (
            <div key={entry.id} className="border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium">
                  {entry.sourceLang.toUpperCase()}
                </span>
                <span className="text-zinc-400">→</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#7D00D4]/10 text-[#7D00D4] font-medium">
                  {entry.targetLang.toUpperCase()}
                </span>
                <span className="text-xs text-zinc-500 ml-auto">{formatTime(entry.timestamp)}</span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Source:</p>
                  <p className="text-sm text-zinc-800" dir="auto">{entry.sourceText}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Translation:</p>
                  <p className="text-sm text-zinc-900 font-medium" dir="auto">{entry.translatedText}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

