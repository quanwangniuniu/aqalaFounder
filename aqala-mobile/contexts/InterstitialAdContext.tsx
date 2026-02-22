import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import { useSubscription } from "./SubscriptionContext";

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      ios:
        process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS ?? TestIds.INTERSTITIAL,
      android:
        process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID ??
        TestIds.INTERSTITIAL,
    }) ?? TestIds.INTERSTITIAL;

interface InterstitialAdContextType {
  showAdBeforeNavigation: (destination: string) => void;
  isAdLoaded: boolean;
}

const InterstitialAdContext = createContext<
  InterstitialAdContextType | undefined
>(undefined);

export const useInterstitialAd = () => {
  const ctx = useContext(InterstitialAdContext);
  if (!ctx)
    throw new Error(
      "useInterstitialAd must be used within InterstitialAdProvider"
    );
  return ctx;
};

export const InterstitialAdProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { showAds } = useSubscription();
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  const routerRef = useRef(router);
  routerRef.current = router;

  const pendingRef = useRef<string | null>(null);
  const adRef = useRef<InterstitialAd | null>(null);
  const listenersRef = useRef<(() => void)[]>([]);

  const removeListeners = useCallback(() => {
    listenersRef.current.forEach((unsub) => unsub());
    listenersRef.current = [];
  }, []);

  const loadNewAd = useCallback(() => {
    removeListeners();
    setIsAdLoaded(false);

    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setIsAdLoaded(true);
      }
    );

    const unsubClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setIsAdLoaded(false);
        if (pendingRef.current) {
          routerRef.current.push(pendingRef.current as any);
          pendingRef.current = null;
        }
        setTimeout(() => loadNewAd(), 500);
      }
    );

    const unsubError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.warn("Interstitial ad error:", error);
        setIsAdLoaded(false);
        if (pendingRef.current) {
          routerRef.current.push(pendingRef.current as any);
          pendingRef.current = null;
        }
      }
    );

    listenersRef.current = [unsubLoaded, unsubClosed, unsubError];
    adRef.current = interstitial;
    interstitial.load();
  }, [removeListeners]);

  useEffect(() => {
    if (!showAds) {
      removeListeners();
      adRef.current = null;
      setIsAdLoaded(false);
      return;
    }
    loadNewAd();
    return () => removeListeners();
  }, [showAds, loadNewAd, removeListeners]);

  const showAdBeforeNavigation = useCallback(
    (destination: string) => {
      if (!showAds) {
        router.push(destination as any);
        return;
      }

      if (isAdLoaded && adRef.current) {
        pendingRef.current = destination;
        adRef.current.show().catch(() => {
          pendingRef.current = null;
          router.push(destination as any);
        });
        return;
      }

      router.push(destination as any);
    },
    [showAds, isAdLoaded, router]
  );

  return (
    <InterstitialAdContext.Provider
      value={{ showAdBeforeNavigation, isAdLoaded }}
    >
      {children}
    </InterstitialAdContext.Provider>
  );
};
