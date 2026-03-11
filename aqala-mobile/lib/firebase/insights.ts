import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  limit,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./config";

export interface Insight {
  id: string;
  userId: string;
  dateKey: string;
  verseReference: string;
  verseKey: string;
  arabicText: string;
  translationText: string;
  reflection?: string;
  source?: string;
  createdAt: Date;
}

export async function saveInsight(
  userId: string,
  data: Omit<Insight, "id" | "userId" | "createdAt">
): Promise<string> {
  const payload: Record<string, unknown> = {
    userId,
    createdAt: serverTimestamp(),
    dateKey: data.dateKey ?? "",
    verseReference: data.verseReference ?? "",
    verseKey: data.verseKey ?? "",
    arabicText: data.arabicText ?? "",
    translationText: data.translationText ?? "",
  };
  if (data.reflection != null) payload.reflection = data.reflection;
  if (data.source != null) payload.source = data.source;

  const ref = await addDoc(collection(db, "users", userId, "insights"), payload);
  return ref.id;
}

export function subscribeInsights(
  userId: string,
  onInsights: (insights: Insight[]) => void,
  onError?: (err: any) => void,
  maxItems: number = 20
) {
  const q = query(
    collection(db, "users", userId, "insights"),
    orderBy("createdAt", "desc"),
    limit(maxItems)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const insights: Insight[] = snapshot.docs.map((d) => {
        const raw = d.data() as any;
        return {
          id: d.id,
          userId: raw.userId ?? userId,
          dateKey: raw.dateKey ?? "",
          verseReference: raw.verseReference ?? "",
          verseKey: raw.verseKey ?? "",
          arabicText: raw.arabicText ?? "",
          translationText: raw.translationText ?? "",
          reflection: raw.reflection,
          source: raw.source,
          createdAt: raw.createdAt?.toDate?.() ?? new Date(),
        };
      });
      onInsights(insights);
    },
    (err) => onError?.(err)
  );
}

export async function deleteInsight(
  userId: string,
  insightId: string
): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "insights", insightId));
}

export async function isInsightSaved(
  userId: string,
  verseKey: string,
  dateKey: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const q = query(
      collection(db, "users", userId, "insights"),
      where("verseKey", "==", verseKey),
      where("dateKey", "==", dateKey),
      limit(1)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        unsub();
        resolve(!snap.empty);
      },
      () => {
        resolve(false);
      }
    );
  });
}
