"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PLAN_CONFIGS, SubscriptionPlan } from "@/types/subscription";

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const { plan, loading: subscriptionLoading } = useSubscription();
  const router = useRouter();
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent("/subscription")}`);
    }
  }, [user, authLoading, router]);

  const handleSubscribe = async (planId: SubscriptionPlan) => {
    if (!user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent("/subscription")}`);
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
          priceId: planConfig.priceId,
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
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-68px)] px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
            Choose Your Plan
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Select the plan that best fits your needs
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Free Plan */}
          <div
            className={`rounded-xl sm:rounded-2xl border-2 p-5 sm:p-6 ${
              plan === "free"
                ? "border-[#10B981] bg-[#10B981]/5"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="text-center mb-5 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {PLAN_CONFIGS.free.name}
              </h3>
              <div className="mb-3 sm:mb-4">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">$0</span>
                <span className="text-sm sm:text-base text-gray-600">/month</span>
              </div>
              {plan === "free" && (
                <span className="inline-block px-3 py-1 bg-[#10B981] text-white text-xs sm:text-sm font-medium rounded-full">
                  Current Plan
                </span>
              )}
            </div>
            <ul className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
              {PLAN_CONFIGS.free.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#10B981] mr-2 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe("free")}
              disabled={plan === "free" || isSubscribing !== null}
              className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                plan === "free"
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {plan === "free" ? "Current Plan" : "Select Free"}
            </button>
          </div>

          {/* Premium Plan */}
          <div
            className={`rounded-xl sm:rounded-2xl border-2 p-5 sm:p-6 ${
              plan === "premium"
                ? "border-[#10B981] bg-[#10B981]/5"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="text-center mb-5 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {PLAN_CONFIGS.premium.name}
              </h3>
              <div className="mb-3 sm:mb-4">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                  ${PLAN_CONFIGS.premium.price}
                </span>
                <span className="text-sm sm:text-base text-gray-600">/month</span>
              </div>
              {plan === "premium" && (
                <span className="inline-block px-3 py-1 bg-[#10B981] text-white text-xs sm:text-sm font-medium rounded-full">
                  Current Plan
                </span>
              )}
            </div>
            <ul className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
              {PLAN_CONFIGS.premium.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#10B981] mr-2 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe("premium")}
              disabled={plan === "premium" || isSubscribing !== null}
              className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                plan === "premium"
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : isSubscribing === "premium"
                  ? "bg-[#10B981] text-white opacity-75 cursor-wait"
                  : "bg-[#10B981] text-white hover:bg-[#059669]"
              }`}
            >
              {isSubscribing === "premium"
                ? "Processing..."
                : plan === "premium"
                ? "Current Plan"
                : "Subscribe"}
            </button>
          </div>

          {/* Business Plan */}
          <div
            className={`rounded-xl sm:rounded-2xl border-2 p-5 sm:p-6 ${
              plan === "business"
                ? "border-[#10B981] bg-[#10B981]/5"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="text-center mb-5 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {PLAN_CONFIGS.business.name}
              </h3>
              <div className="mb-3 sm:mb-4">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                  ${PLAN_CONFIGS.business.price}
                </span>
                <span className="text-sm sm:text-base text-gray-600">/month</span>
              </div>
              {plan === "business" && (
                <span className="inline-block px-3 py-1 bg-[#10B981] text-white text-xs sm:text-sm font-medium rounded-full">
                  Current Plan
                </span>
              )}
            </div>
            <ul className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
              {PLAN_CONFIGS.business.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#10B981] mr-2 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe("business")}
              disabled={plan === "business" || isSubscribing !== null}
              className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                plan === "business"
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : isSubscribing === "business"
                  ? "bg-[#10B981] text-white opacity-75 cursor-wait"
                  : "bg-[#10B981] text-white hover:bg-[#059669]"
              }`}
            >
              {isSubscribing === "business"
                ? "Processing..."
                : plan === "business"
                ? "Current Plan"
                : "Subscribe"}
            </button>
          </div>
        </div>

        {/* Manage Subscription Link */}
        {plan !== "free" && (
          <div className="text-center">
            <Link
              href="/subscription/manage"
              className="text-sm sm:text-base text-[#10B981] hover:text-[#059669] font-medium underline"
            >
              Manage your subscription
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
