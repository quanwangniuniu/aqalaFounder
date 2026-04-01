import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setNativeAnalyticsCollectionEnabled } from "@/lib/firebase/nativeAnalytics";

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

  /**
   * Apply native collection once we know consent — avoids racing
   * setNativeAnalyticsCollectionEnabled(false) on mount with a later true
   * from restored AsyncStorage (last native call could stay false → no events).
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(CONSENT_KEY);
        if (cancelled) return;
        if (stored) {
          const parsed = JSON.parse(stored) as ConsentState;
          setConsent(parsed);
          setShowBanner(false);
          await setNativeAnalyticsCollectionEnabled(parsed.analytics);
        } else {
          setShowBanner(true);
          // Release: no collection until user opts in. __DEV__: on so Firebase DebugView works while banner is visible.
          const enableUntilChoice = __DEV__;
          await setNativeAnalyticsCollectionEnabled(enableUntilChoice);
          if (__DEV__ && enableUntilChoice) {
            // eslint-disable-next-line no-console
            console.log(
              "[Aqala] DEV: Analytics collection ON until privacy choice (Reject / Save turns it off). DebugView needs -FIRAnalyticsDebugEnabled on scheme."
            );
          }
        }
      } catch {
        if (!cancelled) {
          setShowBanner(true);
          await setNativeAnalyticsCollectionEnabled(__DEV__);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistConsent = useCallback(async (state: ConsentState) => {
    setConsent(state);
    setShowBanner(false);
    await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify(state));
    await setNativeAnalyticsCollectionEnabled(state.analytics);
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
