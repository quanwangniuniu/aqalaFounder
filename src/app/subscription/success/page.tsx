"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const { refreshSubscription, isPremium } = useSubscription();
  const { user } = useAuth();
  const hasVerified = useRef(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyAndRefresh = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (!sessionId || !user?.uid || hasVerified.current) return;
      hasVerified.current = true;

      // If already premium, no need to verify
      if (isPremium) {
        setVerified(true);
        return;
      }

      setVerifying(true);
      
      try {
        // Verify payment directly with Stripe and update Firebase
        const response = await fetch("/api/subscriptions/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, userId: user.uid }),
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          // Refresh subscription context to reflect new status
          await refreshSubscription();
          setVerified(true);
        } else {
          console.error("Verification failed:", data.error);
          // Still try to refresh in case webhook worked
          await refreshSubscription();
        }
      } catch (error) {
        console.error("Verification error:", error);
        // Try refreshing anyway
        await refreshSubscription();
      } finally {
        setVerifying(false);
      }
    };

    verifyAndRefresh();
  }, [user?.uid, isPremium]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8">
      <div className="max-w-md w-full text-center">
        {/* Success animation */}
        <div className="mb-6 relative">
          <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto animate-[zoomIn95_0.5s_ease-out]">
            {verifying ? (
              <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-10 h-10 text-[#D4AF37]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          {/* Sparkles */}
          {!verifying && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none">
              <div className="absolute top-2 left-4 text-[#D4AF37] animate-pulse">✨</div>
              <div className="absolute top-4 right-4 text-[#D4AF37]/70 animate-pulse" style={{ animationDelay: "0.2s" }}>✨</div>
              <div className="absolute bottom-4 left-6 text-[#D4AF37]/50 animate-pulse" style={{ animationDelay: "0.4s" }}>✨</div>
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
          {verifying ? "Activating Premium..." : "Welcome to Premium! 🎉"}
        </h1>
        
        <p className="text-white/70 mb-2">
          {verifying 
            ? "Verifying your payment..." 
            : "Thank you for supporting Aqala's mission."}
        </p>
        
        {!verifying && (
          <p className="text-white/50 text-sm mb-8">
            Your ad-free experience is now active — forever.
          </p>
        )}

        {!verifying && (
          <div className="space-y-3">
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
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-white/70 hover:text-white transition-colors"
            >
              Return to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] px-4 py-8">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
