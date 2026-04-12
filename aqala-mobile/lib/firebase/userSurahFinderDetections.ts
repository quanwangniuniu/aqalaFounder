import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface SurahFinderDetection {
  id: string;
  userId: string;
  verseKey: string;
  reference: string;
  confidence: number;
  createdAt: Date;
}

export async function saveSurahFinderDetection(
  userId: string,
  data: {
    verseKey: string;
    reference: string;
    confidence: number;
  },
): Promise<string> {
  const ref = await addDoc(
    collection(db, "users", userId, "surahFinderDetections"),
    {
      userId,
      verseKey: data.verseKey ?? "",
      reference: data.reference ?? "",
      confidence: typeof data.confidence === "number" ? data.confidence : 0,
      createdAt: serverTimestamp(),
    },
  );
  return ref.id;
}

export function subscribeSurahFinderDetections(
  userId: string,
  onItems: (items: SurahFinderDetection[]) => void,
  onError?: (err: unknown) => void,
  maxItems = 25,
) {
  const q = query(
    collection(db, "users", userId, "surahFinderDetections"),
    orderBy("createdAt", "desc"),
    limit(maxItems),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: SurahFinderDetection[] = snapshot.docs.map((d) => {
        const raw = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          userId: (raw.userId as string) ?? userId,
          verseKey: (raw.verseKey as string) ?? "",
          reference: (raw.reference as string) ?? "",
          confidence: typeof raw.confidence === "number" ? raw.confidence : 0,
          createdAt:
            (raw.createdAt as { toDate?: () => Date })?.toDate?.() ??
            new Date(),
        };
      });
      onItems(items);
    },
    (err) => onError?.(err),
  );
}
