import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createOrUpdateSubscriptionServer } from "@/lib/firebase/subscriptions-server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Handle ONE-TIME payment completion
        if (session.mode === "payment" && session.metadata?.userId) {
          const userId = session.metadata.userId;
          const paymentIntentId = session.payment_intent as string;

          // Get email from session or metadata
          const email = session.customer_email || session.metadata?.userEmail || null;
          const displayName = session.metadata?.userName || null;

          // Upgrade user to premium
          await createOrUpdateSubscriptionServer(userId, {
            email,
            displayName,
            stripeCustomerId: session.customer as string,
            stripePaymentId: paymentIntentId,
            plan: "premium",
            status: "active",
            purchasedAt: new Date(),
          });
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed", detail: error?.message },
      { status: 500 }
    );
  }
}
