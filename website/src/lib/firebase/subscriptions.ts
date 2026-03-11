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
    email: data.email || null,
    displayName: data.displayName || null,
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
    email?: string | null;
    displayName?: string | null;
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
      email: subscriptionData.email || null,
      displayName: subscriptionData.displayName || null,
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
        email: data.email || null,
        displayName: data.displayName || null,
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
      // Silently handle permission errors - users may not have subscription documents
      const isPermissionError = err?.code === "permission-denied" ||
        err?.message?.includes("permission");
      if (!isPermissionError) {
        console.error("Error subscribing to subscription:", err);
      }
      if (onError) {
        onError(err);
      }
    }
  );
}
