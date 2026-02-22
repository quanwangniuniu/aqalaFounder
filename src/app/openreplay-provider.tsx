"use client";

import React, { useEffect, useRef } from "react";
import Tracker from "@openreplay/tracker";
import { useAuth } from "@/contexts/AuthContext";
import { usePrivacyConsent } from "@/contexts/PrivacyConsentContext";

interface OpenReplayProviderProps {
  children: React.ReactNode;
}

export function OpenReplayProvider({ children }: OpenReplayProviderProps) {
  const { user } = useAuth();
  const { consent } = usePrivacyConsent();
  const trackerRef = useRef<Tracker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only initialize if user has consented to session recording
    if (!consent.consentGiven || !consent.sessionRecording) {
      // If tracker was previously initialized but consent was revoked, clear it
      if (trackerRef.current) {
        trackerRef.current = null;
      }
      return;
    }

    const projectKey = process.env.NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY;

    if (!projectKey) {
      return;
    }

    // Don't re-initialize if already running
    if (trackerRef.current) return;

    try {
      const tracker = new Tracker({
        projectKey,
      });

      tracker.start();
      trackerRef.current = tracker;

      return () => {
        try {
          trackerRef.current = null;
        } catch (error) {
          console.error("OpenReplay cleanup error:", error);
        }
      };
    } catch (error) {
      console.error("OpenReplay initialization error:", error);
    }
  }, [consent.consentGiven, consent.sessionRecording]);

  // Handle user identification
  useEffect(() => {
    const tracker = trackerRef.current;

    if (!tracker) return;

    try {
      if (user) {
        tracker.setUserID(user.uid);

        if (user.email) {
          tracker.setMetadata("email", user.email);
        }
        if (user.displayName) {
          tracker.setMetadata("displayName", user.displayName);
        }
      } else {
        tracker.setUserID("");
      }
    } catch (error) {
      console.error("OpenReplay user identification error:", error);
    }
  }, [user]);

  return <>{children}</>;
}
