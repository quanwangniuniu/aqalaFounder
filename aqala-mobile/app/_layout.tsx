import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SonioxProvider } from "@soniox/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import {
  PreferencesProvider,
  usePreferences,
} from "@/contexts/PreferencesContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { PrayerProvider } from "@/contexts/PrayerContext";
import { RoomsProvider } from "@/contexts/RoomsContext";
import { InterstitialAdProvider } from "@/contexts/InterstitialAdContext";
import { IAPProvider } from "@/contexts/IAPContext";
import { PrivacyConsentProvider } from "@/contexts/PrivacyConsentContext";
import ConsentBanner from "@/components/ConsentBanner";
import { AppNavigationGate } from "@/components/AppNavigationGate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import * as Location from "expo-location";
import { getRecordingPermissionsAsync } from "expo-audio";
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from "expo-tracking-transparency";
import { Platform, View, Text } from "react-native";
import "../global.css";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || "https://aqala.io";
const DIRECT_SONIOX_KEY = process.env.EXPO_PUBLIC_SONIOX_API_KEY || "";

async function fetchSonioxApiKey(): Promise<string> {
  try {
    const res = await fetch(`${WEB_URL}/api/soniox-key`, { method: "POST" });
    if (res.ok) {
      const { api_key } = await res.json();
      if (api_key) return api_key;
    }
  } catch {}
  if (DIRECT_SONIOX_KEY) return DIRECT_SONIOX_KEY;
  throw new Error("No Soniox API key available");
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: "#000",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <Text
            style={{
              color: "#ff4444",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            App Error
          </Text>
          <Text style={{ color: "#fff", fontSize: 14 }}>
            {this.state.error.message}
          </Text>
          <Text style={{ color: "#888", fontSize: 11, marginTop: 12 }}>
            {this.state.error.stack?.slice(0, 500)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const ONBOARDING_KEY = "aqala_permissions_onboarded";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function ThemedStack() {
  const { getGradientColors } = usePreferences();
  const colors = getGradientColors();
  const backgroundColor = colors[0] ?? "#021a12";
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor },
        animation: "fade",
      }}
    >
      <Stack.Screen name="onboarding" options={{ animation: "none" }} />
      <Stack.Screen name="post-login-onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="live-listen" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="room/[roomId]" />
      <Stack.Screen name="user/[userId]" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="how-it-works" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="support" />
      <Stack.Screen name="insights" />
      <Stack.Screen name="past-translation/[id]" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="donate" />
    </Stack>
  );
}

export default function RootLayout() {
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const router = useRouter();

  // Check if onboarding is complete — also skip if permissions are already granted
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(ONBOARDING_KEY);

      if (stored === "true") {
        // Already onboarded
        setNeedsOnboarding(false);
      } else {
        // Check if permissions are already granted (e.g. user reinstalled or reset storage)
        try {
          const [locStatus, micStatus] = await Promise.all([
            Location.getForegroundPermissionsAsync(),
            getRecordingPermissionsAsync(),
          ]);

          const allGranted = locStatus.granted && micStatus.granted;
          if (allGranted) {
            // Permissions already granted — mark onboarding done, skip it
            await AsyncStorage.setItem(ONBOARDING_KEY, "true");
            setNeedsOnboarding(false);
          } else {
            setNeedsOnboarding(true);
          }
        } catch {
          // If permission check fails, show onboarding to be safe
          setNeedsOnboarding(true);
        }
      }

      setOnboardingChecked(true);
      SplashScreen.hideAsync();
    })();
  }, []);

  // Fallback ATT request for returning users who completed onboarding but were never prompted
  useEffect(() => {
    if (!onboardingChecked || needsOnboarding) return;
    if (Platform.OS === "ios") {
      (async () => {
        try {
          const { status } = await getTrackingPermissionsAsync();
          if (status === "undetermined") {
            await requestTrackingPermissionsAsync();
          }
        } catch {}
      })();
    }
  }, [onboardingChecked, needsOnboarding]);

  // Redirect to onboarding once if needed (after layout has mounted)
  useEffect(() => {
    if (!onboardingChecked || !needsOnboarding) return;
    router.replace("/onboarding");
  }, [onboardingChecked]);

  if (!onboardingChecked) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <IAPProvider>
                <InterstitialAdProvider>
                  <PreferencesProvider>
                    <PrivacyConsentProvider>
                      <LanguageProvider>
                        <SonioxProvider
                          apiKey={fetchSonioxApiKey}
                          permissions={null}
                        >
                          <PrayerProvider>
                            <RoomsProvider>
                              <StatusBar style="light" />
                              <AppNavigationGate>
                                <ThemedStack />
                              </AppNavigationGate>
                              <ConsentBanner />
                            </RoomsProvider>
                          </PrayerProvider>
                        </SonioxProvider>
                      </LanguageProvider>
                    </PrivacyConsentProvider>
                  </PreferencesProvider>
                </InterstitialAdProvider>
              </IAPProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
