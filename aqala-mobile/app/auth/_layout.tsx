import { Stack } from "expo-router";
import { usePreferences } from "@/contexts/PreferencesContext";

export default function AuthLayout() {
  const { getGradientColors } = usePreferences();
  const backgroundColor = getGradientColors()[0] ?? "#021a12";
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
