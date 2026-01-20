import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSubscriptionServer, createOrUpdateSubscriptionServer } from "@/lib/firebase/subscriptions-server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe secret key is not configured" },
        { status: 500 }
      );
    }

    const { userId } = await req.json();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const subscription = await getSubscriptionServer(userId);

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    // Cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update Firestore
    await createOrUpdateSubscriptionServer(userId, {
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: true,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription", detail: error?.message },
      { status: 500 }
    );
  }
}
