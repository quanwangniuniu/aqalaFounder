import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import * as Location from "expo-location";
import { getRecordingPermissionsAsync } from "expo-audio";
import { useFonts } from "expo-font";
import "../global.css";

const ONBOARDING_KEY = "aqala_permissions_onboarded";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const router = useRouter();
  const segments = useSegments();

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

  // Redirect to onboarding if needed (after layout has mounted)
  useEffect(() => {
    if (!onboardingChecked) return;
    
    const currentRoute = segments[0];
    if (needsOnboarding && currentRoute !== "onboarding") {
      router.replace("/onboarding");
    }
  }, [onboardingChecked, needsOnboarding, segments]);

  if (!onboardingChecked) {
    return null; // Keep splash screen visible
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <InterstitialAdProvider>
              <PreferencesProvider>
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
                      </Stack>
                    </RoomsProvider>
                  </PrayerProvider>
                </LanguageProvider>
              </PreferencesProvider>
            </InterstitialAdProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
