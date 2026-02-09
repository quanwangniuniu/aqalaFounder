/**
 * Quran.com API Client
 * Uses the public API for verse search (no OAuth required)
 * 
 * CONSERVATIVE MATCHING: Only returns verse references when highly confident
 * the Arabic text is actual Quran recitation, not regular speech.
 */

// Chapter names from the official API
const CHAPTER_NAMES: Record<number, string> = {
    1: "Al-Fatihah", 2: "Al-Baqarah", 3: "Ali 'Imran", 4: "An-Nisa", 5: "Al-Ma'idah",
    6: "Al-An'am", 7: "Al-A'raf", 8: "Al-Anfal", 9: "At-Tawbah", 10: "Yunus",
    11: "Hud", 12: "Yusuf", 13: "Ar-Ra'd", 14: "Ibrahim", 15: "Al-Hijr",
    16: "An-Nahl", 17: "Al-Isra", 18: "Al-Kahf", 19: "Maryam", 20: "Taha",
    21: "Al-Anbya", 22: "Al-Hajj", 23: "Al-Mu'minun", 24: "An-Nur", 25: "Al-Furqan",
    26: "Ash-Shu'ara", 27: "An-Naml", 28: "Al-Qasas", 29: "Al-'Ankabut", 30: "Ar-Rum",
    31: "Luqman", 32: "As-Sajdah", 33: "Al-Ahzab", 34: "Saba", 35: "Fatir",
    36: "Ya-Sin", 37: "As-Saffat", 38: "Sad", 39: "Az-Zumar", 40: "Ghafir",
    41: "Fussilat", 42: "Ash-Shuraa", 43: "Az-Zukhruf", 44: "Ad-Dukhan", 45: "Al-Jathiyah",
    46: "Al-Ahqaf", 47: "Muhammad", 48: "Al-Fath", 49: "Al-Hujurat", 50: "Qaf",
    51: "Adh-Dhariyat", 52: "At-Tur", 53: "An-Najm", 54: "Al-Qamar", 55: "Ar-Rahman",
    56: "Al-Waqi'ah", 57: "Al-Hadid", 58: "Al-Mujadila", 59: "Al-Hashr", 60: "Al-Mumtahanah",
    61: "As-Saf", 62: "Al-Jumu'ah", 63: "Al-Munafiqun", 64: "At-Taghabun", 65: "At-Talaq",
    66: "At-Tahrim", 67: "Al-Mulk", 68: "Al-Qalam", 69: "Al-Haqqah", 70: "Al-Ma'arij",
    71: "Nuh", 72: "Al-Jinn", 73: "Al-Muzzammil", 74: "Al-Muddaththir", 75: "Al-Qiyamah",
    76: "Al-Insan", 77: "Al-Mursalat", 78: "An-Naba", 79: "An-Nazi'at", 80: "'Abasa",
    81: "At-Takwir", 82: "Al-Infitar", 83: "Al-Mutaffifin", 84: "Al-Inshiqaq", 85: "Al-Buruj",
    86: "At-Tariq", 87: "Al-A'la", 88: "Al-Ghashiyah", 89: "Al-Fajr", 90: "Al-Balad",
    91: "Ash-Shams", 92: "Al-Layl", 93: "Ad-Duhaa", 94: "Ash-Sharh", 95: "At-Tin",
    96: "Al-'Alaq", 97: "Al-Qadr", 98: "Al-Bayyinah", 99: "Az-Zalzalah", 100: "Al-'Adiyat",
    101: "Al-Qari'ah", 102: "At-Takathur", 103: "Al-'Asr", 104: "Al-Humazah", 105: "Al-Fil",
    106: "Quraysh", 107: "Al-Ma'un", 108: "Al-Kawthar", 109: "Al-Kafirun", 110: "An-Nasr",
    111: "Al-Masad", 112: "Al-Ikhlas", 113: "Al-Falaq", 114: "An-Nas",
};

export interface VerseReference {
    reference: string;
    verseKey: string;
    confidence: number;
    longestConsecutive: number;
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

function countArabicWords(text: string): number {
    const words = text.split(/\s+/).filter((w) => /[\u0600-\u06FF]/.test(w));
    return words.length;
}

function analyzeMatch(
    result: SearchResult,
    inputWordCount: number,
    isTopResult: boolean = false
): { confidence: number; verseWordCount: number; highlightedCount: number; longestConsecutive: number } {
    if (!result.words || result.words.length === 0) {
        return { confidence: 0, verseWordCount: 0, highlightedCount: 0, longestConsecutive: 0 };
    }

    const actualWords = result.words.filter((w) => w.char_type === "word");
    const verseWordCount = actualWords.length;
    const highlightedCount = actualWords.filter((w) => w.highlight === true).length;

    if (highlightedCount === 0) {
        return { confidence: 0, verseWordCount, highlightedCount, longestConsecutive: 0 };
    }

    let longestConsecutive = 0;
    let currentStreak = 0;
    for (const word of actualWords) {
        if (word.highlight === true) {
            currentStreak++;
            longestConsecutive = Math.max(longestConsecutive, currentStreak);
        } else {
            currentStreak = 0;
        }
    }

    const verseMatchRatio = highlightedCount / verseWordCount;
    const inputMatchRatio = highlightedCount / inputWordCount;

    let confidence = 0;

    const hasGoodConsecutive = longestConsecutive >= 2;
    const hasHighDensity = highlightedCount >= 3 && inputMatchRatio >= 0.5;

    if (!hasGoodConsecutive && !hasHighDensity) {
        return { confidence: 0, verseWordCount, highlightedCount, longestConsecutive };
    }

    if (verseWordCount <= 5) {
        if (verseMatchRatio >= 0.5 && highlightedCount >= 2) {
            confidence = verseMatchRatio * 0.9;
        }
    } else if (verseWordCount <= 15) {
        if (verseMatchRatio >= 0.35 && highlightedCount >= 3) {
            confidence = verseMatchRatio;
            if (longestConsecutive >= 3) confidence *= 1.15;
        }
    } else {
        if (highlightedCount >= 4 && verseMatchRatio >= 0.2) {
            confidence = verseMatchRatio * 1.2;
            if (longestConsecutive >= 3) confidence *= 1.1;
        }
    }

    if (longestConsecutive >= 4) confidence = Math.min(confidence * 1.15, 1);
    if (longestConsecutive >= 5) confidence = Math.min(confidence * 1.1, 1);
    if (isTopResult && confidence > 0) confidence = Math.min(confidence * 1.2, 1);
    confidence = Math.min(confidence, 1);

    return { confidence, verseWordCount, highlightedCount, longestConsecutive };
}

function parseVerseKey(verseKey: string): { chapter: number; verse: number } | null {
    const parts = verseKey.split(":");
    if (parts.length !== 2) return null;
    const chapter = parseInt(parts[0], 10);
    const verse = parseInt(parts[1], 10);
    if (isNaN(chapter) || isNaN(verse)) return null;
    return { chapter, verse };
}

function findVerseRange(
    matchedVerses: Array<{ verseKey: string; confidence: number }>
): { chapter: number; startVerse: number; endVerse: number } | null {
    if (matchedVerses.length === 0) return null;

    const parsed = matchedVerses
        .map((v) => ({ ...parseVerseKey(v.verseKey), confidence: v.confidence }))
        .filter((p): p is { chapter: number; verse: number; confidence: number } => p !== null);

    if (parsed.length === 0) return null;

    const byChapter = new Map<number, number[]>();
    for (const p of parsed) {
        const verses = byChapter.get(p.chapter) || [];
        verses.push(p.verse);
        byChapter.set(p.chapter, verses);
    }

    let bestChapter = 0;
    let bestVerses: number[] = [];
    for (const [chapter, verses] of byChapter) {
        if (verses.length > bestVerses.length) {
            bestChapter = chapter;
            bestVerses = verses;
        }
    }

    if (bestVerses.length === 0) return null;

    bestVerses.sort((a, b) => a - b);

    let startVerse = bestVerses[0];
    let endVerse = bestVerses[0];
    let currentStart = bestVerses[0];
    let currentEnd = bestVerses[0];

    for (let i = 1; i < bestVerses.length; i++) {
        if (bestVerses[i] === currentEnd + 1) {
            currentEnd = bestVerses[i];
        } else {
            if (currentEnd - currentStart > endVerse - startVerse) {
                startVerse = currentStart;
                endVerse = currentEnd;
            }
            currentStart = bestVerses[i];
            currentEnd = bestVerses[i];
        }
    }

    if (currentEnd - currentStart > endVerse - startVerse) {
        startVerse = currentStart;
        endVerse = currentEnd;
    }

    return { chapter: bestChapter, startVerse, endVerse };
}

export async function findVerseReference(arabicText: string): Promise<VerseReference | null> {
    const inputWordCount = countArabicWords(arabicText);
    if (!arabicText || arabicText.trim().length < 8 || inputWordCount < 2) {
        return null;
    }

    try {
        const params = new URLSearchParams({ q: arabicText.trim(), size: "10", page: "1" });
        const response = await fetch(`https://api.quran.com/api/v4/search?${params}`, {
            headers: { Accept: "application/json" },
        });

        if (!response.ok) return null;

        const data = await response.json();
        const results: SearchResult[] = data?.search?.results || [];

        if (results.length === 0) return null;

        const confidentMatches: Array<{ verseKey: string; confidence: number }> = [];
        let bestConfidence = 0;
        let bestConsecutive = 0;

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.verse_key === "1:1") continue;
            const isTopResult = i === 0;
            const analysis = analyzeMatch(result, inputWordCount, isTopResult);

            if (analysis.confidence >= 0.35) {
                confidentMatches.push({ verseKey: result.verse_key, confidence: analysis.confidence });
            }
            if (analysis.confidence > bestConfidence) {
                bestConfidence = analysis.confidence;
                bestConsecutive = analysis.longestConsecutive;
            }
        }

        if (bestConfidence < 0.45) return null;

        const range = findVerseRange(confidentMatches);
        if (!range) return null;
        if (range.chapter === 1 && range.startVerse === 1 && range.endVerse === 1) return null;

        const chapterName = CHAPTER_NAMES[range.chapter] || `Surah ${range.chapter}`;

        let verseKey: string;
        let reference: string;

        if (range.startVerse === range.endVerse) {
            verseKey = `${range.chapter}:${range.startVerse}`;
            reference = `${chapterName} ${range.chapter}:${range.startVerse}`;
        } else {
            verseKey = `${range.chapter}:${range.startVerse}-${range.endVerse}`;
            reference = `${chapterName} ${range.chapter}:${range.startVerse}-${range.endVerse}`;
        }

        return { reference, verseKey, confidence: bestConfidence, longestConsecutive: bestConsecutive };
    } catch (error) {
        console.error("Error finding verse reference:", error);
        return null;
    }
}

export function getChapterName(chapterNumber: number): string {
    return CHAPTER_NAMES[chapterNumber] || `Surah ${chapterNumber}`;
}
