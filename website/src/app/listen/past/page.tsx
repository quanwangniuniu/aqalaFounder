"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribePastTranslations,
  PastTranslation,
} from "@/lib/firebase/userPastTranslations";

const LANG_LABELS: Record<string, string> = {
  en: "English", ar: "Arabic", ur: "Urdu", hi: "Hindi", bn: "Bengali",
  tr: "Turkish", id: "Indonesian", es: "Spanish", fr: "French", de: "German",
  it: "Italian", pt: "Portuguese", ru: "Russian", zh: "Chinese", ja: "Japanese",
  ko: "Korean",
};

export default function PastTranslationsListPage() {
  const { user, loading: authLoading } = useAuth();
  const [translations, setTranslations] = useState<PastTranslation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      setTranslations([]);
      return () => {};
    }
    setLoading(true);
    const unsub = subscribePastTranslations(
      user.uid,
      (items) => {
        setTranslations(items);
        setLoading(false);
      },
      () => setLoading(false),
      50
    );
    return () => unsub();
  }, [user?.uid]);

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #032117 0%, #0a3d2e 50%, #032117 100%)",
        }}
      >
        <div className="w-10 h-10 border-2 border-[#D4AF37]/40 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 px-6"
        style={{
          background: "linear-gradient(180deg, #032117 0%, #0a3d2e 50%, #032117 100%)",
        }}
      >
        <p className="text-white/80 text-center">Sign in to view your past translations</p>
        <Link
          href="/auth/login"
          className="px-5 py-2.5 rounded-full bg-[#D4AF37] text-[#032117] font-medium hover:bg-[#E8C547] transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, #032117 0%, #0a3d2e 30%, #032117 100%)",
      }}
    >
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/10">
        <Link
          href="/listen"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Listen
        </Link>
        <h1 className="text-lg font-semibold text-white">Past Translations</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-2 border-[#D4AF37]/40 border-t-[#D4AF37] rounded-full animate-spin" />
          </div>
        ) : translations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/60 mb-4">No saved translations yet</p>
            <p className="text-white/40 text-sm">
              Stop a listening session and tap &quot;Save translation&quot; to save it here.
            </p>
            <Link
              href="/listen"
              className="inline-block mt-6 px-5 py-2.5 rounded-full bg-[#D4AF37] text-[#032117] font-medium hover:bg-[#E8C547] transition-colors"
            >
              Start Listening
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {translations.map((pt) => {
              const preview = pt.translatedParagraphs[0] ?? "";
              const previewText = preview.length > 120 ? preview.slice(0, 120) + "…" : preview;
              const dateStr = pt.createdAt.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              const sourceLabel = LANG_LABELS[pt.sourceLang] ?? pt.sourceLang;
              const targetLabel = LANG_LABELS[pt.targetLang] ?? pt.targetLang;

              return (
                <Link
                  key={pt.id}
                  href={`/listen/past/${pt.id}`}
                  className="block rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.08] hover:border-[#D4AF37]/30 transition-colors"
                >
                  <p
                    className="text-white/90 text-base leading-relaxed mb-2 line-clamp-2"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {previewText || "(Empty translation)"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>{dateStr}</span>
                    <span>·</span>
                    <span>{sourceLabel} → {targetLabel}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
