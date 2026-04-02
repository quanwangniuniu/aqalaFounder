"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { usePrivacyConsent } from "@/contexts/PrivacyConsentContext";
import {
  setWebAnalyticsCollectionEnabled,
  setWebAnalyticsUserId,
  setWebAnalyticsUserProperties,
} from "@/lib/firebase/analytics";
import { trackPageView } from "@/lib/analytics/track";

function stableUrl(pathname: string, searchParams: URLSearchParams | null): string {
  const qs = searchParams?.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function FirebaseAnalyticsClient() {
  const { consent } = usePrivacyConsent();
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const url = useMemo(() => stableUrl(pathname, searchParams), [pathname, searchParams]);

  // Avoid duplicate page_view in React Strict Mode dev remounts.
  const lastPageRef = useRef<string | null>(null);

  // Gate analytics collection based on consent.
  useEffect(() => {
    if (!consent.consentGiven) return;
    void setWebAnalyticsCollectionEnabled(!!consent.analytics);
  }, [consent.consentGiven, consent.analytics]);

  // Sync user identity + properties (best-effort).
  useEffect(() => {
    if (!consent.consentGiven || !consent.analytics) return;
    void setWebAnalyticsUserId(user?.uid ?? null);
    void setWebAnalyticsUserProperties({
      is_premium: user ? String(isPremium) : "",
    });
  }, [consent.consentGiven, consent.analytics, user?.uid, isPremium, user]);

  // Log page views on route change.
  useEffect(() => {
    if (!consent.consentGiven || !consent.analytics) return;
    if (!url) return;
    if (lastPageRef.current === url) return;
    lastPageRef.current = url;
    const title = typeof document !== "undefined" ? document.title : undefined;
    const referrer = typeof document !== "undefined" ? document.referrer : undefined;
    void trackPageView({ path: url, title, referrer });
  }, [consent.consentGiven, consent.analytics, url]);

  return null;
}

