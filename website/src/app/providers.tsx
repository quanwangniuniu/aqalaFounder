"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { RoomsProvider } from "@/contexts/RoomsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { PrayerProvider } from "@/contexts/PrayerContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { InterstitialAdProvider } from "@/contexts/InterstitialAdContext";
import { PrivacyConsentProvider } from "@/contexts/PrivacyConsentContext";
import { OpenReplayProvider } from "./openreplay-provider";
import LanguageSelectionModal from "@/components/LanguageSelectionModal";
import InterstitialAd from "@/components/InterstitialAd";
import ConsentBanner from "@/components/ConsentBanner";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <InterstitialAdProvider>
          <PreferencesProvider>
            <PrivacyConsentProvider>
              <LanguageProvider>
                <PrayerProvider>
                  <OpenReplayProvider>
                    <RoomsProvider>
                      {children}
                      <LanguageSelectionModal />
                      <InterstitialAd />
                      <ConsentBanner />
                    </RoomsProvider>
                  </OpenReplayProvider>
                </PrayerProvider>
              </LanguageProvider>
            </PrivacyConsentProvider>
          </PreferencesProvider>
        </InterstitialAdProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}
