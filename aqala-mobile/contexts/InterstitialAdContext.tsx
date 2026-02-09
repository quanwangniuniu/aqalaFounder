import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useRouter } from "expo-router";
import { useSubscription } from "./SubscriptionContext";

interface InterstitialAdContextType {
  isAdVisible: boolean;
  pendingDestination: string | null;
  showAd: (destination: string) => void;
  closeAd: () => void;
  skipAd: () => void;
}

const InterstitialAdContext = createContext<InterstitialAdContextType | undefined>(undefined);

export const useInterstitialAd = () => {
  const context = useContext(InterstitialAdContext);
  if (context === undefined) {
    throw new Error("useInterstitialAd must be used within an InterstitialAdProvider");
  }
  return context;
};

interface InterstitialAdProviderProps {
  children: ReactNode;
}

export const InterstitialAdProvider: React.FC<InterstitialAdProviderProps> = ({ children }) => {
  const router = useRouter();
  const { showAds } = useSubscription();
  const [isAdVisible, setIsAdVisible] = useState(false);
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);

  const showAd = useCallback(
    (destination: string) => {
      // If user has premium, skip ad and navigate directly
      if (!showAds) {
        router.push(destination as any);
        return;
      }

      // Show the interstitial ad
      setPendingDestination(destination);
      setIsAdVisible(true);
    },
    [showAds, router]
  );

  const closeAd = useCallback(() => {
    setIsAdVisible(false);
    if (pendingDestination) {
      router.push(pendingDestination as any);
      setPendingDestination(null);
    }
  }, [pendingDestination, router]);

  const skipAd = useCallback(() => {
    setIsAdVisible(false);
    if (pendingDestination) {
      router.push(pendingDestination as any);
      setPendingDestination(null);
    }
  }, [pendingDestination, router]);

  const value: InterstitialAdContextType = {
    isAdVisible,
    pendingDestination,
    showAd,
    closeAd,
    skipAd,
  };

  return <InterstitialAdContext.Provider value={value}>{children}</InterstitialAdContext.Provider>;
};
