import { useEffect } from "react";
import {
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

/**
 * After auth, require post-login questionnaire until `postLoginOnboardingComplete`.
 * Keeps permission onboarding and auth stacks reachable; clears post-login if signed out.
 */
export function AppNavigationGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!navState?.key) return;
    if (loading) return;

    const root = segments[0];
    const inAuthGroup = root === "auth";
    const inPermissionsOnboarding = root === "onboarding";
    const inPostLogin = root === "post-login-onboarding";

    if (!user) {
      if (inPostLogin) {
        router.replace("/auth/login");
      }
      return;
    }

    if (
      !user.postLoginOnboardingComplete &&
      !inPostLogin &&
      !inAuthGroup &&
      !inPermissionsOnboarding
    ) {
      router.replace("/post-login-onboarding");
      return;
    }

    if (user.postLoginOnboardingComplete && inPostLogin) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments, navState?.key, router]);

  return <>{children}</>;
}
