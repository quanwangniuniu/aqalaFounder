import { NextResponse } from "next/server";
import { getSubscriptionServer } from "@/lib/firebase/subscriptions-server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const subscription = await getSubscriptionServer(userId);

    if (!subscription) {
      return NextResponse.json({
        plan: "free",
        status: "active",
      });
    }

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    });
  } catch (error: any) {
    console.error("Get subscription status error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status", detail: error?.message },
      { status: 500 }
    );
  }
}
