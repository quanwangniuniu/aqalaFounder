"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PLAN_CONFIGS } from "@/types/subscription";

export default function ManageSubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, plan, refreshSubscription } = useSubscription();
  const router = useRouter();
  const [isCanceling, setIsCanceling] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent("/subscription/manage")}`);
    }
  }, [user, authLoading, router]);

  const handleCancel = async () => {
    if (!user) return;

    setIsCanceling(true);
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      await refreshSubscription();
      setShowCancelConfirm(false);
    } catch (error: any) {
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleResume = async () => {
    if (!user) return;

    setIsResuming(true);
    try {
      const response = await fetch("/api/subscriptions/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resume subscription");
      }

      await refreshSubscription();
    } catch (error: any) {
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsResuming(false);
    }
  };

  if (authLoading) {
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

  const planConfig = PLAN_CONFIGS[plan];
  const isCanceled = subscription?.cancelAtPeriodEnd || subscription?.status === "canceled";
  const currentPeriodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-68px)] px-4 py-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
            Manage Subscription
          </h1>
          <p className="text-gray-600">
            View and manage your subscription details
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Plan
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-medium text-gray-900">
                  {planConfig.name}
                </span>
                <span className="px-3 py-1 bg-[#10B981] text-white text-sm font-medium rounded-full">
                  {plan.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600">
                ${planConfig.price}/month
              </p>
            </div>

            {currentPeriodEnd && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Current Period Ends</p>
                <p className="text-base font-medium text-gray-900">
                  {currentPeriodEnd.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            {isCanceled && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-red-600 font-medium">
                  Your subscription will cancel at the end of the current billing period.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {plan !== "free" && (
          <div className="space-y-4">
            {!isCanceled ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cancel Subscription
                </h3>
                <p className="text-gray-600 mb-4">
                  Your subscription will remain active until the end of the current billing period.
                  You can resume it anytime before then.
                </p>
                {!showCancelConfirm ? (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-700 font-medium">
                      Are you sure you want to cancel your subscription?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        disabled={isCanceling}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCanceling ? "Canceling..." : "Yes, Cancel"}
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={isCanceling}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        No, Keep It
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Resume Subscription
                </h3>
                <p className="text-gray-600 mb-4">
                  Your subscription is scheduled to cancel. Click below to resume it.
                </p>
                <button
                  onClick={handleResume}
                  disabled={isResuming}
                  className="px-4 py-2 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResuming ? "Resuming..." : "Resume Subscription"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Change Plan */}
        <div className="mt-6 text-center">
          <Link
            href="/subscription"
            className="text-[#10B981] hover:text-[#059669] font-medium underline"
          >
            Change Plan
          </Link>
        </div>
      </div>
    </div>
  );
}
