export type SubscriptionPlan = "free" | "premium";

export type SubscriptionStatus = "active" | "inactive";

export type PurchaseSource = "stripe" | "apple" | "google";

export interface Subscription {
  userId: string;
  email: string | null;
  displayName: string | null;
  stripeCustomerId: string;
  stripePaymentId: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  purchasedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  source?: PurchaseSource;
  appleTransactionId?: string | null;
  appleProductId?: string | null;
  googleOrderId?: string | null;
  googleProductId?: string | null;
}

export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  price: number;
  priceId: string;
  currency: string;
  isOneTime: boolean;
  features: string[];
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceId: "",
    currency: "USD",
    isOneTime: true,
    features: [
      "Full translation features",
      "Verse detection & references",
      "Prayer times",
      "Supported by ads",
    ],
  },
  premium: {
    id: "premium",
    name: "Ad-Free Forever",
    price: 15,
    priceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_ID_PREMIUM || "",
    currency: "USD",
    isOneTime: true,
    features: [
      "Everything in Free",
      "No ads, ever",
      "Support Aqala's mission",
      "One-time payment",
    ],
  },
};
