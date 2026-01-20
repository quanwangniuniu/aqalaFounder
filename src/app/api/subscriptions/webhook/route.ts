import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createOrUpdateSubscriptionServer } from "@/lib/firebase/subscriptions-server";

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
        if (session.mode === "subscription" && session.metadata?.userId) {
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;

          // Find plan by priceId
          const planId = PRICE_ID_TO_PLAN[priceId] || "free";

          await createOrUpdateSubscriptionServer(session.metadata.userId, {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscriptionId,
            plan: planId as "free" | "premium" | "business",
            status: subscription.status as any,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const userId = (customer as Stripe.Customer).metadata?.userId;

        if (userId) {
          const priceId = subscription.items.data[0]?.price.id;
          const planId = PRICE_ID_TO_PLAN[priceId] || "free";

          await createOrUpdateSubscriptionServer(userId, {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            plan: planId as "free" | "premium" | "business",
            status: subscription.status as any,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const userId = (customer as Stripe.Customer).metadata?.userId;

        if (userId) {
          await createOrUpdateSubscriptionServer(userId, {
            stripeCustomerId: customerId,
            stripeSubscriptionId: null,
            plan: "free",
            status: "canceled",
            cancelAtPeriodEnd: false,
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          const customerId = subscription.customer as string;
          const customer = await stripe.customers.retrieve(customerId);
          const userId = (customer as Stripe.Customer).metadata?.userId;

          if (userId) {
            const priceId = subscription.items.data[0]?.price.id;
            const planId = PRICE_ID_TO_PLAN[priceId] || "free";

            await createOrUpdateSubscriptionServer(userId, {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscription.id,
              plan: planId as "free" | "premium" | "business",
              status: subscription.status as any,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          const customerId = subscription.customer as string;
          const customer = await stripe.customers.retrieve(customerId);
          const userId = (customer as Stripe.Customer).metadata?.userId;

          if (userId) {
            const priceId = subscription.items.data[0]?.price.id;
            const planId = PRICE_ID_TO_PLAN[priceId] || "free";

            await createOrUpdateSubscriptionServer(userId, {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscription.id,
              plan: planId as "free" | "premium" | "business",
              status: subscription.status as any,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
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
