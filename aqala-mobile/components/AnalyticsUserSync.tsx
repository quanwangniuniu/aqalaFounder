import { useEffect, useRef } from "react";
import Constants from "expo-constants";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getUserProfile } from "@/lib/firebase/users";
import { syncAnalyticsUser } from "@/lib/analytics/track";
import { getDeviceRegionCode } from "@/lib/analytics/deviceRegion";

/**
 * Keeps Firebase Analytics user id and user properties aligned with auth + subscription.
 */
export function AnalyticsUserSync() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const appVersion =
    Constants.expoConfig?.version ?? Constants.nativeApplicationVersion ?? null;
  const regionRef = useRef<string | null>(null);

  useEffect(() => {
    if (regionRef.current === null) {
      regionRef.current = getDeviceRegionCode();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!user?.uid) {
        await syncAnalyticsUser({
          firebaseUid: null,
          isPremium: false,
          signupDateIso: null,
          country: null,
          appVersion,
        });
        return;
      }

      const profile = await getUserProfile(user.uid);
      if (cancelled) return;

      const signupDateIso = profile?.createdAt
        ? profile.createdAt.toISOString().slice(0, 10)
        : null;

      await syncAnalyticsUser({
        firebaseUid: user.uid,
        isPremium,
        signupDateIso,
        country: regionRef.current,
        appVersion,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, isPremium, appVersion]);

  return null;
}
