"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getPastTranslation, PastTranslation } from "@/lib/firebase/userPastTranslations";

const LANG_LABELS: Record<string, string> = {
  en: "English", ar: "Arabic", ur: "Urdu", hi: "Hindi", bn: "Bengali",
  tr: "Turkish", id: "Indonesian", es: "Spanish", fr: "French", de: "German",
  it: "Italian", pt: "Portuguese", ru: "Russian", zh: "Chinese", ja: "Japanese",
  ko: "Korean",
};

export default function PastTranslationPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { user, loading: authLoading } = useAuth();
  const [translation, setTranslation] = useState<PastTranslation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user?.uid) {
      setLoading(false);
      if (!user && !authLoading) setError("Sign in to view past translations");
      return;
    }
    setLoading(true);
    setError(null);
    getPastTranslation(user.uid, id)
      .then((t) => {
        setTranslation(t);
        if (!t) setError("Translation not found");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [id, user?.uid, authLoading]);

  if (authLoading || loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{
          background: "linear-gradient(180deg, #032117 0%, #0a3d2e 50%, #032117 100%)",
        }}
      >
        <div className="w-10 h-10 border-2 border-[#D4AF37]/40 border-t-[#D4AF37] rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Loading translation...</p>
      </div>
    );
  }

  if (error || !translation) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 px-6"
        style={{
          background: "linear-gradient(180deg, #032117 0%, #0a3d2e 50%, #032117 100%)",
        }}
      >
        <p className="text-white/80 text-center">{error || "Translation not found"}</p>
        <Link
          href="/listen"
          className="px-5 py-2.5 rounded-full bg-[#D4AF37] text-[#032117] font-medium hover:bg-[#E8C547] transition-colors"
        >
          Back to Listen
        </Link>
      </div>
    );
  }

  const sourceLabel = LANG_LABELS[translation.sourceLang] ?? translation.sourceLang;
  const targetLabel = LANG_LABELS[translation.targetLang] ?? translation.targetLang;
  const dateStr = translation.createdAt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, #032117 0%, #0a3d2e 30%, #032117 100%)",
      }}
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap");
      `}</style>

      {/* Header */}
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
        <div className="text-xs text-white/40">
          {sourceLabel} → {targetLabel} · {dateStr}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-5 py-8 max-w-2xl mx-auto w-full">
        {/* Source text */}
        {translation.sourceText && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-0.5 h-4 rounded-full bg-[#D4AF37]/60" />
              <span className="text-[10px] font-medium text-white/40 uppercase tracking-[0.15em]">
                {sourceLabel}
              </span>
            </div>
            <p
              className="text-right text-lg leading-[1.8] text-white/90"
              style={{ fontFamily: "'Amiri', serif" }}
              dir="auto"
            >
              {translation.sourceText}
            </p>
          </div>
        )}

        {/* Translation paragraphs */}
        <div className="space-y-6">
          {translation.translatedParagraphs.map((p, i) => (
            <div key={i} className="translation-paragraph">
              <p
                className="text-[20px] leading-[2.1] text-white/90"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {p}
              </p>
              {translation.verseReferences[i] && (
                <div className="mt-3 inline-flex items-center gap-2 text-[13px] text-[#D4AF37]/70 italic">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  <span>{translation.verseReferences[i]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
