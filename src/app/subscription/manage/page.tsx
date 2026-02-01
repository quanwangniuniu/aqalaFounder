"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function ManageSubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, subscription, loading: subscriptionLoading } = useSubscription();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent("/subscription/manage")}`);
    }
  }, [user, authLoading, router]);

  if (authLoading || subscriptionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If not premium, redirect to subscription page
  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8">
        <div className="max-w-md w-full text-center">
          <p className="text-white/60 mb-6">You don't have an active premium membership.</p>
          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#032117] font-semibold rounded-xl hover:bg-[#D4AF37]/90 transition-colors"
          >
            Get Premium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-68px)] px-4 py-8">
      <div className="max-w-md mx-auto w-full">
        {/* Premium Status Card */}
        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-6 text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-semibold text-white mb-2">
            Premium Member ✨
          </h1>
          
          <p className="text-white/60 text-sm mb-4">
            Thank you for supporting Aqala's mission to bring Quranic translations to everyone.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#032117] rounded-full font-semibold text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Ad-Free Forever
          </div>
        </div>

        {/* Purchase Details */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <h2 className="text-white/80 font-medium mb-3">Purchase Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Status</span>
              <span className="text-[#D4AF37]">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Plan</span>
              <span className="text-white/80">Ad-Free Premium</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Amount</span>
              <span className="text-white/80">$15 (one-time)</span>
            </div>
            {subscription?.purchasedAt && (
              <div className="flex justify-between">
                <span className="text-white/50">Purchased</span>
                <span className="text-white/80">
                  {new Date(subscription.purchasedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-3">
          <Link
            href="/listen"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#032117] font-semibold rounded-xl hover:bg-[#D4AF37]/90 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z"
                fill="currentColor"
              />
              <path
                d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z"
                fill="currentColor"
              />
            </svg>
            Start Listening
          </Link>
          
          <Link
            href="/"
            className="block text-white/50 hover:text-white/70 text-sm transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
