/**
 * Fetch tafsir (explanation) for a verse from the Quran CDN API.
 * Uses api.qurancdn.com - no auth required.
 * @see https://api.qurancdn.com/api/qdc/tafsirs/{id}/by_ayah/{verse_key}
 */

const API_BASE = "https://api.qurancdn.com/api/qdc";

// Tafsir resource IDs by language (fallback to English 169)
const TAFSIR_BY_LANG: Record<string, number> = {
  en: 169, // Ibn Kathir (Abridged) - English
  ar: 16, // Tafsir Muyassar - Arabic
  ur: 160, // Tafsir Ibn Kathir - Urdu
  bn: 165, // Tafsir Ahsanul Bayaan - Bengali
  ru: 170, // Al-Sa'di - Russian
  tr: 169, // fallback English
  hi: 169,
  id: 169,
  ms: 169,
  fr: 169,
  de: 169,
  es: 169,
  pt: 169,
  nl: 169,
  it: 169,
  zh: 169,
  ja: 169,
  ko: 169,
  th: 169,
  vi: 169,
};

export interface TafsirResult {
  text: string;
  resourceName: string;
  resourceId: number;
}

function getTafsirId(locale: string): number {
  const lang = locale.split("-")[0].toLowerCase();
  return TAFSIR_BY_LANG[lang] ?? 169;
}

export async function getTafsirForVerse(
  verseKey: string,
  locale: string
): Promise<TafsirResult> {
  const tafsirId = getTafsirId(locale);
  const url = `${API_BASE}/tafsirs/${tafsirId}/by_ayah/${verseKey}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tafsir: ${response.status}`);
  }

  const data = await response.json();
  const tafsir = data?.tafsir;

  if (!tafsir?.text) {
    throw new Error("No tafsir content found");
  }

  return {
    text: tafsir.text,
    resourceName: tafsir.resource_name ?? "Tafsir",
    resourceId: tafsir.resource_id ?? tafsirId,
  };
}
