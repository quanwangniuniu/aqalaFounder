"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSubscription } from "@/contexts/SubscriptionContext";

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSubscription } = useSubscription();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId && !hasRedirected.current) {
      hasRedirected.current = true;
      // Refresh subscription data (don't await - let it happen in background)
      refreshSubscription().catch(console.error);
      // Redirect to manage page after a brief delay
      const timeoutId = setTimeout(() => {
        router.replace("/subscription/manage");
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, []); // Empty deps - only run once on mount

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-[#10B981] mx-auto"
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
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">
          Subscription Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Your subscription has been activated. Redirecting to manage page...
        </p>
        <Link
          href="/subscription/manage"
          className="inline-block text-[#10B981] hover:text-[#059669] font-medium underline"
        >
          Go to subscription management
        </Link>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8">
        <div className="text-center text-gray-600">Loading...</div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
