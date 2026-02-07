import { getAdminFirestore } from "./admin";
import { Subscription, SubscriptionPlan, SubscriptionStatus } from "@/types/subscription";

const COLLECTION = "subscriptions";
const USERS_COLLECTION = "users";

export async function getSubscriptionServer(userId: string): Promise<Subscription | null> {
  const firestore = getAdminFirestore();
  const subscriptionDoc = await firestore.collection(COLLECTION).doc(userId).get();
  
  if (!subscriptionDoc.exists) {
    return null;
  }

  const data = subscriptionDoc.data()!;
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

export async function createOrUpdateSubscriptionServer(
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
  const firestore = getAdminFirestore();
  const subscriptionRef = firestore.collection(COLLECTION).doc(userId);
  
  const existingDoc = await subscriptionRef.get();
  const now = new Date();

  const updateData: any = {
    userId,
    email: subscriptionData.email || null,
    displayName: subscriptionData.displayName || null,
    ...subscriptionData,
    purchasedAt: subscriptionData.purchasedAt || null,
    updatedAt: now,
  };

  if (!existingDoc.exists) {
    updateData.createdAt = now;
    await subscriptionRef.set(updateData);
  } else {
    await subscriptionRef.update(updateData);
  }

  // Sync isPremium status to public user profile
  const isPremium = subscriptionData.plan === "premium" && subscriptionData.status === "active";
  const userRef = firestore.collection(USERS_COLLECTION).doc(userId);
  const userDoc = await userRef.get();
  if (userDoc.exists) {
    await userRef.update({ isPremium, updatedAt: now });
  }
}
