"use client";

import React, { useEffect, useRef } from "react";
import Tracker from "@openreplay/tracker";
import { useAuth } from "@/contexts/AuthContext";
import { usePrivacyConsent } from "@/contexts/PrivacyConsentContext";

interface OpenReplayProviderProps {
  children: React.ReactNode;
}

// Module-level singleton: OpenReplay allows only one tracker instance per page.
// Creating a second instance throws "one tracker instance has been initialised already".
let trackerInstance: Tracker | null = null;

export function OpenReplayProvider({ children }: OpenReplayProviderProps) {
  const { user } = useAuth();
  const { consent } = usePrivacyConsent();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only initialize if user has consented to session recording
    if (!consent.consentGiven || !consent.sessionRecording) {
      return;
    }

    const projectKey = process.env.NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY;

    if (!projectKey) {
      return;
    }

    try {
      // Create tracker only once (singleton) - avoids "one tracker instance" error
      if (!trackerInstance) {
        const isLocalhost =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";

        trackerInstance = new Tracker({
          projectKey,
          ...(isLocalhost && { __DISABLE_SECURE_MODE: true }),
        });
      }

      // Start only once per consent grant (avoids duplicate start on Strict Mode re-mount)
      if (!hasStartedRef.current) {
        trackerInstance.start();
        hasStartedRef.current = true;
      }
    } catch (error) {
      console.error("OpenReplay initialization error:", error);
    }
  }, [consent.consentGiven, consent.sessionRecording]);

  // Handle user identification
  useEffect(() => {
    if (!trackerInstance) return;

    try {
      if (user) {
        trackerInstance.setUserID(user.uid);

        if (user.email) {
          trackerInstance.setMetadata("email", user.email);
        }
        if (user.displayName) {
          trackerInstance.setMetadata("displayName", user.displayName);
        }
      } else {
        trackerInstance.setUserID("");
      }
    } catch (error) {
      console.error("OpenReplay user identification error:", error);
    }
  }, [user]);

  return <>{children}</>;
}
