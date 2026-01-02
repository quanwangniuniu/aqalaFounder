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
 * Analyze search result to determine if it's a confident match
 * Returns confidence score 0-1
 * 
 * @param result - The search result to analyze
 * @param inputWordCount - Number of Arabic words in the input
 * @param isTopResult - Whether this is the #1 ranked result (gets bonus)
 */
function analyzeMatch(
  result: SearchResult,
  inputWordCount: number,
  isTopResult: boolean = false
): { confidence: number; verseWordCount: number; highlightedCount: number } {
  if (!result.words || result.words.length === 0) {
    return { confidence: 0, verseWordCount: 0, highlightedCount: 0 };
  }

  // Count actual words (not verse numbers/end markers)
  const actualWords = result.words.filter((w) => w.char_type === "word");
  const verseWordCount = actualWords.length;
  const highlightedCount = actualWords.filter((w) => w.highlight === true).length;

  // If no words highlighted, no match
  if (highlightedCount === 0) {
    return { confidence: 0, verseWordCount, highlightedCount };
  }

  // Calculate what percentage of the verse is highlighted
  const verseMatchRatio = highlightedCount / verseWordCount;
  
  let confidence = 0;

  // Short verses (1-5 words): need high match ratio
  if (verseWordCount <= 5) {
    if (verseMatchRatio >= 0.5 && highlightedCount >= 2) {
      confidence = verseMatchRatio;
    }
  }
  // Medium verses (6-15 words): more lenient
  else if (verseWordCount <= 15) {
    // For medium verses, 35%+ match with 3+ highlighted words
    if (verseMatchRatio >= 0.35 && highlightedCount >= 3) {
      confidence = verseMatchRatio * 1.1; // Boost slightly
    }
  }
  // Long verses (16+ words): even more lenient (harder to get high ratio)
  else {
    if (verseMatchRatio >= 0.25 && highlightedCount >= 4) {
      confidence = verseMatchRatio * 1.3; // Bigger boost for long verses
    }
  }

  // Boost confidence if highlighted words roughly match input word count
  const inputMatchRatio = highlightedCount / inputWordCount;
  if (inputMatchRatio >= 0.5) {
    confidence = Math.min(confidence * 1.2, 1);
  }

  // Top result from search API gets a significant boost
  // The search algorithm already ranks by relevance
  if (isTopResult && confidence > 0) {
    confidence = Math.min(confidence * 1.25, 1);
  }

  return { confidence, verseWordCount, highlightedCount };
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

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      
      // Skip Bismillah (1:1) - it's said before every surah, not a unique reference
      if (result.verse_key === "1:1") {
        continue;
      }
      
      const isTopResult = i === 0; // First result gets ranking boost
      const analysis = analyzeMatch(result, inputWordCount, isTopResult);
      
      // Collect all matches above a lower threshold for range detection
      if (analysis.confidence >= 0.35) {
        confidentMatches.push({
          verseKey: result.verse_key,
          confidence: analysis.confidence,
        });
      }

      if (analysis.confidence > bestConfidence) {
        bestConfidence = analysis.confidence;
      }
    }

    // THRESHOLD: Need at least one match with 45%+ confidence
    // Lower than before because we trust the search API's ranking
    if (bestConfidence < 0.45) {
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
