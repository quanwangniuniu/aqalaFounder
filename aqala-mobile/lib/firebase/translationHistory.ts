import {
  addDoc, collection, deleteDoc, doc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, where,
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

export interface LiveStreamEntry {
  currentText: string;
  partialText: string;
  sourceText: string;
  sourcePartial: string;
  sourceLang: string;
  targetLang: string;
  translatorId: string;
  sessionId: string;
  updatedAt: Date;
  isActive: boolean;
}

export async function saveTranslation(
  mosqueId: string,
  translationData: { sourceText: string; translatedText: string; sourceLang: string; targetLang: string; translatorId: string; sessionId: string }
): Promise<void> {
  await addDoc(collection(db, COLLECTION, mosqueId, "translations"), { ...translationData, timestamp: serverTimestamp() });
}

export function subscribeTranslations(mosqueId: string, onTranslations: (translations: TranslationEntry[]) => void, onError?: (err: any) => void) {
  const translationsQuery = query(collection(db, COLLECTION, mosqueId, "translations"), orderBy("timestamp", "asc"));
  return onSnapshot(translationsQuery, (snapshot) => {
    const translations: TranslationEntry[] = snapshot.docs.map((d) => {
      const data = d.data() as any;
      return { id: d.id, mosqueId, sourceText: data.sourceText || "", translatedText: data.translatedText || "", sourceLang: data.sourceLang || "unknown", targetLang: data.targetLang || "unknown", timestamp: data.timestamp?.toDate?.() ?? new Date(), translatorId: data.translatorId || "", sessionId: data.sessionId || "" };
    });
    onTranslations(translations);
  }, (err) => onError?.(err));
}

export async function getTranslationHistory(mosqueId: string, limitCount?: number): Promise<TranslationEntry[]> {
  let translationsQuery = query(collection(db, COLLECTION, mosqueId, "translations"), orderBy("timestamp", "desc"));
  if (limitCount) translationsQuery = query(translationsQuery, limit(limitCount));
  const snapshot = await getDocs(translationsQuery);
  return snapshot.docs.map((d) => {
    const data = d.data() as any;
    return { id: d.id, mosqueId, sourceText: data.sourceText || "", translatedText: data.translatedText || "", sourceLang: data.sourceLang || "unknown", targetLang: data.targetLang || "unknown", timestamp: data.timestamp?.toDate?.() ?? new Date(), translatorId: data.translatorId || "", sessionId: data.sessionId || "" };
  });
}

export async function clearHistory(mosqueId: string, requesterId: string, roomOwnerId: string): Promise<void> {
  if (requesterId !== roomOwnerId) throw new Error("Only the mosque owner can clear history");
  const snapshot = await getDocs(collection(db, COLLECTION, mosqueId, "translations"));
  await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, COLLECTION, mosqueId, "translations", d.id))));
}

export async function updateLiveStream(
  mosqueId: string,
  data: { currentText: string; partialText: string; sourceText: string; sourcePartial: string; sourceLang: string; targetLang: string; translatorId: string; sessionId: string; isActive: boolean }
): Promise<void> {
  const liveStreamRef = doc(db, COLLECTION, mosqueId, "liveStream", "current");
  await setDoc(liveStreamRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export function subscribeLiveStream(mosqueId: string, onUpdate: (stream: LiveStreamEntry | null) => void, onError?: (err: any) => void) {
  const liveStreamRef = doc(db, COLLECTION, mosqueId, "liveStream", "current");
  return onSnapshot(liveStreamRef, (snapshot) => {
    if (!snapshot.exists()) { onUpdate(null); return; }
    const data = snapshot.data() as any;
    onUpdate({ currentText: data.currentText || "", partialText: data.partialText || "", sourceText: data.sourceText || "", sourcePartial: data.sourcePartial || "", sourceLang: data.sourceLang || "unknown", targetLang: data.targetLang || "unknown", translatorId: data.translatorId || "", sessionId: data.sessionId || "", updatedAt: data.updatedAt?.toDate?.() ?? new Date(), isActive: data.isActive ?? false });
  }, (err) => onError?.(err));
}

export async function clearLiveStream(mosqueId: string): Promise<void> {
  const liveStreamRef = doc(db, COLLECTION, mosqueId, "liveStream", "current");
  await setDoc(liveStreamRef, { isActive: false, currentText: "", partialText: "", sourceText: "", sourcePartial: "", updatedAt: serverTimestamp() }, { merge: true });
}
