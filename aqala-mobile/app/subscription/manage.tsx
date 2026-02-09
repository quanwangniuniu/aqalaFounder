import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function SubscriptionManageScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#032117]" edges={["top"]}>
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-white text-xl font-semibold mb-2">Manage Subscription</Text>
        <Text className="text-white/50 text-sm text-center mb-6">
          Coming soon – manage your premium subscription
        </Text>
        <Link href="/(tabs)/settings" asChild>
          <Text className="text-[#D4AF37]">Go back</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}
