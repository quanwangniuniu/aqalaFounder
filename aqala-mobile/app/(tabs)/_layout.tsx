import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useLanguage } from "@/contexts/LanguageContext";

const ICON_SIZE = 20;

export default function TabsLayout() {
  const { getGradientColors } = usePreferences();
  const { t } = useLanguage();
  const gradientColors = getGradientColors();
  const tabBarBg = gradientColors[0] || "#021a12";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#D4AF37",
        tabBarInactiveTintColor: "rgba(255,255,255,0.35)",
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: "rgba(255,255,255,0.08)",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 80 : 58,
          paddingBottom: Platform.OS === "ios" ? 24 : 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.home"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="translate"
        options={{
          title: t("nav.translate"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="mic-outline" size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: t("nav.prayer"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="moon-outline" size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("nav.profile"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("nav.settings"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={ICON_SIZE} color={color} />
          ),
        }}
      />
      {/* Hidden tabs - still routable but not shown in tab bar */}
      <Tabs.Screen
        name="rooms"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
