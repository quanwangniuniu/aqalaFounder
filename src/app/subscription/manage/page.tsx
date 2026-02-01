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

  return (
    <div className="flex flex-col min-h-[calc(100vh-68px)] px-4 py-8">
      <div className="max-w-2xl mx-auto w-full">
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
                {planConfig.price === 0 ? "$0" : `$${planConfig.price} one-time`}
              </p>
            </div>
          </div>
        </div>

        {/* Invite Friends - Premium only */}
        {plan === "premium" && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Invite friends, they save $10
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Share your invite link. When friends upgrade for the first time, they&apos;ll pay only $5 instead of $15.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
              />
              <button
                onClick={handleCopyInviteLink}
                className="px-4 py-2 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors shrink-0"
              >
                {inviteCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* View / Upgrade Plans */}
        <div className="mt-6 text-center">
          <Link
            href="/subscription"
            className="text-[#10B981] hover:text-[#059669] font-medium underline"
          >
            {plan === "free" ? "Upgrade" : "View plans"}
          </Link>
        </div>
      </div>
    </div>
  );
}
