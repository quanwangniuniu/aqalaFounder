import { View, Text, Linking, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function SubscriptionScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#032117]" edges={["top"]}>
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 items-center justify-center mb-4">
          <Text className="text-3xl">✨</Text>
        </View>
        <Text className="text-white text-xl font-semibold mb-2">Go Premium</Text>
        <Text className="text-white/50 text-sm text-center mb-6 leading-5">
          Remove ads and enjoy an uninterrupted experience with Aqala Premium.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL("https://aqala.io/subscription")}
          className="bg-[#D4AF37] px-6 py-3 rounded-xl mb-4"
        >
          <Text className="text-[#032117] font-semibold text-base">View Plans</Text>
        </TouchableOpacity>
        <Link href="/(tabs)" asChild>
          <Text className="text-white/50 text-sm">Go back</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}
