export type SubscriptionPlan = "free" | "premium" | "business";

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete"
  | "incomplete_expired";

export interface Subscription {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  price: number;
  priceId: string;
  currency: string;
  interval: "month" | "year";
  features: string[];
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    id: "free",
    name: "Aqala Free Plan",
    price: 0,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FREE || "",
    currency: "AUD",
    interval: "month",
    features: [
      "Basic translation features",
      "Limited usage",
      "Community support",
    ],
  },
  premium: {
    id: "premium",
    name: "Aqala Premium Plan",
    price: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM || "",
    currency: "AUD",
    interval: "month",
    features: [
      "Unlimited translations",
      "Priority support",
      "Advanced features",
      "Ad-free experience",
    ],
  },
  business: {
    id: "business",
    name: "Aqala Business Plan",
    price: 39,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS || "",
    currency: "AUD",
    interval: "month",
    features: [
      "All Premium features",
      "Team collaboration",
      "Business analytics",
      "Dedicated support",
    ],
  },
};
