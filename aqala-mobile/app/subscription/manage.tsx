import { View, Text, TouchableOpacity, Linking, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function ManageSubscriptionScreen() {
  const router = useRouter();
  const { subscription, isPremium } = useSubscription();

  const openSubscriptionSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("https://apps.apple.com/account/subscriptions");
    } else {
      Linking.openURL(
        "https://play.google.com/store/account/subscriptions"
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#032117]" edges={["top"]}>
      <View className="px-4 pt-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 pt-8">
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-[#D4AF37]/15 items-center justify-center mb-5">
            <Ionicons
              name={isPremium ? "star" : "star-outline"}
              size={36}
              color="#D4AF37"
            />
          </View>
          <Text className="text-white text-2xl font-bold mb-2">
            {isPremium ? "Premium Active" : "Free Plan"}
          </Text>
          <Text className="text-white/50 text-center text-sm">
            {isPremium
              ? "You have a lifetime ad-free experience."
              : "Upgrade to remove ads forever."}
          </Text>
        </View>

        {isPremium && subscription?.source && (
          <View className="bg-white/5 rounded-2xl border border-white/8 p-5 mb-4">
            <View className="flex-row items-center gap-3 mb-3">
              <Ionicons name="receipt-outline" size={20} color="#D4AF37" />
              <Text className="text-white font-medium">Purchase Details</Text>
            </View>
            <Text className="text-white/50 text-sm">
              Purchased via{" "}
              {subscription.source === "apple"
                ? "Apple App Store"
                : subscription.source === "google"
                ? "Google Play"
                : "Web"}
            </Text>
            {subscription.purchasedAt && (
              <Text className="text-white/40 text-xs mt-1">
                {subscription.purchasedAt.toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {isPremium && (
          <TouchableOpacity
            onPress={openSubscriptionSettings}
            className="bg-white/5 rounded-2xl border border-white/8 p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name="settings-outline"
                size={20}
                color="rgba(255,255,255,0.6)"
              />
              <Text className="text-white/70 text-sm">
                {Platform.OS === "ios"
                  ? "Apple Subscription Settings"
                  : "Google Play Settings"}
              </Text>
            </View>
            <Ionicons
              name="open-outline"
              size={16}
              color="rgba(255,255,255,0.4)"
            />
          </TouchableOpacity>
        )}

        {!isPremium && (
          <TouchableOpacity
            onPress={() => router.replace("/subscription")}
            className="bg-[#D4AF37] rounded-2xl py-4 items-center"
          >
            <Text className="text-[#032117] font-bold text-base">
              Go Ad-Free Forever
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
