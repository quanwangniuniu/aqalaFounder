import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSubscriptionServer, createOrUpdateSubscriptionServer } from "@/lib/firebase/subscriptions-server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

// Map price IDs to plan IDs (use server-side env vars)
const PRICE_ID_TO_PLAN: Record<string, "free" | "premium" | "business"> = {
  [process.env.STRIPE_PRICE_ID_FREE || ""]: "free",
  [process.env.STRIPE_PRICE_ID_PREMIUM || ""]: "premium",
  [process.env.STRIPE_PRICE_ID_BUSINESS || ""]: "business",
};

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe secret key is not configured" },
        { status: 500 }
      );
    }

    const { userId, priceId } = await req.json();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // Validate priceId matches one of our plans
    const planId = PRICE_ID_TO_PLAN[priceId];
    if (!planId) {
      return NextResponse.json(
        { error: "Invalid price ID" },
        { status: 400 }
      );
    }

    // Free plan doesn't need Stripe checkout
    if (planId === "free") {
      await createOrUpdateSubscriptionServer(userId, {
        stripeCustomerId: userId, // Use userId as placeholder for free plan
        stripeSubscriptionId: null,
        plan: "free",
        status: "active",
        cancelAtPeriodEnd: false,
      });
      return NextResponse.json({ success: true, plan: "free" });
    }

    // Get or create Stripe customer
    let customerId: string;
    const existingSubscription = await getSubscriptionServer(userId);
    
    if (existingSubscription?.stripeCustomerId && existingSubscription.stripeCustomerId !== userId) {
      customerId = existingSubscription.stripeCustomerId;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;

      // Store customer ID in Firestore
      await createOrUpdateSubscriptionServer(userId, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: null,
        plan: "free",
        status: "active",
        cancelAtPeriodEnd: false,
      });
    }

    // Get origin for redirect URLs
    let origin = req.headers.get("origin");
    if (!origin) {
      const referer = req.headers.get("referer");
      if (referer) {
        try {
          const url = new URL(referer);
          origin = `${url.protocol}//${url.host}`;
        } catch {
          // Invalid referer
        }
      }
    }
    origin = origin || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription`,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe subscription checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session", detail: error?.message },
      { status: 500 }
    );
  }
}
