"use client";

import { useInterstitialAd } from "@/contexts/InterstitialAdContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Link from "next/link";
import { ReactNode, MouseEvent } from "react";

interface AdLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  showAdOnClick?: boolean;
}

/**
 * A custom Link component that shows an interstitial ad before navigating.
 * - For premium users: navigates directly without showing ads
 * - For free users: shows a full-screen ad before navigating
 * 
 * Use `showAdOnClick={false}` to disable the ad for specific links (e.g., auth, subscription pages)
 */
export default function AdLink({ href, children, className = "", showAdOnClick = true }: AdLinkProps) {
  const { showAd } = useInterstitialAd();
  const { showAds } = useSubscription();

  // Pages that should never show interstitial ads
  const noAdPages = [
    "/auth",
    "/subscription",
    "/donate",
    "/account",
  ];

  const shouldShowAd = showAdOnClick && 
    showAds && 
    !noAdPages.some(page => href.startsWith(page));

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (shouldShowAd) {
      e.preventDefault();
      showAd(href);
    }
    // If not showing ad, let the default Link behavior handle navigation
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
