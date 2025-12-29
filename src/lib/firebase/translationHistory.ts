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
  setDoc,
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

// Live stream entry for real-time translation broadcasting (<1 second latency)
export interface LiveStreamEntry {
  // Current raw translation text (streamed in real-time)
  currentText: string;
  // Partial text still being transcribed
  partialText: string;
  // Source/reference text (original language)
  sourceText: string;
  sourcePartial: string;
  // Language info
  sourceLang: string;
  targetLang: string;
  // Translator info
  translatorId: string;
  sessionId: string;
  // Last update timestamp
  updatedAt: Date;
  // Is actively streaming
  isActive: boolean;
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

// ============================================
// Live Stream Functions (Real-time translation broadcast)
// ============================================

/**
 * Update the live stream with current translation state.
 * Called frequently (every ~300ms) to broadcast raw translations in real-time.
 */
export async function updateLiveStream(
  mosqueId: string,
  data: {
    currentText: string;
    partialText: string;
    sourceText: string;
    sourcePartial: string;
    sourceLang: string;
    targetLang: string;
    translatorId: string;
    sessionId: string;
    isActive: boolean;
  }
): Promise<void> {
  const firestore = ensureDb();
  const liveStreamRef = doc(firestore, COLLECTION, mosqueId, "liveStream", "current");
  await setDoc(liveStreamRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Subscribe to live stream updates for real-time translation viewing.
 * Updates come every ~300ms when a translator is actively streaming.
 */
export function subscribeLiveStream(
  mosqueId: string,
  onUpdate: (stream: LiveStreamEntry | null) => void,
  onError?: (err: any) => void
) {
  const firestore = ensureDb();
  const liveStreamRef = doc(firestore, COLLECTION, mosqueId, "liveStream", "current");
  return onSnapshot(
    liveStreamRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(null);
        return;
      }
      const data = snapshot.data() as any;
      onUpdate({
        currentText: data.currentText || "",
        partialText: data.partialText || "",
        sourceText: data.sourceText || "",
        sourcePartial: data.sourcePartial || "",
        sourceLang: data.sourceLang || "unknown",
        targetLang: data.targetLang || "unknown",
        translatorId: data.translatorId || "",
        sessionId: data.sessionId || "",
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
        isActive: data.isActive ?? false,
      });
    },
    (err) => onError?.(err)
  );
}

/**
 * Clear/deactivate the live stream when translator stops.
 */
export async function clearLiveStream(mosqueId: string): Promise<void> {
  const firestore = ensureDb();
  const liveStreamRef = doc(firestore, COLLECTION, mosqueId, "liveStream", "current");
  await setDoc(liveStreamRef, {
    isActive: false,
    currentText: "",
    partialText: "",
    sourceText: "",
    sourcePartial: "",
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

