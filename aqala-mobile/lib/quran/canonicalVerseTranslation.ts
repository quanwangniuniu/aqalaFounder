/**
 * Official verse translation for a key (e.g. 112:1-4) from the same /api/verse
 * route the Verse modal uses — for Live Listen “Quran detected” so the card is
 * scripture only, not the messy live transcript window.
 */

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || "https://aqala.io";

interface VerseApiRow {
  verseNumber: number;
  translation?: string;
}

interface VerseApiResponse {
  startVerse: number;
  endVerse: number;
  verses: VerseApiRow[];
}

export async function fetchCanonicalTranslationForKey(
  verseKey: string,
  lang: string,
): Promise<string | undefined> {
  try {
    const res = await fetch(
      `${WEB_URL}/api/verse?key=${encodeURIComponent(verseKey)}&lang=${encodeURIComponent(lang)}`,
    );
    if (!res.ok) return undefined;
    const json = (await res.json()) as VerseApiResponse;
    const start = json.startVerse;
    const end = json.endVerse;
    if (typeof start !== "number" || typeof end !== "number") return undefined;
    const verses = json.verses ?? [];
    const parts = verses
      .filter((v) => v.verseNumber >= start && v.verseNumber <= end)
      .sort((a, b) => a.verseNumber - b.verseNumber)
      .map((v) => v.translation?.trim())
      .filter((t): t is string => Boolean(t));
    return parts.length > 0 ? parts.join(" ") : undefined;
  } catch {
    return undefined;
  }
}
