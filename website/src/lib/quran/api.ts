/**
 * Quran.com API Client
 * Uses the public API for verse search (no OAuth required)
 * 
 * CONSERVATIVE MATCHING: Only returns verse references when highly confident
 * the Arabic text is actual Quran recitation, not regular speech.
 */

// Chapter names from the official API
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

/**
 * Formatted verse reference for display
 */
export interface VerseReference {
  reference: string; // e.g., "Al-Fatihah 1:2"
  verseKey: string; // e.g., "1:2"
  confidence: number; // 0-1 score based on word match ratio
  longestConsecutive: number; // Longest streak of consecutive matched words
}

interface SearchResultWord {
  char_type: string;
  text: string;
  highlight?: boolean;
}

interface SearchResult {
  verse_key: string;
  verse_id: number;
  text: string;
  highlighted?: string;
  words?: SearchResultWord[];
}

/**
 * Count Arabic words in text
 */
function countArabicWords(text: string): number {
  const words = text.split(/\s+/).filter((w) => /[\u0600-\u06FF]/.test(w));
  return words.length;
}

/**
 * Strip tashkeel / diacritics and normalize common letter variants
 * for exact surface-form comparison.
 */
function normalizeArabic(text: string): string {
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, "")
    .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
    .replace(/\u0629/g, "\u0647")
    .replace(/\u0649/g, "\u064A");
}

/**
 * Verify match using exact surface-form comparison (not root/stem).
 * The API's highlight uses root matching which is too loose.
 */
function verifyExactMatch(
  verseWords: SearchResultWord[],
  inputText: string,
): { exactHighlighted: number; exactConsecutive: number } {
  const normalizedInput = normalizeArabic(inputText);
  const inputWordSet = new Set(
    normalizedInput.split(/\s+/).filter((w) => /[\u0600-\u06FF]/.test(w)),
  );

  const actualWords = verseWords.filter((w) => w.char_type === "word");
  let exactHighlighted = 0;
  let exactConsecutive = 0;
  let streak = 0;

  for (const word of actualWords) {
    if (word.highlight !== true) { streak = 0; continue; }
    const normalizedWord = normalizeArabic(word.text);
    if (inputWordSet.has(normalizedWord)) {
      exactHighlighted++;
      streak++;
      exactConsecutive = Math.max(exactConsecutive, streak);
    } else {
      streak = 0;
    }
  }

  return { exactHighlighted, exactConsecutive };
}

/**
 * Analyze search result using exact surface-form matching.
 */
function analyzeMatch(
  result: SearchResult,
  inputWordCount: number,
  isTopResult: boolean = false,
  inputText: string = "",
): { confidence: number; verseWordCount: number; highlightedCount: number; longestConsecutive: number } {
  if (!result.words || result.words.length === 0) {
    return { confidence: 0, verseWordCount: 0, highlightedCount: 0, longestConsecutive: 0 };
  }

  const actualWords = result.words.filter((w) => w.char_type === "word");
  const verseWordCount = actualWords.length;

  const { exactHighlighted, exactConsecutive } = verifyExactMatch(result.words, inputText);

  if (exactHighlighted < 2) {
    return { confidence: 0, verseWordCount, highlightedCount: exactHighlighted, longestConsecutive: 0 };
  }

  if (exactConsecutive < 3 && verseWordCount > 5) {
    return { confidence: 0, verseWordCount, highlightedCount: exactHighlighted, longestConsecutive: exactConsecutive };
  }
  if (exactConsecutive < 2) {
    return { confidence: 0, verseWordCount, highlightedCount: exactHighlighted, longestConsecutive: exactConsecutive };
  }

  const verseMatchRatio = exactHighlighted / verseWordCount;
  let confidence = 0;

  if (verseWordCount <= 5) {
    confidence = verseMatchRatio * 0.9;
  } else if (verseWordCount <= 15) {
    confidence = verseMatchRatio;
    if (exactConsecutive >= 3) confidence *= 1.2;
  } else {
    if (exactHighlighted >= 4) {
      confidence = verseMatchRatio * 1.2;
      if (exactConsecutive >= 4) confidence *= 1.15;
    }
  }

  if (exactConsecutive >= 5) confidence = Math.min(confidence * 1.15, 1);
  if (exactConsecutive >= 6) confidence = Math.min(confidence * 1.1, 1);
  if (isTopResult && confidence > 0) confidence = Math.min(confidence * 1.15, 1);

  confidence = Math.min(confidence, 1);

  return { confidence, verseWordCount, highlightedCount: exactHighlighted, longestConsecutive: exactConsecutive };
}

/**
 * Parse verse key into chapter and verse numbers
 */
function parseVerseKey(verseKey: string): { chapter: number; verse: number } | null {
  const parts = verseKey.split(":");
  if (parts.length !== 2) return null;
  const chapter = parseInt(parts[0], 10);
  const verse = parseInt(parts[1], 10);
  if (isNaN(chapter) || isNaN(verse)) return null;
  return { chapter, verse };
}

/**
 * Find consecutive verse range from matched verses
 * Returns the range if verses are from same chapter and consecutive
 */
function findVerseRange(
  matchedVerses: Array<{ verseKey: string; confidence: number }>
): { chapter: number; startVerse: number; endVerse: number } | null {
  if (matchedVerses.length === 0) return null;

  // Parse all verse keys
  const parsed = matchedVerses
    .map((v) => ({ ...parseVerseKey(v.verseKey), confidence: v.confidence }))
    .filter((p): p is { chapter: number; verse: number; confidence: number } => p !== null);

  if (parsed.length === 0) return null;

  // Group by chapter
  const byChapter = new Map<number, number[]>();
  for (const p of parsed) {
    const verses = byChapter.get(p.chapter) || [];
    verses.push(p.verse);
    byChapter.set(p.chapter, verses);
  }

  // Find the chapter with the most matched verses
  let bestChapter = 0;
  let bestVerses: number[] = [];
  for (const [chapter, verses] of byChapter) {
    if (verses.length > bestVerses.length) {
      bestChapter = chapter;
      bestVerses = verses;
    }
  }

  if (bestVerses.length === 0) return null;

  // Sort verses and find consecutive range
  bestVerses.sort((a, b) => a - b);

  // Find the longest consecutive sequence
  let startVerse = bestVerses[0];
  let endVerse = bestVerses[0];
  let currentStart = bestVerses[0];
  let currentEnd = bestVerses[0];

  for (let i = 1; i < bestVerses.length; i++) {
    if (bestVerses[i] === currentEnd + 1) {
      // Consecutive
      currentEnd = bestVerses[i];
    } else {
      // Gap - check if current range is longer
      if (currentEnd - currentStart > endVerse - startVerse) {
        startVerse = currentStart;
        endVerse = currentEnd;
      }
      currentStart = bestVerses[i];
      currentEnd = bestVerses[i];
    }
  }

  // Check final range
  if (currentEnd - currentStart > endVerse - startVerse) {
    startVerse = currentStart;
    endVerse = currentEnd;
  }

  return { chapter: bestChapter, startVerse, endVerse };
}

/**
 * Search Quran verses using the public API
 * Returns null if no confident match found
 * Detects verse ranges when multiple consecutive verses are matched
 */
export async function findVerseReference(
  arabicText: string
): Promise<VerseReference | null> {
  // Minimum requirements for a reliable search
  const inputWordCount = countArabicWords(arabicText);
  if (!arabicText || arabicText.trim().length < 8 || inputWordCount < 2) {
    return null;
  }

  try {
    // Use the public Quran.com API (no auth needed)
    // Get more results to detect verse ranges
    const params = new URLSearchParams({
      q: arabicText.trim(),
      size: "10",
      page: "1",
    });

    const response = await fetch(
      `https://api.quran.com/api/v4/search?${params}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Quran search failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const results: SearchResult[] = data?.search?.results || [];

    if (results.length === 0) {
      return null;
    }

    // Analyze all results and collect confident matches
    const confidentMatches: Array<{ verseKey: string; confidence: number }> = [];
    let bestConfidence = 0;
    let bestConsecutive = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      
      const isTopResult = i === 0;
      const analysis = analyzeMatch(result, inputWordCount, isTopResult, arabicText);
      
      // Collect all matches above threshold for range detection
      if (analysis.confidence >= 0.25) {
        confidentMatches.push({
          verseKey: result.verse_key,
          confidence: analysis.confidence,
        });
      }

      if (analysis.confidence > bestConfidence) {
        bestConfidence = analysis.confidence;
        bestConsecutive = analysis.longestConsecutive;
      }
    }

    // THRESHOLD: 35%+ confidence — requires consecutive word sequences
    // to avoid false positives from common Arabic words in hadith/speech
    if (bestConfidence < 0.35) {
      return null;
    }

    // Try to find a verse range from confident matches
    const range = findVerseRange(confidentMatches);

    if (!range) {
      return null;
    }

    // Skip Bismillah (Al-Fatiha 1:1) - it's said before every surah recitation
    // so detecting it would give false positives
    if (range.chapter === 1 && range.startVerse === 1 && range.endVerse === 1) {
      return null;
    }

    const chapterName = CHAPTER_NAMES[range.chapter] || `Surah ${range.chapter}`;

    // Format the reference
    let verseKey: string;
    let reference: string;

    if (range.startVerse === range.endVerse) {
      // Single verse
      verseKey = `${range.chapter}:${range.startVerse}`;
      reference = `${chapterName} ${range.chapter}:${range.startVerse}`;
    } else {
      // Verse range
      verseKey = `${range.chapter}:${range.startVerse}-${range.endVerse}`;
      reference = `${chapterName} ${range.chapter}:${range.startVerse}-${range.endVerse}`;
    }

    return {
      reference,
      verseKey,
      confidence: bestConfidence,
      longestConsecutive: bestConsecutive,
    };
  } catch (error) {
    console.error("Error finding verse reference:", error);
    return null;
  }
}

/**
 * Get chapter name by number
 */
export function getChapterName(chapterNumber: number): string {
  return CHAPTER_NAMES[chapterNumber] || `Surah ${chapterNumber}`;
}
