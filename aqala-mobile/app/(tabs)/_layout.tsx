import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useLanguage } from "@/contexts/LanguageContext";

const TAB_BAR_ICON_SIZE = 20;

export default function TabsLayout() {
  const { getGradientColors, getAccentColor } = usePreferences();
  const { t } = useLanguage();
  const gradientColors = getGradientColors();
  const tabBarBg = gradientColors[0] ?? "#021a12";
  const accent = getAccentColor();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.55)",
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: "rgba(255,255,255,0.08)",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
      }}
    >
      {/* Primary tabs */}
      <Tabs.Screen
        name="listen"
        options={{
          title: t("nav.listen"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="headset-outline" size={TAB_BAR_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="surah-finder"
        options={{
          title: t("nav.surahFinder"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="radio-outline" size={TAB_BAR_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: t("nav.prayer"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="moon-outline" size={TAB_BAR_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: t("nav.qibla"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass-outline" size={TAB_BAR_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("nav.settings"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={TAB_BAR_ICON_SIZE} color={color} />
          ),
        }}
      />

      {/* Hidden tabs — kept for routing but removed from tab bar */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="rooms" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
