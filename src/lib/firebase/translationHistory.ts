import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./config";

const COLLECTION = "mosques";

export interface TranslationEntry {
  id: string;
  mosqueId: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date;
  translatorId: string;
  sessionId: string;
}

function ensureDb() {
  if (!db) {
    throw new Error("Firestore is not initialized on the server side.");
  }
  return db;
}

export async function saveTranslation(
  mosqueId: string,
  translationData: {
    sourceText: string;
    translatedText: string;
    sourceLang: string;
    targetLang: string;
    translatorId: string;
    sessionId: string;
  }
): Promise<void> {
  const firestore = ensureDb();
  await addDoc(collection(firestore, COLLECTION, mosqueId, "translations"), {
    sourceText: translationData.sourceText,
    translatedText: translationData.translatedText,
    sourceLang: translationData.sourceLang,
    targetLang: translationData.targetLang,
    translatorId: translationData.translatorId,
    sessionId: translationData.sessionId,
    timestamp: serverTimestamp(),
  });
}

export function subscribeTranslations(
  mosqueId: string,
  onTranslations: (translations: TranslationEntry[]) => void,
  onError?: (err: any) => void
) {
  const firestore = ensureDb();
  const translationsQuery = query(
    collection(firestore, COLLECTION, mosqueId, "translations"),
    orderBy("timestamp", "asc")
  );
  return onSnapshot(
    translationsQuery,
    (snapshot) => {
      const translations: TranslationEntry[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          mosqueId,
          sourceText: data.sourceText || "",
          translatedText: data.translatedText || "",
          sourceLang: data.sourceLang || "unknown",
          targetLang: data.targetLang || "unknown",
          timestamp: data.timestamp?.toDate?.() ?? new Date(),
          translatorId: data.translatorId || "",
          sessionId: data.sessionId || "",
        };
      });
      onTranslations(translations);
    },
    (err) => onError?.(err)
  );
}

export async function getTranslationHistory(mosqueId: string, limitCount?: number): Promise<TranslationEntry[]> {
  const firestore = ensureDb();
  let translationsQuery = query(
    collection(firestore, COLLECTION, mosqueId, "translations"),
    orderBy("timestamp", "desc")
  );
  if (limitCount) {
    translationsQuery = query(translationsQuery, limit(limitCount));
  }
  const snapshot = await getDocs(translationsQuery);
  return snapshot.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      mosqueId,
      sourceText: data.sourceText || "",
      translatedText: data.translatedText || "",
      sourceLang: data.sourceLang || "unknown",
      targetLang: data.targetLang || "unknown",
      timestamp: data.timestamp?.toDate?.() ?? new Date(),
      translatorId: data.translatorId || "",
      sessionId: data.sessionId || "",
    };
  });
}

export async function clearHistory(mosqueId: string, requesterId: string, roomOwnerId: string): Promise<void> {
  if (requesterId !== roomOwnerId) {
    throw new Error("Only the mosque owner can clear history");
  }
  const firestore = ensureDb();
  const translationsSnapshot = await getDocs(collection(firestore, COLLECTION, mosqueId, "translations"));
  const deletePromises = translationsSnapshot.docs.map((docSnapshot) =>
    deleteDoc(doc(firestore, COLLECTION, mosqueId, "translations", docSnapshot.id))
  );
  await Promise.all(deletePromises);
}

