import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useIAPContext } from "@/contexts/IAPContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

const FEATURES = [
  { icon: "ban-outline" as const, text: "Remove all ads forever" },
  { icon: "heart-outline" as const, text: "Support Aqala's mission" },
  { icon: "infinite-outline" as const, text: "One-time payment, not a subscription" },
  { icon: "mic-outline" as const, text: "Full translation features" },
  { icon: "time-outline" as const, text: "Prayer times & Qibla" },
  { icon: "people-outline" as const, text: "Community rooms" },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { isPremium } = useSubscription();
  const {
    premiumProduct,
    isPurchasing,
    isRestoring,
    isConnected,
    purchasePremium,
    restorePurchases,
  } = useIAPContext();

  const displayPrice = premiumProduct?.displayPrice || "$14.99";

  if (isPremium) {
    return (
      <SafeAreaView className="flex-1 bg-[#032117]" edges={["top"]}>
        <View className="px-4 pt-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-[#D4AF37]/20 items-center justify-center mb-6">
            <Text className="text-4xl">✨</Text>
          </View>
          <Text className="text-white text-2xl font-bold mb-2">
            You're Premium!
          </Text>
          <Text className="text-white/50 text-center text-sm leading-5">
            Thank you for supporting Aqala. You have an ad-free experience.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#032117]" edges={["top"]}>
      <View className="px-4 pt-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={restorePurchases}
          disabled={isRestoring}
        >
          <Text className="text-[#D4AF37] text-sm font-medium">
            {isRestoring ? "Restoring..." : "Restore"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center px-6 mt-8 mb-8">
          <View className="w-20 h-20 rounded-full bg-[#D4AF37]/15 items-center justify-center mb-5">
            <Ionicons name="star" size={36} color="#D4AF37" />
          </View>
          <Text className="text-white text-3xl font-bold mb-2">
            Go Ad-Free
          </Text>
          <Text className="text-white/50 text-center text-sm leading-5 max-w-[280px]">
            One purchase. No subscriptions. No recurring charges. Ads gone
            forever.
          </Text>
        </View>

        {/* Features */}
        <View className="px-6 mb-8">
          <View className="bg-white/5 rounded-2xl border border-white/8 p-5">
            {FEATURES.map((feature, i) => (
              <View
                key={i}
                className={`flex-row items-center gap-4 ${
                  i < FEATURES.length - 1 ? "mb-4" : ""
                }`}
              >
                <View className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 items-center justify-center">
                  <Ionicons name={feature.icon} size={18} color="#D4AF37" />
                </View>
                <Text className="text-white text-[15px] flex-1">
                  {feature.text}
                </Text>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#D4AF37"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Price + CTA */}
        <View className="px-6">
          <TouchableOpacity
            onPress={purchasePremium}
            disabled={isPurchasing || !isConnected}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#D4AF37", "#c9a431"]}
              style={{
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: "center",
                opacity: isPurchasing || !isConnected ? 0.6 : 1,
              }}
            >
              {isPurchasing ? (
                <ActivityIndicator color="#032117" />
              ) : (
                <View className="items-center">
                  <Text className="text-[#032117] text-lg font-bold">
                    Purchase for {displayPrice}
                  </Text>
                  <Text className="text-[#032117]/60 text-xs mt-0.5">
                    One-time payment
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {!isConnected && (
            <Text className="text-white/30 text-xs text-center mt-3">
              Connecting to store...
            </Text>
          )}

          <TouchableOpacity
            onPress={restorePurchases}
            disabled={isRestoring}
            className="mt-4 items-center"
          >
            <Text className="text-white/40 text-sm">
              {isRestoring ? "Restoring..." : "Already purchased? Restore"}
            </Text>
          </TouchableOpacity>

          {/* Legal */}
          <Text className="text-white/20 text-[10px] text-center mt-6 leading-4 px-4">
            Payment will be charged to your Apple ID account at confirmation of
            purchase. This is a one-time non-consumable purchase. You can
            restore this purchase on any device signed in with the same Apple
            ID.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
