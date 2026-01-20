"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { RoomsProvider } from "@/contexts/RoomsContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { OpenReplayProvider } from "./openreplay-provider";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <OpenReplayProvider>
          <RoomsProvider>{children}</RoomsProvider>
        </OpenReplayProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

