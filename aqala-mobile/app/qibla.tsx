import { View, Text, Linking, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function QiblaScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#032117]" edges={["top"]}>
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 items-center justify-center mb-4">
          <Text className="text-3xl">🕋</Text>
        </View>
        <Text className="text-white text-xl font-semibold mb-2">Qibla Direction</Text>
        <Text className="text-white/50 text-sm text-center mb-6 leading-5">
          Find the direction to Mecca from your current location using the Qibla compass.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL("https://aqala.io/qibla")}
          className="bg-[#D4AF37] px-6 py-3 rounded-xl mb-4"
        >
          <Text className="text-[#032117] font-semibold text-base">Open Qibla Compass</Text>
        </TouchableOpacity>
        <Link href="/(tabs)" asChild>
          <Text className="text-white/50 text-sm">Go back</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}
