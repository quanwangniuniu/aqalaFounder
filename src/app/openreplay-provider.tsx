"use client";

import React, { useEffect, useRef } from "react";
import Tracker from "@openreplay/tracker";
import { useAuth } from "@/contexts/AuthContext";

interface OpenReplayProviderProps {
  children: React.ReactNode;
}

export function OpenReplayProvider({ children }: OpenReplayProviderProps) {
  const { user } = useAuth();
  const trackerRef = useRef<Tracker | null>(null);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window === "undefined") {
      return;
    }

    const projectKey = process.env.NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY;

    // Skip initialization if project key is not provided
    if (!projectKey) {
      console.warn("OpenReplay: Project key not found. Session recording disabled.");
      return;
    }

    try {
      // Initialize tracker
      const tracker = new Tracker({
        projectKey,
      });

      // Start tracking
      tracker.start();

      trackerRef.current = tracker;

      // Cleanup function
      return () => {
        try {
          // OpenReplay doesn't have an explicit stop method, but we can clear the reference
          trackerRef.current = null;
        } catch (error) {
          console.error("OpenReplay cleanup error:", error);
        }
      };
    } catch (error) {
      console.error("OpenReplay initialization error:", error);
    }
  }, []);

  // Handle user identification
  useEffect(() => {
    const tracker = trackerRef.current;

    if (!tracker) {
      return;
    }

    try {
      if (user) {
        // Identify user with their ID and metadata
        tracker.setUserID(user.uid);

        // Set additional user metadata (setMetadata requires key and value)
        if (user.email) {
          tracker.setMetadata("email", user.email);
        }
        if (user.displayName) {
          tracker.setMetadata("displayName", user.displayName);
        }
      } else {
        // Clear user identification when logged out
        tracker.setUserID("");
      }
    } catch (error) {
      console.error("OpenReplay user identification error:", error);
    }
  }, [user]);

  return <>{children}</>;
}

