"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { RoomsProvider } from "@/contexts/RoomsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { OpenReplayProvider } from "./openreplay-provider";
import LanguageSelectionModal from "@/components/LanguageSelectionModal";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <OpenReplayProvider>
          <RoomsProvider>
            {children}
            <LanguageSelectionModal />
          </RoomsProvider>
        </OpenReplayProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

