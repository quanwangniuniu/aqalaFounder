"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { usePrivacyConsent } from "@/contexts/PrivacyConsentContext";
import {
  trackWebPrayerTimesStart,
  trackWebPrayerTimesEnd,
  trackWebQiblaStart,
  trackWebQiblaEnd,
  trackWebListeningStart,
  trackWebListeningEnd,
} from "@/lib/analytics/track";

type FeatureKey = "qibla" | "prayer_times" | "listening";

function featureForPathname(pathname: string): FeatureKey | null {
  if (
    pathname === "/qibla" ||
    pathname.startsWith("/qibla/") ||
    pathname === "/app/features/qibla" ||
    pathname.startsWith("/app/features/qibla/")
  ) {
    return "qibla";
  }
  if (
    pathname === "/app/prayer-times" ||
    pathname.startsWith("/app/prayer-times/") ||
    pathname === "/app/features/prayer-times" ||
    pathname.startsWith("/app/features/prayer-times/")
  ) {
    return "prayer_times";
  }
  if (pathname === "/listen" || pathname.startsWith("/listen/")) return "listening";
  return null;
}

function entrySource(searchParams: URLSearchParams): string {
  const v = searchParams.get("entry_source");
  return typeof v === "string" && v.length > 0 ? v : "direct";
}

const WEB_LISTEN_ROOM = "web_listen";
const WEB_LISTEN_CONTENT = "listen_page";

export function WebFeatureSessionTracker() {
  const { consent } = usePrivacyConsent();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const activeRef = useRef<FeatureKey | null>(null);
  const startedAtRef = useRef<number>(0);
  const sourceAtStartRef = useRef<string>("direct");

  useEffect(() => {
    const canTrack = consent.consentGiven && consent.analytics;
    const nextFeature = featureForPathname(pathname);

    const endActive = () => {
      const feat = activeRef.current;
      if (!feat || !startedAtRef.current) return;
      const duration_sec = Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000));
      const source = sourceAtStartRef.current;
      switch (feat) {
        case "qibla":
          void trackWebQiblaEnd({ source, duration_sec });
          break;
        case "prayer_times":
          void trackWebPrayerTimesEnd({ source, duration_sec });
          break;
        case "listening":
          void trackWebListeningEnd({
            room_id: WEB_LISTEN_ROOM,
            content_id: WEB_LISTEN_CONTENT,
            source,
            duration_sec,
          });
          break;
        default:
          break;
      }
      activeRef.current = null;
      startedAtRef.current = 0;
    };

    const start = (feat: FeatureKey) => {
      const source = entrySource(searchParamsRef.current);
      sourceAtStartRef.current = source;
      startedAtRef.current = Date.now();
      activeRef.current = feat;
      switch (feat) {
        case "qibla":
          void trackWebQiblaStart({ source });
          break;
        case "prayer_times":
          void trackWebPrayerTimesStart({ source });
          break;
        case "listening":
          void trackWebListeningStart({
            room_id: WEB_LISTEN_ROOM,
            content_id: WEB_LISTEN_CONTENT,
            source,
          });
          break;
        default:
          break;
      }
    };

    if (!canTrack) {
      endActive();
      return;
    }

    const prev = activeRef.current;
    if (prev !== nextFeature) {
      if (prev) endActive();
      if (nextFeature) start(nextFeature);
    }

    return () => {
      endActive();
    };
  }, [pathname, consent.consentGiven, consent.analytics]);

  return null;
}
