"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PLAN_CONFIGS } from "@/types/subscription";

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, loading: subscriptionLoading, subscription } = useSubscription();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent("/subscription")}`);
    }
  }, [user, authLoading, router]);

  const handlePurchase = async () => {
    if (!user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent("/subscription")}`);
      return;
    }

    if (isPremium) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      alert(error.message || "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  if (authLoading || subscriptionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-68px)] px-4 sm:px-6 py-8">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
            {isPremium ? "You're Ad-Free! 🎉" : "Support Aqala"}
          </h1>
          <p className="text-white/60 text-sm sm:text-base">
            {isPremium 
              ? "Thank you for supporting our mission to bring Quranic translations to everyone."
              : "Remove all ads forever with a one-time payment of just $15."}
          </p>
        </div>

        {isPremium ? (
          /* Premium User View */
          <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#032117] rounded-full font-semibold text-sm mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Premium Member
            </div>
            <p className="text-white/70 text-sm mb-4">
              Purchased on {subscription?.purchasedAt?.toLocaleDateString() || "N/A"}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#D4AF37] text-sm hover:text-[#D4AF37]/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Home
            </Link>
          </div>
        ) : (
          /* Free User View */
          <>
            {/* Pricing Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-baseline justify-center gap-1 mb-6">
                <span className="text-5xl font-bold text-white">${PLAN_CONFIGS.premium.price}</span>
                <span className="text-white/50 text-lg">USD</span>
              </div>

              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-medium rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  One-time payment • Forever
                </span>
              </div>

              <ul className="space-y-3 mb-6">
                {PLAN_CONFIGS.premium.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/80 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-[#D4AF37] text-[#032117] font-semibold rounded-xl hover:bg-[#D4AF37]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#032117] border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Remove Ads Forever
                  </>
                )}
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 text-white/40 text-xs">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure checkout
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Powered by Stripe
              </div>
            </div>

            {/* Back link */}
            <div className="text-center mt-8">
              <Link
                href="/"
                className="text-white/50 text-sm hover:text-white/70 transition-colors"
              >
                Maybe later
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
