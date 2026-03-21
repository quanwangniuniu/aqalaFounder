"use client";

import { useMemo, useState } from "react";

type DetectResult = {
  verseKey: string;
  text: string;
  highlights: string[];
};
function stripHtml(input: string) {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function MuslimProQuranDetectionSection() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DetectResult[]>([]);

  const cleanedQuery = useMemo(() => query.trim(), [query]);

  const runDetect = async (input?: string) => {
    const text = (input ?? cleanedQuery).trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/quran/detect?q=${encodeURIComponent(text)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Detection failed");
      setResults((data?.results || []) as DetectResult[]);
    } catch (e: unknown) {
      setResults([]);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="quran-detection" className="py-12 md:py-16 bg-[#032117] border-t border-white/10 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Quran detection (try it)</h2>
          <p className="text-white/70 mb-6 max-w-3xl">
            Paste text to find the closest Quran verse.
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Paste a line you heard…"
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]/40"
            />
            <button
              type="button"
              onClick={() => runDetect()}
              disabled={!cleanedQuery || loading}
              className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#032117] font-semibold hover:bg-[#E8D5A3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mp-btn-hover"
            >
              {loading ? "Detecting…" : "Detect"}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6">
            {results.length === 0 ? (
              <p className="text-white/40 text-sm">
                {loading ? "Searching…" : "No results yet. Paste a snippet and tap Detect."}
              </p>
            ) : (
              <div className="grid gap-3">
                {results.map((r) => (
                  <div
                    key={r.verseKey}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-white font-semibold">{r.verseKey}</p>
                      <p className="text-white/70 text-sm leading-relaxed mt-1">
                        {stripHtml(r.text)}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a
                        href={`https://quran.com/${r.verseKey.replace(":", "/")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 transition-colors text-sm font-semibold"
                      >
                        Open on Quran.com
                      </a>
                      <a
                        href={`/api/verse?key=${encodeURIComponent(r.verseKey)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 transition-colors text-sm font-semibold"
                      >
                        View JSON
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

