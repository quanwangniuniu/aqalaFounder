import AsyncStorage from "@react-native-async-storage/async-storage";
import { getChapterName } from "./api";

export interface DailyTadabbur {
  dateKey: string;
  verseReference: string;
  verseKey: string;
  arabicText: string;
  translationText: string;
  chapterName: string;
}

const CACHE_KEY_PREFIX = "aqala_tadabbur_";

const TRANSLATION_RESOURCES: Record<string, number> = {
  en: 85,
  tr: 77,
  ur: 97,
  fr: 136,
  de: 27,
  es: 83,
  id: 33,
  ms: 39,
  bn: 120,
  hi: 122,
  ru: 79,
  nl: 144,
  it: 153,
  zh: 56,
  ja: 35,
  ko: 149,
  pt: 43,
};

const TADABBUR_VERSES = [
  "2:152", "2:155", "2:186", "2:216", "2:255", "2:286",
  "3:8", "3:26", "3:139", "3:159", "3:190", "3:191",
  "4:135", "5:32", "6:59", "6:162", "7:56", "8:46",
  "9:40", "9:51", "10:57", "10:62", "11:6", "12:64",
  "12:86", "12:87", "13:11", "13:28", "14:7", "14:34",
  "15:9", "16:96", "16:97", "17:23", "17:44", "17:82",
  "18:46", "18:109", "18:110", "19:96", "20:14", "20:82",
  "21:87", "22:78", "23:1", "23:115", "24:35", "25:63",
  "25:74", "26:80", "27:62", "28:77", "29:2", "29:45",
  "29:69", "30:21", "31:17", "31:18", "33:21", "33:41",
  "33:56", "35:28", "35:32", "36:82", "39:10", "39:53",
  "40:44", "40:60", "41:34", "42:19", "42:30", "42:43",
  "45:13", "47:7", "47:24", "49:10", "49:12", "49:13",
  "50:16", "51:56", "53:39", "55:13", "55:26", "55:60",
  "57:4", "57:20", "59:18", "59:22", "64:11", "65:2",
  "65:3", "66:8", "67:2", "73:8", "87:14", "93:5",
  "93:11", "94:5", "94:6", "96:1", "103:1", "112:1",
];

let memoryCache: Record<string, DailyTadabbur> = {};

function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getVerseForDate(dateKey: string): string {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const [y, m, d] = dateKey.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const dayOfYear = Math.floor(
    (target.getTime() - start.getTime()) / 86400000
  );
  return TADABBUR_VERSES[Math.abs(dayOfYear) % TADABBUR_VERSES.length];
}

function getTranslationResource(locale: string): number {
  const base = locale.split("-")[0].toLowerCase();
  return TRANSLATION_RESOURCES[base] ?? 85;
}

function parseVerseKey(key: string): { chapter: number; verse: number } {
  const [ch, v] = key.split(":").map(Number);
  return { chapter: ch, verse: v };
}

function buildReference(verseKey: string): string {
  const { chapter, verse } = parseVerseKey(verseKey);
  return `${getChapterName(chapter)} ${chapter}:${verse}`;
}

export async function getDailyTadabbur(
  date: Date,
  locale: string
): Promise<DailyTadabbur> {
  const dateKey = getDateKey(date);
  const cacheKey = `${dateKey}_${locale}`;

  if (memoryCache[cacheKey]) return memoryCache[cacheKey];

  try {
    const stored = await AsyncStorage.getItem(CACHE_KEY_PREFIX + cacheKey);
    if (stored) {
      const parsed: DailyTadabbur = JSON.parse(stored);
      memoryCache[cacheKey] = parsed;
      return parsed;
    }
  } catch {}

  const verseKey = getVerseForDate(dateKey);
  const resourceId = getTranslationResource(locale);
  const { chapter } = parseVerseKey(verseKey);
  const chapterName = getChapterName(chapter);

  const params = new URLSearchParams({
    translations: String(resourceId),
    language: locale.split("-")[0],
    fields: "text_uthmani",
  });

  const response = await fetch(
    `https://api.quran.com/api/v4/verses/by_key/${verseKey}?${params}`,
    { headers: { Accept: "application/json" } }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch verse ${verseKey}: ${response.status}`);
  }

  const data = await response.json();
  const verse = data?.verse;

  const arabicText: string = verse?.text_uthmani ?? "";
  const translation = verse?.translations?.[0];
  const rawTranslation: string = translation?.text ?? "";
  const translationText = rawTranslation.replace(/<[^>]*>/g, "");

  const result: DailyTadabbur = {
    dateKey,
    verseReference: buildReference(verseKey),
    verseKey,
    arabicText,
    translationText,
    chapterName,
  };

  memoryCache[cacheKey] = result;

  try {
    await AsyncStorage.setItem(
      CACHE_KEY_PREFIX + cacheKey,
      JSON.stringify(result)
    );
  } catch {}

  return result;
}
