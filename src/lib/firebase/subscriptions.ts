import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import { Subscription, SubscriptionPlan, SubscriptionStatus } from "@/types/subscription";

const COLLECTION = "subscriptions";

function ensureDb() {
  if (!db) {
    throw new Error("Firestore is not initialized on the server side.");
  }
  return db;
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const firestore = ensureDb();
  const subscriptionDoc = await getDoc(doc(firestore, COLLECTION, userId));
  
  if (!subscriptionDoc.exists()) {
    return null;
  }

  const data = subscriptionDoc.data();
  return {
    userId: data.userId,
    stripeCustomerId: data.stripeCustomerId,
    stripePaymentId: data.stripePaymentId || null,
    plan: data.plan || "free",
    status: data.status || "active",
    purchasedAt: data.purchasedAt?.toDate() || null,
    createdAt: data.createdAt?.toDate() || null,
    updatedAt: data.updatedAt?.toDate() || null,
  };
}

export async function createOrUpdateSubscription(
  userId: string,
  subscriptionData: {
    stripeCustomerId: string;
    stripePaymentId?: string | null;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    purchasedAt?: Date | null;
  }
): Promise<void> {
  const firestore = ensureDb();
  const subscriptionRef = doc(firestore, COLLECTION, userId);
  
  const existingDoc = await getDoc(subscriptionRef);
  const now = serverTimestamp();

  if (existingDoc.exists()) {
    await updateDoc(subscriptionRef, {
      ...subscriptionData,
      purchasedAt: subscriptionData.purchasedAt || null,
      updatedAt: now,
    });
  } else {
    await setDoc(subscriptionRef, {
      userId,
      ...subscriptionData,
      purchasedAt: subscriptionData.purchasedAt || null,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export function subscribeToSubscription(
  userId: string,
  onSubscription: (subscription: Subscription | null) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const firestore = ensureDb();
  const subscriptionRef = doc(firestore, COLLECTION, userId);

  return onSnapshot(
    subscriptionRef,
    (docSnapshot) => {
      if (!docSnapshot.exists()) {
        onSubscription(null);
        return;
      }

      const data = docSnapshot.data();
      onSubscription({
        userId: data.userId,
        stripeCustomerId: data.stripeCustomerId,
        stripePaymentId: data.stripePaymentId || null,
        plan: data.plan || "free",
        status: data.status || "active",
        purchasedAt: data.purchasedAt?.toDate() || null,
        createdAt: data.createdAt?.toDate() || null,
        updatedAt: data.updatedAt?.toDate() || null,
      });
    },
    (err) => {
      console.error("Error subscribing to subscription:", err);
      if (onError) {
        onError(err);
      }
    }
  );
}
