"use client";

import { useEffect, useRef } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";

type AdFormat = "auto" | "rectangle" | "horizontal" | "vertical";

interface AdBannerProps {
  adSlot?: string;
  adFormat?: AdFormat;
  className?: string;
  style?: React.CSSProperties;
  forceShow?: boolean; // Bypass showAds check
}

declare global {
  interface Window {
    adsbygoogle: object[];
  }
}

export default function AdBanner({
  adSlot = "8479808861", // Default Aqala Interstitial slot
  adFormat = "auto",
  className = "",
  style,
  forceShow = false,
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);
  const { showAds } = useSubscription();

  useEffect(() => {
    // Only push ad once per component mount
    if (isAdLoaded.current) return;
    if (!showAds && !forceShow) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        // Check if adsbygoogle is available
        if (typeof window !== "undefined" && window.adsbygoogle) {
          window.adsbygoogle.push({});
          isAdLoaded.current = true;
        }
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [showAds, forceShow]);

  // Don't render for premium users
  if (!showAds && !forceShow) {
    return null;
  }

  return (
    <div className={`ad-container overflow-hidden ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          ...style,
        }}
        data-ad-client="ca-pub-3882364799598893"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Smaller inline ad for content areas
export function InlineAd({ className = "" }: { className?: string }) {
  return (
    <AdBanner
      adFormat="rectangle"
      className={`my-6 ${className}`}
    />
  );
}

// Horizontal banner ad for between sections
export function BannerAd({ className = "" }: { className?: string }) {
  return (
    <AdBanner
      adFormat="horizontal"
      className={`my-4 ${className}`}
    />
  );
}

// Sticky bottom ad banner
export function StickyBottomAd({ className = "" }: { className?: string }) {
  const { showAds } = useSubscription();

  if (!showAds) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 bg-[#0a1f16]/95 backdrop-blur-sm border-t border-white/5 safe-area-inset-bottom ${className}`}>
      <div className="max-w-[554px] mx-auto">
        <AdBanner
          adFormat="horizontal"
          className="py-2"
          style={{ minHeight: "50px" }}
        />
      </div>
    </div>
  );
}
