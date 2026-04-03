import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface VerseHighlightData {
  startWord: number;
  endWord: number;
  verseKey: string;
  verseReference: string;
  canonicalTranslation?: string;
  useLiveTranscript?: boolean;
}

export interface PastTranslation {
  id: string;
  userId: string;
  sourceText: string;
  translatedParagraphs: string[];
  verseReferences: (string | null)[];
  verseHighlights?: VerseHighlightData[];
  sourceLang: string;
  targetLang: string;
  createdAt: Date;
}

export async function savePastTranslation(
  userId: string,
  data: {
    sourceText: string;
    translatedParagraphs: string[];
    verseReferences?: (string | null)[];
    verseHighlights?: VerseHighlightData[];
    sourceLang: string;
    targetLang: string;
  }
): Promise<string> {
  const ref = await addDoc(
    collection(db, "users", userId, "pastTranslations"),
    {
      userId,
      sourceText: data.sourceText ?? "",
      translatedParagraphs: data.translatedParagraphs ?? [],
      verseReferences: data.verseReferences ?? [],
      verseHighlights: data.verseHighlights ?? [],
      sourceLang: data.sourceLang ?? "en",
      targetLang: data.targetLang ?? "en",
      createdAt: serverTimestamp(),
    }
  );
  return ref.id;
}

export async function getPastTranslation(
  userId: string,
  translationId: string
): Promise<PastTranslation | null> {
  const snap = await getDoc(
    doc(db, "users", userId, "pastTranslations", translationId)
  );
  if (!snap.exists()) return null;
  const raw = snap.data() as Record<string, unknown>;
  return {
    id: snap.id,
    userId: (raw.userId as string) ?? userId,
    sourceText: (raw.sourceText as string) ?? "",
    translatedParagraphs: (raw.translatedParagraphs as string[]) ?? [],
    verseReferences: (raw.verseReferences as (string | null)[]) ?? [],
    verseHighlights: (raw.verseHighlights as VerseHighlightData[]) ?? [],
    sourceLang: (raw.sourceLang as string) ?? "en",
    targetLang: (raw.targetLang as string) ?? "en",
    createdAt:
      (raw.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
  };
}

export async function deletePastTranslation(
  userId: string,
  translationId: string
): Promise<void> {
  await deleteDoc(
    doc(db, "users", userId, "pastTranslations", translationId)
  );
}

export function subscribePastTranslations(
  userId: string,
  onItems: (items: PastTranslation[]) => void,
  onError?: (err: unknown) => void,
  maxItems = 20
) {
  const q = query(
    collection(db, "users", userId, "pastTranslations"),
    orderBy("createdAt", "desc"),
    limit(maxItems)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: PastTranslation[] = snapshot.docs.map((d) => {
        const raw = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          userId: (raw.userId as string) ?? userId,
          sourceText: (raw.sourceText as string) ?? "",
          translatedParagraphs: (raw.translatedParagraphs as string[]) ?? [],
          verseReferences: (raw.verseReferences as (string | null)[]) ?? [],
          verseHighlights: (raw.verseHighlights as VerseHighlightData[]) ?? [],
          sourceLang: (raw.sourceLang as string) ?? "en",
          targetLang: (raw.targetLang as string) ?? "en",
          createdAt: (raw.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
        };
      });
      onItems(items);
    },
    (err) => onError?.(err)
  );
}
