/**
 * Quran verse detection — 100% LOCAL, no API.
 *
 * Uses a trigram (3-consecutive-word) index built from the Uthmani corpus at
 * module load.  When STT Arabic arrives, we extract trigrams from a sliding
 * window of recent words, look up candidate chapters via the index, then run
 * greedy sequential alignment to confirm and measure the match.
 *
 * Key insight: real Quran recitation produces long runs of consecutive corpus
 * words that regular Arabic speech (hadith, khutbah) statistically cannot.
 */

import quranCorpus from "@/assets/quran-uthmani-compact.json";

const corpus = quranCorpus as Array<[string, string]>;

// ── Arabic normalization (Uthmani ↔ STT compatible) ──────────────────

/**
 * Normalize Arabic text so that Uthmani corpus words and STT output produce
 * identical tokens.
 *
 * Critical fixes over a naive strip-diacritics approach:
 *  1. Superscript alef (U+0670) → regular alef ا  (NOT stripped)
 *  2. Bare hamza ء (U+0621) → removed
 *  3. Small high letter marks (U+06D6-U+06ED range) → stripped
 *  4. All alef variants (آ أ إ ٱ) → bare alef ا
 *  5. Taa marbutah ة → haa ه
 *  6. Alef maksura ى → yaa ي
 */
export function normalize(text: string): string[] {
  return (
    text
      // Step 0: Uthmani letter+superscript-alef pairs → single alef
      // ىٰ (alef maksura + superscript alef) e.g. أَلۡهَىٰكُمُ → ألهاكم
      // وٰ (waw + superscript alef)           e.g. الصَّلَوٰةَ → الصلاة
      .replace(/[\u0649\u0648]\u0670/g, "\u0627")
      // Step 1: remaining superscript alef → regular alef (BEFORE diacritic strip)
      .replace(/\u0670/g, "\u0627")
      // Step 2: strip remaining diacritics / tatweel / small marks
      .replace(
        /[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06ED\u0640]/g,
        "",
      )
      // Step 3: unify alef variants (آ أ إ ٱ) → ا
      .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
      // Step 4: remove bare hamza ء
      .replace(/\u0621/g, "")
      // Step 5: taa marbutah → haa
      .replace(/\u0629/g, "\u0647")
      // Step 6: alef maksura → yaa (Uthmani فى → في, الذى → الذي)
      .replace(/\u0649/g, "\u064A")
      // Step 7: haa goal ۱ → haa
      .replace(/\u06C1/g, "\u0647")
      // Step 8: strip Arabic punctuation (comma ، semicolon ؛ question ؟ period ۔ etc.)
      .replace(/[\u0600-\u0605\u0606-\u060F\u061B-\u061F\u06D4]/g, "")
      // Step 9: drop anything non-Arabic
      .replace(/[^\u0600-\u06FF\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 0)
  );
}

// ── Pre-built lookup structures (computed once at module load) ────────

const corpusMap = new Map<string, string>();
const chapterVerseCounts = new Map<number, number>();
for (const [key, text] of corpus) {
  corpusMap.set(key, text);
  const ch = parseInt(key.split(":")[0], 10);
  if (!isNaN(ch))
    chapterVerseCounts.set(ch, (chapterVerseCounts.get(ch) || 0) + 1);
}

/** Normalized words per chapter (cached). */
const chapterWordsCache = new Map<number, string[]>();
function getChapterWords(
  chapter: number,
  startV = 1,
  endV?: number,
): string[] {
  const total = chapterVerseCounts.get(chapter) || 0;
  const end = endV ?? total;
  const useFullChapter = startV === 1 && end === total;

  if (useFullChapter && chapterWordsCache.has(chapter)) {
    return chapterWordsCache.get(chapter)!;
  }

  const words: string[] = [];
  for (let v = startV; v <= end; v++) {
    const text = corpusMap.get(`${chapter}:${v}`);
    if (text) words.push(...normalize(text));
  }

  if (useFullChapter) chapterWordsCache.set(chapter, words);
  return words;
}

/**
 * Trigram index: "w1|w2|w3" → Set<chapter>.
 * Built once at module load from the full corpus.
 */
const trigramIndex = new Map<string, Set<number>>();
(function buildTrigramIndex() {
  for (let ch = 1; ch <= 114; ch++) {
    const words = getChapterWords(ch);
    for (let i = 0; i + 2 < words.length; i++) {
      const key = `${words[i]}|${words[i + 1]}|${words[i + 2]}`;
      let set = trigramIndex.get(key);
      if (!set) {
        set = new Set();
        trigramIndex.set(key, set);
      }
      set.add(ch);
    }
  }
})();

// ── Constants ────────────────────────────────────────────────────────

const CHAPTER_NAMES: Record<number, string> = {
  1: "Al-Fatihah",
  2: "Al-Baqarah",
  3: "Ali 'Imran",
  4: "An-Nisa",
  5: "Al-Ma'idah",
  6: "Al-An'am",
  7: "Al-A'raf",
  8: "Al-Anfal",
  9: "At-Tawbah",
  10: "Yunus",
  11: "Hud",
  12: "Yusuf",
  13: "Ar-Ra'd",
  14: "Ibrahim",
  15: "Al-Hijr",
  16: "An-Nahl",
  17: "Al-Isra",
  18: "Al-Kahf",
  19: "Maryam",
  20: "Taha",
  21: "Al-Anbya",
  22: "Al-Hajj",
  23: "Al-Mu'minun",
  24: "An-Nur",
  25: "Al-Furqan",
  26: "Ash-Shu'ara",
  27: "An-Naml",
  28: "Al-Qasas",
  29: "Al-'Ankabut",
  30: "Ar-Rum",
  31: "Luqman",
  32: "As-Sajdah",
  33: "Al-Ahzab",
  34: "Saba",
  35: "Fatir",
  36: "Ya-Sin",
  37: "As-Saffat",
  38: "Sad",
  39: "Az-Zumar",
  40: "Ghafir",
  41: "Fussilat",
  42: "Ash-Shuraa",
  43: "Az-Zukhruf",
  44: "Ad-Dukhan",
  45: "Al-Jathiyah",
  46: "Al-Ahqaf",
  47: "Muhammad",
  48: "Al-Fath",
  49: "Al-Hujurat",
  50: "Qaf",
  51: "Adh-Dhariyat",
  52: "At-Tur",
  53: "An-Najm",
  54: "Al-Qamar",
  55: "Ar-Rahman",
  56: "Al-Waqi'ah",
  57: "Al-Hadid",
  58: "Al-Mujadila",
  59: "Al-Hashr",
  60: "Al-Mumtahanah",
  61: "As-Saf",
  62: "Al-Jumu'ah",
  63: "Al-Munafiqun",
  64: "At-Taghabun",
  65: "At-Talaq",
  66: "At-Tahrim",
  67: "Al-Mulk",
  68: "Al-Qalam",
  69: "Al-Haqqah",
  70: "Al-Ma'arij",
  71: "Nuh",
  72: "Al-Jinn",
  73: "Al-Muzzammil",
  74: "Al-Muddaththir",
  75: "Al-Qiyamah",
  76: "Al-Insan",
  77: "Al-Mursalat",
  78: "An-Naba",
  79: "An-Nazi'at",
  80: "'Abasa",
  81: "At-Takwir",
  82: "Al-Infitar",
  83: "Al-Mutaffifin",
  84: "Al-Inshiqaq",
  85: "Al-Buruj",
  86: "At-Tariq",
  87: "Al-A'la",
  88: "Al-Ghashiyah",
  89: "Al-Fajr",
  90: "Al-Balad",
  91: "Ash-Shams",
  92: "Al-Layl",
  93: "Ad-Duhaa",
  94: "Ash-Sharh",
  95: "At-Tin",
  96: "Al-'Alaq",
  97: "Al-Qadr",
  98: "Al-Bayyinah",
  99: "Az-Zalzalah",
  100: "Al-'Adiyat",
  101: "Al-Qari'ah",
  102: "At-Takathur",
  103: "Al-'Asr",
  104: "Al-Humazah",
  105: "Al-Fil",
  106: "Quraysh",
  107: "Al-Ma'un",
  108: "Al-Kawthar",
  109: "Al-Kafirun",
  110: "An-Nasr",
  111: "Al-Masad",
  112: "Al-Ikhlas",
  113: "Al-Falaq",
  114: "An-Nas",
};

export interface VerseDetectionResult {
  reference: string;
  verseKey: string;
  confidence: number;
  /** Index of first matched word in the normalized STT array. */
  matchStartIdx: number;
  /** Index (exclusive) past the last matched word in the normalized STT array. */
  matchEndIdx: number;
  /** Total length of the normalized STT array (for ratio computation). */
  sttWordCount: number;
}

const EXPAND_TO_FULL_SURAH: Record<number, number> = {
  1: 7,
  103: 3,
  105: 5,
  106: 4,
  107: 7,
  108: 3,
  109: 6,
  110: 3,
  111: 5,
  112: 4,
  113: 5,
  114: 6,
};

// ── Public utilities (used by live-listen) ───────────────────────────

export function parseVerseRangeFromKey(verseKey: string): {
  chapter: number;
  startVerse: number;
  endVerse: number;
} | null {
  const colon = verseKey.indexOf(":");
  if (colon < 0) return null;
  const chapter = parseInt(verseKey.slice(0, colon), 10);
  const rest = verseKey.slice(colon + 1);
  if (Number.isNaN(chapter) || !rest) return null;
  if (rest.includes("-")) {
    const [a, b] = rest.split("-");
    const s = parseInt(a, 10);
    const e = parseInt(b, 10);
    if (Number.isNaN(s) || Number.isNaN(e)) return null;
    return { chapter, startVerse: Math.min(s, e), endVerse: Math.max(s, e) };
  }
  const v = parseInt(rest, 10);
  if (Number.isNaN(v)) return null;
  return { chapter, startVerse: v, endVerse: v };
}

export function formatVerseKeyAndReference(
  chapter: number,
  startVerse: number,
  endVerse: number,
): { verseKey: string; reference: string } {
  const chapterName = CHAPTER_NAMES[chapter] || `Surah ${chapter}`;
  if (startVerse === endVerse) {
    return {
      verseKey: `${chapter}:${startVerse}`,
      reference: `${chapterName} ${chapter}:${startVerse}`,
    };
  }
  return {
    verseKey: `${chapter}:${startVerse}-${endVerse}`,
    reference: `${chapterName} ${chapter}:${startVerse}-${endVerse}`,
  };
}

export function lastArabicWords(text: string, n: number): string {
  const words = text.split(/\s+/).filter((w) => /[\u0600-\u06FF]/.test(w));
  return words.slice(-n).join(" ");
}

export function getChapterName(chapterNumber: number): string {
  return CHAPTER_NAMES[chapterNumber] || `Surah ${chapterNumber}`;
}

// ── Fuzzy word comparison (alef-tolerant) ────────────────────────────

/**
 * Two normalized Arabic words are considered matching if they're exactly equal
 * OR if the only difference is extra/missing alefs (ا). This handles Uthmani
 * superscript alef (ٰ→ا) producing an alef the STT omits, e.g.
 *   corpus: الاه  (from إِلـٰهِ)  vs  STT: اله  (from إله)
 *
 * Guard: both words must be ≥ 3 chars to avoid false positives like قال↔قل.
 */
function wordsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 3 || b.length < 3) return false;
  if (Math.abs(a.length - b.length) > 2) return false;
  const dropAlef = (w: string) => w.replace(/\u0627/g, "");
  if (dropAlef(a) === dropAlef(b)) return true;
  // Fallback: strip trailing alef/yaa — handles Uthmani ىٰ→ا at word end
  // where STT produces ى→ي (e.g. حتا vs حتي, إلا vs إلي)
  const dropTail = (w: string) => w.replace(/[\u0627\u064A]$/, "");
  return dropTail(a) === dropTail(b);
}

// ── Greedy sequential alignment ──────────────────────────────────────

function greedyMatch(
  haystack: string[],
  needle: string[],
  startHi: number,
): { matched: number; firstHi: number; lastHi: number } {
  let ni = 0;
  let gap = 0;
  let firstHi = -1;
  let lastHi = startHi;
  for (let hi = startHi; hi < haystack.length && ni < needle.length; hi++) {
    if (wordsMatch(haystack[hi], needle[ni])) {
      if (firstHi < 0) firstHi = hi;
      lastHi = hi;
      ni++;
      gap = 0;
    } else if (
      // STT splits what Uthmani corpus combines (e.g. "يا ايها" vs "ياايها")
      hi + 1 < haystack.length &&
      wordsMatch(haystack[hi] + haystack[hi + 1], needle[ni])
    ) {
      if (firstHi < 0) firstHi = hi;
      lastHi = hi + 1;
      hi++;
      ni++;
      gap = 0;
    } else if (
      // STT combines what corpus has split
      ni + 1 < needle.length &&
      wordsMatch(haystack[hi], needle[ni] + needle[ni + 1])
    ) {
      if (firstHi < 0) firstHi = hi;
      lastHi = hi;
      ni += 2;
      gap = 0;
    } else {
      gap++;
      if (ni > 0 && gap > 20) break;
      if (ni === 0 && gap > 8) break;
    }
  }
  return { matched: ni, firstHi: firstHi >= 0 ? firstHi : startHi, lastHi };
}

function bestMatch(
  haystack: string[],
  needle: string[],
  startFrom = 0,
): { matched: number; firstHi: number; lastHi: number } {
  if (needle.length === 0 || haystack.length === 0)
    return { matched: 0, firstHi: 0, lastHi: 0 };
  let best = { matched: 0, firstHi: 0, lastHi: 0 };
  for (let s = startFrom; s < haystack.length; s++) {
    const m = greedyMatch(haystack, needle, s);
    if (m.matched > best.matched) best = m;
    if (best.matched >= needle.length) break;
  }
  return best;
}

// ── Trigram-based candidate discovery ────────────────────────────────

const WINDOW_SIZE = 50;

function findCandidateChapters(sttWords: string[]): Map<number, number> {
  const window = sttWords.slice(-WINDOW_SIZE);
  const hits = new Map<number, number>();

  for (let i = 0; i + 2 < window.length; i++) {
    const key = `${window[i]}|${window[i + 1]}|${window[i + 2]}`;
    const chapters = trigramIndex.get(key);
    if (chapters) {
      for (const ch of chapters) {
        hits.set(ch, (hits.get(ch) || 0) + 1);
      }
    }
  }

  return hits;
}

// ── Core detection ───────────────────────────────────────────────────

export async function findVerseReference(
  arabicText: string,
): Promise<VerseDetectionResult | null> {
  const sttWords = normalize(arabicText);
  if (sttWords.length < 4) return null;

  const trigramHits = findCandidateChapters(sttWords);

  // Filter to chapters with enough trigram hits
  const candidates: Array<[number, number]> = [];
  for (const [ch, count] of trigramHits) {
    if (count >= 2) candidates.push([ch, count]);
  }

  if (candidates.length === 0) {
    console.log(
      `[VerseDetect] No trigram candidates (${sttWords.length} words)`,
    );
    return null;
  }

  // Sort by hit count descending, take top 8
  candidates.sort((a, b) => b[1] - a[1]);
  const top = candidates.slice(0, 8);

  console.log(
    `[VerseDetect] Trigram candidates: ${top.map(([ch, n]) => `${ch}:${CHAPTER_NAMES[ch] || "?"}(${n})`).join(", ")}`,
  );

  // Verify each candidate with greedy sequential match.
  // Only search the recent portion of the STT stream — searching the entire
  // stream (hundreds of khutbah words) causes the greedy matcher to lock onto
  // a false start early in the stream and exhaust its gap budget.
  const searchStart = Math.max(0, sttWords.length - WINDOW_SIZE - 20);

  let best: {
    chapter: number;
    matched: number;
    needleLen: number;
    ratio: number;
    firstHi: number;
    lastHi: number;
  } | null = null;

  for (const [chapter] of top) {
    const needle = getChapterWords(chapter);
    if (needle.length < 3) continue;

    const m = bestMatch(sttWords, needle, searchStart);
    const ratio = m.matched / needle.length;

    if (m.matched > 0 && m.matched < needle.length) {
      // Show which needle words matched and which didn't
      const sttSlice = sttWords.slice(
        Math.max(0, m.firstHi - 2),
        Math.min(sttWords.length, m.lastHi + 3),
      );
      console.log(
        `[VerseDetect:debug] ch=${chapter} stt=[${sttSlice.join(" ")}] needle=[${needle.join(" ")}]`,
      );
    }

    console.log(
      `[VerseDetect:verify] ch=${chapter} (${CHAPTER_NAMES[chapter] || "?"}) matched=${m.matched}/${needle.length} ratio=${(ratio * 100).toFixed(0)}%`,
    );

    const minMatched = needle.length <= 15 ? 3 : 4;
    const minRatio = needle.length <= 15 ? 0.25 : 0.15;

    if (
      m.matched >= minMatched &&
      ratio >= minRatio &&
      (!best ||
        m.matched > best.matched ||
        (m.matched === best.matched && ratio > best.ratio))
    ) {
      best = {
        chapter,
        matched: m.matched,
        needleLen: needle.length,
        ratio,
        firstHi: m.firstHi,
        lastHi: m.lastHi,
      };
    }
  }

  if (!best) {
    console.log("[VerseDetect] No chapter passed verification");
    return null;
  }

  if (best.chapter === 1 && best.matched <= 5) return null;

  let startVerse = 1;
  let endVerse = chapterVerseCounts.get(best.chapter) || 1;

  const fullMax = EXPAND_TO_FULL_SURAH[best.chapter];
  if (fullMax != null) {
    endVerse = fullMax;
  } else if (endVerse > 40) {
    const chapterWords = getChapterWords(best.chapter);
    const matchedNeedleStart = chapterWords.indexOf(
      sttWords[best.firstHi] || "",
    );
    const matchedNeedleEnd = chapterWords.lastIndexOf(
      sttWords[best.lastHi] || "",
    );
    let wordsSoFar = 0;
    startVerse = 1;
    endVerse = chapterVerseCounts.get(best.chapter) || 1;
    for (let v = 1; v <= endVerse; v++) {
      const vText = corpusMap.get(`${best.chapter}:${v}`);
      const vWords = vText ? normalize(vText).length : 0;
      if (wordsSoFar + vWords > matchedNeedleStart && startVerse === 1) {
        startVerse = v;
      }
      wordsSoFar += vWords;
      if (wordsSoFar >= matchedNeedleEnd && matchedNeedleEnd >= 0) {
        endVerse = v;
        break;
      }
    }
  }

  const { verseKey, reference } = formatVerseKeyAndReference(
    best.chapter,
    startVerse,
    endVerse,
  );

  // +1 because lastHi is inclusive but we want an exclusive end index
  const matchEndIdx = best.lastHi + 1;

  console.log(
    `[VerseDetect] ✓ ACCEPTED: ${reference} — ${best.matched}/${best.needleLen} (${(best.ratio * 100).toFixed(0)}%) arabicSpan=[${best.firstHi},${matchEndIdx})/${sttWords.length}`,
  );

  return {
    reference,
    verseKey,
    confidence: best.ratio,
    matchStartIdx: best.firstHi,
    matchEndIdx,
    sttWordCount: sttWords.length,
  };
}
