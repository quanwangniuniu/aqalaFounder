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
import { useSubscription } from "./SubscriptionContext";

let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;

try {
  const ads = require("react-native-google-mobile-ads");
  InterstitialAd = ads.InterstitialAd;
  AdEventType = ads.AdEventType;
  TestIds = ads.TestIds;
} catch {
  // Native module not available (e.g. running in Expo Go)
}

const adUnitId =
  !InterstitialAd || __DEV__
    ? TestIds?.INTERSTITIAL ?? "ca-app-pub-3940256099942544/1033173712"
    : Platform.select({
        ios:
          process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS ??
          TestIds?.INTERSTITIAL,
        android:
          process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID ??
          TestIds?.INTERSTITIAL,
      }) ?? TestIds?.INTERSTITIAL;

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
  const adRef = useRef<any>(null);
  const listenersRef = useRef<(() => void)[]>([]);

  const removeListeners = useCallback(() => {
    listenersRef.current.forEach((unsub) => unsub());
    listenersRef.current = [];
  }, []);

  const loadNewAd = useCallback(() => {
    if (!InterstitialAd || !AdEventType) return;

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
      (error: any) => {
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
    if (!showAds || !InterstitialAd) {
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
      if (!showAds || !InterstitialAd) {
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
