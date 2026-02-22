"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export interface ConsentPreferences {
  analytics: boolean;
  sessionRecording: boolean;
  consentGiven: boolean;
}

const DEFAULT_CONSENT: ConsentPreferences = {
  analytics: false,
  sessionRecording: false,
  consentGiven: false,
};

interface PrivacyConsentContextType {
  consent: ConsentPreferences;
  updateConsent: (prefs: Partial<ConsentPreferences>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  showBanner: boolean;
  setShowBanner: (show: boolean) => void;
}

const PrivacyConsentContext = createContext<PrivacyConsentContextType | undefined>(undefined);

export const usePrivacyConsent = () => {
  const context = useContext(PrivacyConsentContext);
  if (context === undefined) {
    throw new Error("usePrivacyConsent must be used within a PrivacyConsentProvider");
  }
  return context;
};

const STORAGE_KEY = "aqala_privacy_consent";

export const PrivacyConsentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [consent, setConsent] = useState<ConsentPreferences>(DEFAULT_CONSENT);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ConsentPreferences;
        setConsent(parsed);
        if (!parsed.consentGiven) {
          setShowBanner(true);
        }
      } else {
        setShowBanner(true);
      }
    } catch {
      setShowBanner(true);
    }
  }, []);

  const persistConsent = useCallback((prefs: ConsentPreferences) => {
    setConsent(prefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, []);

  const updateConsent = useCallback((partial: Partial<ConsentPreferences>) => {
    const updated = { ...consent, ...partial, consentGiven: true };
    persistConsent(updated);
    setShowBanner(false);
  }, [consent, persistConsent]);

  const acceptAll = useCallback(() => {
    persistConsent({ analytics: true, sessionRecording: true, consentGiven: true });
    setShowBanner(false);
  }, [persistConsent]);

  const rejectAll = useCallback(() => {
    persistConsent({ analytics: false, sessionRecording: false, consentGiven: true });
    setShowBanner(false);
  }, [persistConsent]);

  return (
    <PrivacyConsentContext.Provider
      value={{ consent, updateConsent, acceptAll, rejectAll, showBanner, setShowBanner }}
    >
      {children}
    </PrivacyConsentContext.Provider>
  );
};
