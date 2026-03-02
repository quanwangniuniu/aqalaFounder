import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { PrayerProvider } from "@/contexts/PrayerContext";
import { RoomsProvider } from "@/contexts/RoomsContext";
import { InterstitialAdProvider } from "@/contexts/InterstitialAdContext";
import { IAPProvider } from "@/contexts/IAPContext";
import { PrivacyConsentProvider } from "@/contexts/PrivacyConsentContext";
import ConsentBanner from "@/components/ConsentBanner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import * as Location from "expo-location";
import { getRecordingPermissionsAsync } from "expo-audio";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { useFonts } from "expo-font";
import { Platform, View, Text } from "react-native";
import "../global.css";

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
        <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", padding: 32 }}>
          <Text style={{ color: "#ff4444", fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
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

export default function RootLayout() {
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const router = useRouter();

  // TODO: Add font files to assets/fonts/ directory
  // For now, using system fonts to allow app to run
  const [fontsLoaded] = useFonts({
    // "Amiri-Regular": require("../assets/fonts/Amiri-Regular.ttf"),
    // "Amiri-Bold": require("../assets/fonts/Amiri-Bold.ttf"),
    // "CormorantGaramond-Regular": require("../assets/fonts/CormorantGaramond-Regular.ttf"),
    // "CormorantGaramond-Bold": require("../assets/fonts/CormorantGaramond-Bold.ttf"),
  });

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

  // Request App Tracking Transparency permission (iOS only, required for AdMob)
  useEffect(() => {
    if (!onboardingChecked || needsOnboarding) return;
    if (Platform.OS === "ios") {
      (async () => {
        try {
          await requestTrackingPermissionsAsync();
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
                      <PrayerProvider>
                        <RoomsProvider>
                          <StatusBar style="light" />
                          <Stack
                            screenOptions={{
                              headerShown: false,
                              contentStyle: { backgroundColor: "#021a12" },
                              animation: "fade",
                            }}
                          >
                            <Stack.Screen name="onboarding" options={{ animation: "none" }} />
                            <Stack.Screen name="(tabs)" />
                            <Stack.Screen name="auth" />
                            <Stack.Screen name="messages" />
                            <Stack.Screen name="room/[roomId]" />
                            <Stack.Screen name="user/[userId]" />
                            <Stack.Screen name="privacy" />
                            <Stack.Screen name="terms" />
                            <Stack.Screen name="support" />
                          </Stack>
                          <ConsentBanner />
                        </RoomsProvider>
                      </PrayerProvider>
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
