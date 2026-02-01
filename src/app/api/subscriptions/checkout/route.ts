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

    const { userId, userEmail } = await req.json();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user already has premium
    const existingSubscription = await getSubscriptionServer(userId);
    if (existingSubscription?.plan === "premium" && existingSubscription?.status === "active") {
      return NextResponse.json(
        { error: "You already have premium access!" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId: string;
    
    if (existingSubscription?.stripeCustomerId && existingSubscription.stripeCustomerId !== userId) {
      customerId = existingSubscription.stripeCustomerId;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail || undefined,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;

      // Store customer ID in Firestore
      await createOrUpdateSubscriptionServer(userId, {
        stripeCustomerId: customerId,
        stripePaymentId: null,
        plan: "free",
        status: "active",
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

    // Create ONE-TIME payment checkout session with inline price
    const session = await stripe.checkout.sessions.create({
      mode: "payment", // One-time payment, not subscription
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Aqala Premium - Ad-Free Forever",
              description: "One-time payment to remove all ads forever",
            },
            unit_amount: 1500, // $15.00 in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription`,
      metadata: {
        userId: userId,
        type: "premium_one_time",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session", detail: error?.message },
      { status: 500 }
    );
  }
}
