"use client";

import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface AdBannerProps {
  variant?: "small" | "medium" | "large";
  className?: string;
}

export default function AdBanner({ variant = "medium", className = "" }: AdBannerProps) {
  const { showAds } = useSubscription();
  const { user } = useAuth();

  // Don't show if user has premium
  if (!showAds) return null;

  const sizes = {
    small: "h-[50px]",
    medium: "h-[90px]",
    large: "h-[250px]",
  };

  return (
    <div className={`relative ${sizes[variant]} ${className}`}>
      {/* Ad placeholder - replace with actual ad network code */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)`
          }} />
        </div>
        
        {/* Ad content placeholder */}
        <div className="relative z-10 text-center px-4">
          <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Advertisement</p>
          
          {/* Upgrade prompt within ad space */}
          <Link 
            href={user ? "/subscription" : "/auth/login?returnUrl=/subscription"}
            className="inline-flex items-center gap-1.5 text-[#D4AF37]/70 hover:text-[#D4AF37] text-xs transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Remove ads for $15
          </Link>
        </div>
      </div>
    </div>
  );
}
