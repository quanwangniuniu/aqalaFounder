import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function QiblaScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#032117]" edges={["top"]}>
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-white text-xl font-semibold mb-2">Qibla Compass</Text>
        <Text className="text-white/50 text-sm text-center mb-6">
          Coming soon – find the direction to Mecca
        </Text>
        <Link href="/(tabs)" asChild>
          <Text className="text-[#D4AF37]">Go back</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}
