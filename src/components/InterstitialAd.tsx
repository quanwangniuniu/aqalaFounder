"use client";

import { useEffect, useState, useRef } from "react";
import { useInterstitialAd } from "@/contexts/InterstitialAdContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

declare global {
  interface Window {
    adsbygoogle: Array<object>;
  }
}

export default function InterstitialAd() {
  const { isAdVisible, closeAd, skipAd } = useInterstitialAd();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const adContainerRef = useRef<HTMLDivElement>(null);

  // Reset state and load ad when visible
  useEffect(() => {
    if (isAdVisible) {
      setCountdown(5);
      setCanSkip(false);
      setAdLoaded(false);

      // Load the ad
      try {
        if (typeof window !== "undefined" && window.adsbygoogle && adContainerRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          
          // Check if ad loaded after a delay
          setTimeout(() => {
            const iframe = adContainerRef.current?.querySelector('iframe');
            if (iframe && iframe.offsetHeight > 0) {
              setAdLoaded(true);
            }
          }, 2000);
        }
      } catch (error) {
        console.error("Error loading ad:", error);
      }
    }
  }, [isAdVisible]);

  // Countdown timer
  useEffect(() => {
    if (!isAdVisible) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAdVisible]);

  // Lock body scroll when ad is visible
  useEffect(() => {
    if (isAdVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAdVisible]);

  if (!isAdVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)`,
          }}
        />
      </div>

      {/* Close/Skip button */}
      <div className="absolute top-4 right-4 z-10">
        {canSkip ? (
          <button
            onClick={skipAd}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all"
          >
            <span>Continue</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 text-sm">
            <span>Skip in {countdown}s</span>
            <div className="relative w-5 h-5">
              <svg className="w-5 h-5 -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="opacity-20"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#D4AF37"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={62.83}
                  strokeDashoffset={62.83 * (1 - (5 - countdown) / 5)}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Ad content container */}
      <div className="relative w-full max-w-lg mx-4">
        {/* Ad label */}
        <div className="text-center mb-4">
          <span className="text-xs text-white/30 uppercase tracking-widest">Advertisement</span>
        </div>

        {/* Ad slot */}
        <div
          ref={adContainerRef}
          className="relative bg-gradient-to-br from-[#0a3d2a] to-[#032117] rounded-2xl border border-white/10 overflow-hidden min-h-[300px] flex items-center justify-center"
        >
          {/* Fallback content - hidden when ad loads */}
          <div 
            className={`absolute inset-0 flex flex-col items-center justify-center text-center px-6 py-8 transition-opacity duration-300 ${
              adLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {/* Animated pattern background */}
            <div className="absolute inset-0 opacity-20">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.4) 1px, transparent 0)`,
                  backgroundSize: "24px 24px",
                }}
              />
            </div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center mb-5 mx-auto shadow-lg shadow-[#D4AF37]/20 border border-[#D4AF37]/20">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Support Aqala&apos;s Mission</h3>
              <p className="text-white/60 text-sm max-w-xs mx-auto leading-relaxed">
                Aqala is free for everyone. Ads help us keep it that way while we build tools for the Muslim community.
              </p>
            </div>
          </div>

          {/* Google AdSense slot - Aqala Interstitial */}
          <ins
            className="adsbygoogle absolute inset-0 z-10 rounded-xl overflow-hidden"
            style={{ 
              display: "block", 
              width: "100%", 
              height: "100%",
              background: adLoaded ? "#f5f5f5" : "transparent"
            }}
            data-ad-client="ca-pub-3882364799598893"
            data-ad-slot="8479808861"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>

        {/* Upgrade CTA */}
        <div className="mt-6 text-center">
          <Link
            href={user ? "/subscription" : "/auth/login?returnUrl=/subscription"}
            onClick={closeAd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#b8944d] text-[#032117] font-semibold text-sm hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            Remove Ads Forever - $15
          </Link>
          <p className="text-white/30 text-xs mt-2">One-time payment, no subscription</p>
        </div>
      </div>
    </div>
  );
}
