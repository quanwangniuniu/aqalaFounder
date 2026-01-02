/**
 * API endpoint to fetch verse details from Quran.com
 * GET /api/verse?key=1:2 or /api/verse?key=18:38-42
 */

import { NextResponse } from "next/server";

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

interface VerseData {
  verseKey: string;
  verseNumber: number;
  arabicText: string;
  translation: string;
}

interface VerseResponse {
  chapter: number;
  chapterName: string;
  chapterNameArabic: string;
  verses: VerseData[];
  startVerse: number;
  endVerse: number;
  totalVerses: number;
  revelationPlace: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const lang = searchParams.get("lang") || "en";

  if (!key) {
    return NextResponse.json(
      { error: "Missing verse key parameter" },
      { status: 400 }
    );
  }

  try {
    // Parse verse key: "18:38" or "18:38-42"
    const [chapterStr, verseRange] = key.split(":");
    const chapter = parseInt(chapterStr, 10);
    
    if (isNaN(chapter) || chapter < 1 || chapter > 114) {
      return NextResponse.json(
        { error: "Invalid chapter number" },
        { status: 400 }
      );
    }

    let startVerse: number;
    let endVerse: number;

    if (verseRange.includes("-")) {
      const [start, end] = verseRange.split("-");
      startVerse = parseInt(start, 10);
      endVerse = parseInt(end, 10);
    } else {
      startVerse = parseInt(verseRange, 10);
      endVerse = startVerse;
    }

    if (isNaN(startVerse) || isNaN(endVerse)) {
      return NextResponse.json(
        { error: "Invalid verse numbers" },
        { status: 400 }
      );
    }

    // Get translation ID based on language (correct IDs from quran.com)
    const translationIds: Record<string, number> = {
      en: 20,  // Saheeh International
      ur: 97,  // Urdu - Tafheem
      fr: 136, // French - Montada
      es: 140, // Spanish - Montada
      de: 27,  // German - Frank Bubenheim
      tr: 77,  // Turkish - Diyanet
      id: 33,  // Indonesian
      bn: 161, // Bengali - Taisirul
      hi: 122, // Hindi
      ar: 20,  // Use English for Arabic speakers viewing modal
    };

    const translationId = translationIds[lang] || translationIds.en;

    // Fetch chapter info to get verse count
    const chapterRes = await fetch(
      `https://api.quran.com/api/v4/chapters/${chapter}?language=en`,
      { headers: { Accept: "application/json" } }
    );
    
    let chapterNameArabic = "";
    let totalVerses = 0;
    let revelationPlace = "";
    
    if (chapterRes.ok) {
      const chapterData = await chapterRes.json();
      chapterNameArabic = chapterData?.chapter?.name_arabic || "";
      totalVerses = chapterData?.chapter?.verses_count || 0;
      revelationPlace = chapterData?.chapter?.revelation_place || "";
    }

    // Fetch ALL verses (Arabic text) from the chapter
    const versesRes = await fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${chapter}?fields=text_uthmani&per_page=${Math.max(totalVerses, 300)}`,
      { headers: { Accept: "application/json" } }
    );
    
    const versesData = versesRes.ok ? await versesRes.json() : { verses: [] };
    const fetchedVerses = versesData?.verses || [];

    // Fetch translations separately from the translations endpoint
    const translationsRes = await fetch(
      `https://api.quran.com/api/v4/quran/translations/${translationId}?chapter_number=${chapter}`,
      { headers: { Accept: "application/json" } }
    );
    
    const translationsData = translationsRes.ok ? await translationsRes.json() : { translations: [] };
    const fetchedTranslations = translationsData?.translations || [];

    // Merge verses with translations
    const verses: VerseData[] = [];
    for (let i = 0; i < fetchedVerses.length; i++) {
      const verse = fetchedVerses[i];
      const translationText = fetchedTranslations[i]?.text || "";
      // Clean HTML tags and footnotes from translation
      const cleanTranslation = translationText
        .replace(/<sup[^>]*>.*?<\/sup>/gi, "") // Remove footnote markers
        .replace(/<[^>]*>/g, "") // Remove other HTML tags
        .trim();
      
      verses.push({
        verseKey: verse.verse_key,
        verseNumber: verse.verse_number,
        arabicText: verse.text_uthmani || "",
        translation: cleanTranslation,
      });
    }

    const response: VerseResponse = {
      chapter,
      chapterName: CHAPTER_NAMES[chapter] || `Surah ${chapter}`,
      chapterNameArabic,
      verses,
      startVerse, // The verse(s) to highlight/scroll to
      endVerse,
      totalVerses,
      revelationPlace,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching verse:", error);
    return NextResponse.json(
      { error: "Failed to fetch verse data" },
      { status: 500 }
    );
  }
}

