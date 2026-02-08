"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PLAN_CONFIGS, SubscriptionPlan } from "@/types/subscription";

const REF_STORAGE_KEY = "aqala_invite_ref";

function SubscriptionPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { plan, loading: subscriptionLoading } = useSubscription();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  const [referrerId, setReferrerId] = useState<string | null>(null);

  // Read ref from URL and persist to sessionStorage for login redirect
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && typeof ref === "string") {
      setReferrerId(ref);
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(REF_STORAGE_KEY, ref);
      }
    } else if (typeof sessionStorage !== "undefined") {
      const stored = sessionStorage.getItem(REF_STORAGE_KEY);
      if (stored) setReferrerId(stored);
    }
  }, [searchParams]);

  // Clear stored ref after successful subscription
  useEffect(() => {
    if (plan === "premium" && typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(REF_STORAGE_KEY);
    }
  }, [plan]);

  // Derive returnUrl from URL/storage so redirect uses correct ref before state updates
  const refForRedirect =
    searchParams.get("ref") ||
    (typeof window !== "undefined" ? sessionStorage.getItem(REF_STORAGE_KEY) : null);
  const returnUrl = refForRedirect
    ? `/subscription?ref=${encodeURIComponent(refForRedirect)}`
    : "/subscription";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [user, authLoading, router, returnUrl]);

  const handleSubscribe = async (planId: SubscriptionPlan) => {
    if (!user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (planId === "free") {
      return;
    }

    const planConfig = PLAN_CONFIGS[planId];
    if (!planConfig.priceId) {
      alert("Price ID not configured for this plan");
      return;
    }

    setIsSubscribing(planId);

    try {
      const response = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
          priceId: planConfig.priceId,
          ...(referrerId && { referrerId }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else if (data.success && data.plan === "free") {
        // Free plan subscription completed
        router.push("/subscription/manage");
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      alert(error.message || "Something went wrong. Please try again.");
      setIsSubscribing(null);
    }
  };

  if (authLoading || subscriptionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8">
        <div className="relative mb-4">
          <div className="w-12 h-12 border-2 border-white/5 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-[#D4AF37] rounded-full animate-spin" />
        </div>
        <span className="text-white/40 text-sm">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-[calc(100vh-68px)] text-white">
      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
              <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-medium text-[#D4AF37]">Premium Available</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent mb-2">
            Choose Your Plan
          </h1>
          <p className="text-sm sm:text-base text-white/50">
            Select the plan that best fits your needs
          </p>
        </div>

        {/* Invite banner */}
        {referrerId && plan === "free" && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <path d="M12 8v13m0-13V6a2 2 0 1 1 2 2h-2zm0 0V5.5A2.5 2.5 0 1 0 9.5 8H12zm-7 4h14M5 12a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-emerald-400 font-semibold">
                You&apos;ve been invited — save $10 on Premium
              </p>
            </div>
            <p className="text-sm text-white/60">
              Pay only $5 instead of $15 for your first purchase
            </p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* Free Plan */}
          <div
            className={`relative rounded-2xl border p-6 transition-all ${
              plan === "free"
                ? "bg-white/[0.05] border-emerald-500/30"
                : "bg-white/[0.03] border-white/10 hover:border-white/20"
            }`}
          >
            {plan === "free" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                  Current Plan
                </span>
              </div>
            )}
            
            <div className="text-center mb-6 pt-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/60">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">
                {PLAN_CONFIGS.free.name}
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-sm text-white/40 ml-1">/forever</span>
              </div>
              <p className="text-xs text-white/40">No credit card required</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              {PLAN_CONFIGS.free.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/50">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/60">{feature}</span>
                </li>
              ))}
            </ul>
            
{plan === "free" && (
              <div className="w-full py-3 px-4 rounded-xl bg-white/5 text-white/30 text-center text-sm font-medium">
                Current Plan
              </div>
            )}
          </div>

          {/* Premium Plan */}
          <div
            className={`relative rounded-2xl border p-6 transition-all ${
              plan === "premium"
                ? "bg-gradient-to-br from-[#D4AF37]/15 to-[#D4AF37]/5 border-[#D4AF37]/40"
                : "bg-gradient-to-br from-[#D4AF37]/10 to-transparent border-[#D4AF37]/20 hover:border-[#D4AF37]/40"
            }`}
          >
            {plan === "premium" ? (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-[#D4AF37] text-[#0a1f16] text-xs font-semibold rounded-full">
                  Current Plan
                </span>
              </div>
            ) : (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#C49B30] text-[#0a1f16] text-xs font-semibold rounded-full">
                  Recommended
                </span>
              </div>
            )}
            
            <div className="text-center mb-6 pt-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#D4AF37]/20 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                  <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">
                {PLAN_CONFIGS.premium.name}
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-bold text-[#D4AF37]">
                  ${PLAN_CONFIGS.premium.price}
                </span>
                <span className="text-sm text-white/40 ml-1">one-time</span>
              </div>
              <p className="text-xs text-[#D4AF37]/70">Lifetime access</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              {PLAN_CONFIGS.premium.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/70">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleSubscribe("premium")}
              disabled={plan === "premium" || isSubscribing !== null}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                plan === "premium"
                  ? "bg-[#D4AF37]/20 text-[#D4AF37]/50 cursor-not-allowed"
                  : isSubscribing === "premium"
                  ? "bg-[#D4AF37] text-[#0a1f16] opacity-75 cursor-wait"
                  : "bg-gradient-to-r from-[#D4AF37] to-[#C49B30] hover:from-[#E0BC42] hover:to-[#D4AF37] text-[#0a1f16] shadow-lg shadow-[#D4AF37]/20 hover:shadow-xl hover:shadow-[#D4AF37]/30"
              }`}
            >
              {isSubscribing === "premium"
                ? "Processing..."
                : plan === "premium"
                ? "Current Plan"
                : "Get Premium"}
            </button>
          </div>
        </div>

        {/* Manage Plan Link */}
        {plan !== "free" && (
          <div className="text-center">
            <Link
              href="/subscription/manage"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Manage subscription
            </Link>
          </div>
        )}

        {/* Trust badges */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/30 text-xs">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Powered by Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>One-time payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8">
          <div className="relative mb-4">
            <div className="w-12 h-12 border-2 border-white/5 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-[#D4AF37] rounded-full animate-spin" />
          </div>
          <span className="text-white/40 text-sm">Loading...</span>
        </div>
      }
    >
      <SubscriptionPageContent />
    </Suspense>
  );
}
