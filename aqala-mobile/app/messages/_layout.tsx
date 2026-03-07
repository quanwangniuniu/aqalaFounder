import { Stack } from "expo-router";
import { usePreferences } from "@/contexts/PreferencesContext";

export default function MessagesLayout() {
  const { getGradientColors } = usePreferences();
  const backgroundColor = getGradientColors()[0] ?? "#021a12";
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor },
      }}
    />
  );
}
