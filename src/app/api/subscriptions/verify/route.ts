import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createOrUpdateSubscriptionServer } from "@/lib/firebase/subscriptions-server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

// This endpoint verifies payment directly from Stripe and updates Firebase
// Useful when webhook doesn't fire properly
export async function POST(req: Request) {
  try {
    const { sessionId, userId } = await req.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: "Session ID and User ID are required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Verify payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed", status: session.payment_status },
        { status: 400 }
      );
    }

    // Verify the userId matches (security check)
    if (session.metadata?.userId !== userId) {
      return NextResponse.json(
        { error: "User ID mismatch" },
        { status: 403 }
      );
    }

    // Update Firebase with premium status
    await createOrUpdateSubscriptionServer(userId, {
      stripeCustomerId: session.customer as string,
      stripePaymentId: session.payment_intent as string,
      plan: "premium",
      status: "active",
      purchasedAt: new Date(),
    });

    console.log(`✅ Manually verified and upgraded user ${userId} to Premium!`);

    return NextResponse.json({
      success: true,
      message: "Subscription verified and activated",
      plan: "premium",
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Verification failed", detail: error?.message },
      { status: 500 }
    );
  }
}
