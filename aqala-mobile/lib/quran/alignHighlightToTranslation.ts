/**
 * Align verse highlight boundaries using the LOCAL Arabic Uthmani corpus.
 *
 * Strategy: find where the surah's Arabic text starts/ends in the Arabic
 * source stream, then proportionally map those positions to translation words.
 * This is far more reliable than matching English STT against an official
 * English translation, because Arabic Quran text is fixed.
 */

import quranCorpus from "@/assets/quran-uthmani-compact.json";

const corpus = quranCorpus as Array<[string, string]>;

/** Normalize Arabic: Uthmani corpus ↔ STT compatible. */
function stripArabic(text: string): string {
  return text
    .replace(/[\u0649\u0648]\u0670/g, "\u0627")
    .replace(/\u0670/g, "\u0627")
    .replace(
      /[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06ED\u0640]/g,
      "",
    )
    .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
    .replace(/\u0621/g, "")
    .replace(/\u0629/g, "\u0647")
    .replace(/\u0649/g, "\u064A")
    .replace(/\u06C1/g, "\u0647")
    .replace(/[\u0600-\u0605\u0606-\u060F\u061B-\u061F\u06D4]/g, "")
    .replace(/[^\u0600-\u06FF\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function arabicWords(text: string): string[] {
  return stripArabic(text)
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/**
 * Return all Arabic words for a surah range, e.g. "112:1-4" or "112:3".
 * For single-ayah detections on short surahs (≤20 verses), returns the whole surah.
 */
function getSurahArabicWords(verseKey: string): string[] {
  const [chStr, rangeStr] = verseKey.split(":");
  const chapter = parseInt(chStr, 10);
  if (!rangeStr || isNaN(chapter)) return [];

  const parts = rangeStr.split("-");
  let startV = parseInt(parts[0], 10);
  let endV = parseInt(parts[parts.length - 1], 10);
  if (isNaN(startV)) return [];
  if (isNaN(endV)) endV = startV;

  const chapterVerses = corpus.filter((v) =>
    v[0].startsWith(`${chapter}:`),
  );
  if (chapterVerses.length === 0) return [];

  // For short surahs, always use the full surah text
  if (chapterVerses.length <= 20) {
    startV = 1;
    endV = chapterVerses.length;
  }

  const words: string[] = [];
  for (let v = startV; v <= endV; v++) {
    const entry = chapterVerses.find((e) => e[0] === `${chapter}:${v}`);
    if (entry) words.push(...arabicWords(entry[1]));
  }
  return words;
}

/**
 * Max consecutive STT words without advancing the surah needle.
 * Takbīr / dhikr between āyāt can be 20–40+ tokens; too small a gap stops at 112:3
 * and never reaches 112:4, so the English card splits.
 */
const MAX_HAYSTACK_GAP = 42;

/**
 * From haystack index `startHi`, greedily match needle[0..] allowing STT gaps.
 * Returns how many needle words matched and the haystack span [firstHi, endHi).
 */
function greedyAlignFrom(
  haystack: string[],
  needle: string[],
  startHi: number,
): { matched: number; firstHi: number; endHi: number } {
  let hi = startHi;
  let ni = 0;
  let firstHi = -1;
  let gap = 0;

  while (hi < haystack.length && ni < needle.length) {
    if (haystack[hi] === needle[ni]) {
      if (firstHi < 0) firstHi = hi;
      ni++;
      hi++;
      gap = 0;
    } else {
      hi++;
      gap++;
      if (firstHi >= 0 && gap > MAX_HAYSTACK_GAP) break;
      if (firstHi < 0 && gap > 28) break;
    }
  }

  const endHi = hi;
  const fh = firstHi >= 0 ? firstHi : startHi;
  return { matched: ni, firstHi: fh, endHi };
}

/**
 * Find where the full surah needle sits in the Arabic stream.
 * Aligns from surah start (or near it); avoids locking onto a short streak mid-surah.
 *
 * `minHaystackIndex` — when verse was detected from a tail-only API result, ignore
 * spurious early partial matches in long khutbah streams.
 */
function findBestArabicMatch(
  haystack: string[],
  needle: string[],
  minHaystackIndex = 0,
): { start: number; end: number } | null {
  if (needle.length === 0 || haystack.length === 0) return null;

  const minStart = Math.max(0, minHaystackIndex);

  const minMatched = Math.min(
    needle.length,
    Math.max(6, Math.ceil(needle.length * 0.5)),
  );

  let bestMatched = 0;
  let bestStart = 0;
  let bestEnd = 0;

  const consider = (
    sub: string[],
    s: number,
    leadWords: number,
    minForSub: number,
  ) => {
    if (s < minStart) return;
    if (haystack[s] !== sub[0]) return;
    const { matched, firstHi, endHi } = greedyAlignFrom(haystack, sub, s);
    if (matched < minForSub) return;
    const total = matched + leadWords;
    const candStart = Math.max(0, firstHi - leadWords);
    // Prefer a *later* span when scores tie — avoids hoisting the card on early noise.
    if (
      total > bestMatched ||
      (total === bestMatched && candStart > bestStart)
    ) {
      bestMatched = total;
      bestStart = candStart;
      bestEnd = endHi;
    }
  };

  // Try surah start at needle[0], needle[1], needle[2] (STT may drop/split first tokens)
  const maxLead = Math.min(2, Math.max(0, needle.length - 5));
  for (let lead = 0; lead <= maxLead; lead++) {
    const sub = needle.slice(lead);
    const minForSub = Math.max(
      5,
      Math.min(sub.length, minMatched - lead),
    );
    for (let s = minStart; s < haystack.length; s++) {
      consider(sub, s, lead, minForSub);
    }
  }

  // Last resort: unanchored greedy (only if still weak)
  if (bestMatched < minMatched) {
    for (let s = minStart; s < haystack.length; s++) {
      const { matched, firstHi, endHi } = greedyAlignFrom(haystack, needle, s);
      if (
        matched > bestMatched ||
        (matched === bestMatched && firstHi > bestStart)
      ) {
        bestMatched = matched;
        bestStart = firstHi;
        bestEnd = endHi;
      }
    }
  }

  if (bestMatched < minMatched) return null;

  return { start: bestStart, end: bestEnd };
}

export interface AlignedBounds {
  startWord: number;
  endWord: number;
  /**
   * Exclusive haystack word index where the surah needle match ended (when found).
   * Used in live listen to wait until enough Arabic exists *after* the surah (khutbah)
   * before showing the Quran card.
   */
  arabicMatchEnd?: number;
}

export interface AlignVerseBoundsOptions {
  /** Haystack indices below this are skipped (tail-biased verse detection). */
  minArabicMatchIndex?: number;
}

/** Same tokenization as alignment — use when computing tail windows in live-listen. */
export function arabicHaystackWords(text: string): string[] {
  return arabicWords(text);
}

/**
 * Given the full Arabic source text and translation words, find where `verseKey`'s
 * Arabic starts/ends in the source, then proportionally map to translation indices.
 *
 * `hintStart` / `hintEnd` are the current rough bounds (from word-count ratio).
 * Returns tighter bounds, or falls back to hint bounds.
 */
/** When Arabic match fails, never return hintEnd === transcript length — that hides all typewriter text after the verse. */
function tightFallbackEnd(
  hintStart: number,
  translationWordCount: number,
  surahWordCount: number,
  sourceWordCount: number,
): number {
  const ratio = translationWordCount / Math.max(1, sourceWordCount);
  const n = Math.max(surahWordCount, 8);
  const est = Math.ceil(n * ratio * 1.35) + 6;
  const span = Math.max(10, Math.min(56, est));
  return Math.min(
    translationWordCount,
    Math.max(hintStart + 2, hintStart + span),
  );
}

export function alignVerseBoundsFromArabic(
  arabicSourceText: string,
  translationWordCount: number,
  verseKey: string,
  hintStart: number,
  _hintEnd: number,
  options?: AlignVerseBoundsOptions,
): AlignedBounds {
  const surahWords = getSurahArabicWords(verseKey);
  const sourceWords = arabicWords(arabicSourceText);
  const minArabicIdx = Math.max(0, options?.minArabicMatchIndex ?? 0);

  if (surahWords.length < 3 || sourceWords.length < 3) {
    const end = tightFallbackEnd(
      hintStart,
      translationWordCount,
      Math.max(surahWords.length, 10),
      sourceWords.length,
    );
    return { startWord: hintStart, endWord: end, arabicMatchEnd: undefined };
  }

  const match = findBestArabicMatch(sourceWords, surahWords, minArabicIdx);
  if (!match) {
    const end = tightFallbackEnd(
      hintStart,
      translationWordCount,
      surahWords.length,
      sourceWords.length,
    );
    return { startWord: hintStart, endWord: end, arabicMatchEnd: undefined };
  }

  // Proportional mapping: Arabic index → translation index (rough global clock).
  const ratio = translationWordCount / Math.max(1, sourceWords.length);

  let startWord = Math.floor(match.start * ratio);
  let endWord = Math.ceil(match.end * ratio);

  // Tiny slack only — large padding pulled khutbah / next topic into the card.
  startWord = Math.max(0, startWord - 3);
  endWord = Math.min(translationWordCount, endWord + 4);

  // Hard cap: English for this surah is rarely > ~1.3× the Arabic word count × ratio.
  // When the global ratio balloons the window, trim extra — bias toward cutting
  // leading khutbah (before) more than tail.
  const maxSpan = Math.max(
    12,
    Math.ceil(surahWords.length * ratio * 1.32),
  );
  let span = endWord - startWord;
  if (span > maxSpan) {
    const excess = span - maxSpan;
    const trimLead = Math.ceil(excess * 0.58);
    const trimTail = excess - trimLead;
    startWord = Math.min(
      Math.max(0, startWord + trimLead),
      endWord - 2,
    );
    endWord = Math.max(
      startWord + 2,
      Math.min(translationWordCount, endWord - trimTail),
    );
  }

  // Proportional Arabic→translation mapping can land before English that already
  // existed when Arabic STT began. `hintStart` is that floor (see live-listen).
  startWord = Math.max(hintStart, startWord);

  const srcLen = sourceWords.length;
  const nTrans = translationWordCount;
  const matchStartsLate = match.start >= srcLen * 0.22;
  const matchEndsNearStreamEnd = match.end >= srcLen * 0.78;
  const mappedEnglishStartsTooEarly =
    nTrans > 0 && startWord < nTrans * 0.32;

  // Translation and Arabic STT often diverge in length; a global ratio then puts
  // the English card at the top even when the Arabic match is clearly recent.
  if (
    nTrans >= 18 &&
    srcLen >= 14 &&
    matchStartsLate &&
    matchEndsNearStreamEnd &&
    mappedEnglishStartsTooEarly
  ) {
    const ratio = nTrans / Math.max(1, srcLen);
    const spanAr = Math.max(1, match.end - match.start);
    let spanEn = Math.ceil(spanAr * ratio) + 12;
    spanEn = Math.max(12, Math.min(88, spanEn));
    endWord = nTrans;
    startWord = Math.max(hintStart, nTrans - spanEn);
  }

  if (endWord <= startWord) {
    const end = tightFallbackEnd(
      startWord,
      translationWordCount,
      surahWords.length,
      sourceWords.length,
    );
    return {
      startWord,
      endWord: end,
      arabicMatchEnd: match.end,
    };
  }

  endWord = Math.min(
    translationWordCount,
    Math.max(endWord, startWord + 2),
  );

  return { startWord, endWord, arabicMatchEnd: match.end };
}
