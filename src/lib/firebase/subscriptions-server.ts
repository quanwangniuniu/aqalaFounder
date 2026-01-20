import { adminDb } from "./admin";
import { Subscription, SubscriptionPlan, SubscriptionStatus } from "@/types/subscription";

const COLLECTION = "subscriptions";

function ensureAdminDb() {
  if (!adminDb) {
    throw new Error("Firebase Admin is not initialized.");
  }
  return adminDb;
}

export async function getSubscriptionServer(userId: string): Promise<Subscription | null> {
  const firestore = ensureAdminDb();
  const subscriptionDoc = await firestore.collection(COLLECTION).doc(userId).get();
  
  if (!subscriptionDoc.exists) {
    return null;
  }

  const data = subscriptionDoc.data()!;
  return {
    userId: data.userId,
    stripeCustomerId: data.stripeCustomerId,
    stripeSubscriptionId: data.stripeSubscriptionId || null,
    plan: data.plan || "free",
    status: data.status || "active",
    currentPeriodEnd: data.currentPeriodEnd?.toDate() || null,
    cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
    createdAt: data.createdAt?.toDate() || null,
    updatedAt: data.updatedAt?.toDate() || null,
  };
}

export async function createOrUpdateSubscriptionServer(
  userId: string,
  subscriptionData: {
    stripeCustomerId: string;
    stripeSubscriptionId?: string | null;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
  }
): Promise<void> {
  const firestore = ensureAdminDb();
  const subscriptionRef = firestore.collection(COLLECTION).doc(userId);
  
  const existingDoc = await subscriptionRef.get();
  const now = new Date();

  const updateData: any = {
    userId,
    ...subscriptionData,
    currentPeriodEnd: subscriptionData.currentPeriodEnd || null,
    updatedAt: now,
  };

  if (!existingDoc.exists) {
    updateData.createdAt = now;
    await subscriptionRef.set(updateData);
  } else {
    await subscriptionRef.update(updateData);
  }
}
