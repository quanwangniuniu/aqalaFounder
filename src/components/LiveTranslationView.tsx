"use client";

import { useEffect, useRef, useState } from "react";
import { TranslationEntry, subscribeTranslations } from "@/lib/firebase/translationHistory";
import { useAuth } from "@/contexts/AuthContext";

interface LiveTranslationViewProps {
  mosqueId: string;
  activeTranslatorId: string | null;
}

export default function LiveTranslationView({ mosqueId, activeTranslatorId }: LiveTranslationViewProps) {
  const { user } = useAuth();
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!mosqueId || !user || !activeTranslatorId) {
      setTranslations([]);
      return;
    }

    const unsubscribe = subscribeTranslations(
      mosqueId,
      (incoming) => {
        // Filter to only show translations from the current active translator
        const activeTranslations = incoming.filter(t => t.translatorId === activeTranslatorId);
        setTranslations(activeTranslations);
      },
      (err) => {
        // Ignore permission errors when user signs out (expected behavior)
        if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
          setTranslations([]);
          return;
        }
        console.error("Error loading live translations:", err);
      }
    );
    return () => unsubscribe();
  }, [mosqueId, user, activeTranslatorId]);

  // Auto-scroll to bottom when new translations arrive
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [translations, autoScroll]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isNearBottom);
  };

  if (!activeTranslatorId) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center">
        <p className="text-zinc-500">Waiting for lead reciter to start...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex-shrink-0">
        <p className="font-medium">Listener view</p>
        <p className="text-sm text-zinc-600">Live translation from lead reciter</p>
      </div>
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-[400px]"
        style={{ maxHeight: '500px', scrollbarWidth: 'thin' }}
      >
        {translations.length === 0 ? (
          <div className="text-center py-8 text-sm text-zinc-500">
            Waiting for translations to appear...
          </div>
        ) : (
          translations.map((entry) => (
            <div key={entry.id} className="space-y-2">
              <div className="text-lg leading-8 text-black">
                <p className="whitespace-pre-wrap">{entry.translatedText}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

