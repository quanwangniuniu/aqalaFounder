import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function PrayerSettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#032117]" edges={["top"]}>
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 items-center justify-center mb-4">
          <Text className="text-3xl">⚙️</Text>
        </View>
        <Text className="text-white text-xl font-semibold mb-2">Prayer Settings</Text>
        <Text className="text-white/50 text-sm text-center mb-6 leading-5">
          Prayer times are calculated based on your location using standard calculation methods.
          Custom calculation method settings will be available in a future update.
        </Text>
        <Link href="/(tabs)/prayer" asChild>
          <Text className="text-[#D4AF37] text-sm">Back to Prayer Times</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}
