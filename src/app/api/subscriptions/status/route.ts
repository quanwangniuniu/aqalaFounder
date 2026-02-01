import { NextResponse } from "next/server";
import { getSubscriptionServer } from "@/lib/firebase/subscriptions-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const subscription = await getSubscriptionServer(userId);

    if (!subscription) {
      return NextResponse.json({
        isPremium: false,
        plan: "free",
        status: "active",
      });
    }

    return NextResponse.json({
      isPremium: subscription.plan === "premium" && subscription.status === "active",
      plan: subscription.plan,
      status: subscription.status,
      purchasedAt: subscription.purchasedAt?.toISOString() || null,
    });
  } catch (error: any) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check status", detail: error?.message },
      { status: 500 }
    );
  }
}
