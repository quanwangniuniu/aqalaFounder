"use client";

import { useState, useEffect } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface UpgradePromptProps {
  variant?: "banner" | "floating" | "inline";
  className?: string;
  showAfterMs?: number; // Delay before showing
}

export default function UpgradePrompt({ 
  variant = "floating", 
  className = "",
  showAfterMs = 0 
}: UpgradePromptProps) {
  const { showAds, isPremium } = useSubscription();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(showAfterMs === 0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (showAfterMs > 0) {
      const timer = setTimeout(() => setIsVisible(true), showAfterMs);
      return () => clearTimeout(timer);
    }
  }, [showAfterMs]);

  // Don't show if premium or dismissed
  if (isPremium || !showAds || isDismissed || !isVisible) return null;

  const href = user ? "/subscription" : "/auth/login?returnUrl=/subscription";

  if (variant === "banner") {
    return (
      <div className={`bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border-b border-[#D4AF37]/20 ${className}`}>
        <div className="max-w-[554px] mx-auto px-4 py-2 flex items-center justify-between">
          <p className="text-white/70 text-xs">
            <span className="text-[#D4AF37]">✨</span> Enjoying Aqala? Support our mission & go ad-free
          </p>
          <Link 
            href={href}
            className="text-[#D4AF37] text-xs font-medium hover:text-[#D4AF37]/80 transition-colors"
          >
            $15 one-time →
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <Link 
        href={href}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 transition-colors ${className}`}
      >
        <span className="text-[#D4AF37]">✨</span>
        <span className="text-white/70 text-sm">Go ad-free forever</span>
        <span className="text-[#D4AF37] text-sm font-medium ml-auto">$15</span>
      </Link>
    );
  }

  // Floating variant
  return (
    <div className={`fixed bottom-20 right-4 z-40 animate-[fadeInUp_0.5s_ease-out] ${className}`}>
      <div className="relative bg-[#032117] border border-[#D4AF37]/30 rounded-xl p-4 shadow-xl max-w-[280px]">
        {/* Dismiss button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-[#032117] border border-white/20 rounded-full flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-medium mb-1">Support Aqala</p>
            <p className="text-white/60 text-xs mb-3">Remove all ads forever with a one-time $15 payment.</p>
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] text-[#032117] text-xs font-semibold rounded-full hover:bg-[#D4AF37]/90 transition-colors"
            >
              Go Ad-Free
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
