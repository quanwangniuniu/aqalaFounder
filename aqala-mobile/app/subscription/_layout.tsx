import { Stack } from "expo-router";
import { usePreferences } from "@/contexts/PreferencesContext";

export default function SubscriptionLayout() {
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
      <Stack.Screen name="index" />
      <Stack.Screen name="manage" />
    </Stack>
  );
}
