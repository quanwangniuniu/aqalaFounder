import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const CONSENT_KEY = "aqala_privacy_consent";

interface ConsentState {
  analytics: boolean;
  personalizedAds: boolean;
}

interface PrivacyConsentContextType {
  consent: ConsentState | null;
  showBanner: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  updateConsent: (update: Partial<ConsentState>) => void;
}

const PrivacyConsentContext = createContext<PrivacyConsentContextType | undefined>(undefined);

export function usePrivacyConsent() {
  const context = useContext(PrivacyConsentContext);
  if (!context) {
    throw new Error("usePrivacyConsent must be used within a PrivacyConsentProvider");
  }
  return context;
}

export function PrivacyConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(CONSENT_KEY);
      if (stored) {
        setConsent(JSON.parse(stored));
        setShowBanner(false);
      } else {
        setShowBanner(true);
      }
    })();
  }, []);

  const persistConsent = useCallback(async (state: ConsentState) => {
    setConsent(state);
    setShowBanner(false);
    await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  }, []);

  const acceptAll = useCallback(() => {
    persistConsent({ analytics: true, personalizedAds: true });
  }, [persistConsent]);

  const rejectAll = useCallback(() => {
    persistConsent({ analytics: false, personalizedAds: false });
  }, [persistConsent]);

  const updateConsent = useCallback(
    (update: Partial<ConsentState>) => {
      const newConsent: ConsentState = {
        analytics: update.analytics ?? consent?.analytics ?? false,
        personalizedAds: update.personalizedAds ?? consent?.personalizedAds ?? false,
      };
      persistConsent(newConsent);
    },
    [consent, persistConsent]
  );

  return (
    <PrivacyConsentContext.Provider
      value={{ consent, showBanner, acceptAll, rejectAll, updateConsent }}
    >
      {children}
    </PrivacyConsentContext.Provider>
  );
}
