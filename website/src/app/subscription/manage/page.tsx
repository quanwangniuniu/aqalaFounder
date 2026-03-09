"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PLAN_CONFIGS } from "@/types/subscription";

export default function ManageSubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const { plan } = useSubscription();
  const router = useRouter();
  const [inviteCopied, setInviteCopied] = useState(false);

  const inviteLink =
    typeof window !== "undefined" && user
      ? `${window.location.origin}/subscription?ref=${user.uid}`
      : "";

  const handleCopyInviteLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    } catch {
      alert("Failed to copy link");
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent("/subscription/manage")}`);
    }
  }, [user, authLoading, router]);

  if (authLoading) {
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

  const planConfig = PLAN_CONFIGS[plan];

  return (
    <div className="min-h-[calc(100vh-68px)] text-white">
      <div className="max-w-2xl mx-auto px-5 py-8">
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
            Manage Subscription
          </h1>
          <p className="text-sm text-white/50">
            View and manage your plan
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="rounded-2xl border p-6 mb-6 bg-gradient-to-br from-[#D4AF37]/10 to-transparent border-[#D4AF37]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
                <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Current Plan</h2>
              <p className="text-xs text-white/40">Your active subscription</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <p className="text-lg font-semibold text-white">{planConfig.name}</p>
              <p className="text-sm text-white/50">
                {planConfig.price === 0 ? "Free forever" : `$${planConfig.price} one-time`}
              </p>
            </div>
            <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${
              plan === "premium" 
                ? "bg-[#D4AF37]/20 text-[#D4AF37]" 
                : "bg-white/10 text-white/70"
            }`}>
              {plan.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Invite Friends - Premium only */}
        {plan === "premium" && (
          <div className="rounded-2xl border p-6 mb-6 bg-white/[0.03] border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Invite Friends</h3>
                <p className="text-xs text-white/40">They save $10 on Premium</p>
              </div>
            </div>
            
            <p className="text-sm text-white/60 mb-4">
              Share your invite link. When friends upgrade for the first time, they&apos;ll pay only $5 instead of $15.
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 px-4 py-2.5 text-sm border rounded-xl bg-white/5 border-white/10 text-white/70 focus:outline-none focus:border-white/20"
              />
              <button
                onClick={handleCopyInviteLink}
                className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors shrink-0 text-sm"
              >
                {inviteCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="rounded-2xl border p-6 mb-6 bg-white/[0.03] border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Your Benefits</h3>
          <ul className="space-y-3">
            {planConfig.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm text-white/70">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* View / Upgrade Plans */}
        <div className="text-center">
          <Link
            href="/subscription"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all ${
              plan === "free"
                ? "bg-gradient-to-r from-[#D4AF37] to-[#C49B30] hover:from-[#E0BC42] hover:to-[#D4AF37] text-[#0a1f16]"
                : "bg-white/10 hover:bg-white/15 text-white"
            }`}
          >
            {plan === "free" ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Upgrade to Premium
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                View Plans
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
