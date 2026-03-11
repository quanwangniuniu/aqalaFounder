import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import WallpaperBackground from "@/components/WallpaperBackground";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useIAPContext } from "@/contexts/IAPContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

const FEATURES = [
  { icon: "ban-outline" as const, text: "Remove all ads forever", highlight: true },
  { icon: "heart-outline" as const, text: "Support Aqala's mission" },
  { icon: "infinite-outline" as const, text: "One-time payment, no subscription" },
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
      <WallpaperBackground edges={["top"]}>
        <View className="px-5 pt-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <LinearGradient
            colors={["#D4AF37", "#F5D76E"]}
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <Ionicons name="star" size={44} color="#032117" />
          </LinearGradient>
          <Text className="text-white text-3xl font-bold mb-3 text-center">
            You're Premium!
          </Text>
          <Text className="text-white/60 text-center text-base leading-6 max-w-[280px]">
            Thank you for supporting Aqala. Enjoy your ad-free experience.
          </Text>
        </View>
      </WallpaperBackground>
    );
  }

  return (
    <WallpaperBackground edges={["top"]}>
      <View className="px-5 pt-4 flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={restorePurchases}
          disabled={isRestoring}
          className="px-4 py-2 rounded-full bg-white/5"
        >
          <Text className="text-sm font-medium text-white/70">
            {isRestoring ? "Restoring..." : "Restore"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center px-6 mt-10 mb-10">
          <LinearGradient
            colors={["#D4AF37", "#F5D76E"]}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <Ionicons name="star" size={40} color="#032117" />
          </LinearGradient>
          <Text className="text-white text-4xl font-bold mb-3 text-center">
            Go Ad-Free
          </Text>
          <Text className="text-white/50 text-center text-base leading-6 max-w-[300px]">
            One purchase. No subscriptions.{"\n"}Ads gone forever.
          </Text>
        </View>

        {/* Features */}
        <View className="px-5 mb-10">
          <View className="bg-[#0a2a1f] rounded-3xl border border-[#D4AF37]/20 overflow-hidden">
            {FEATURES.map((feature, i) => (
              <View
                key={i}
                className={`flex-row items-center px-5 py-4 ${
                  i < FEATURES.length - 1 ? "border-b border-white/5" : ""
                }`}
              >
                <View 
                  className="w-11 h-11 rounded-2xl items-center justify-center mr-4"
                  style={{ 
                    backgroundColor: feature.highlight ? "#D4AF37" : "rgba(212, 175, 55, 0.15)" 
                  }}
                >
                  <Ionicons 
                    name={feature.icon} 
                    size={20} 
                    color={feature.highlight ? "#032117" : "#D4AF37"} 
                  />
                </View>
                <Text 
                  className="flex-1 text-[15px]"
                  style={{ 
                    color: feature.highlight ? "#fff" : "rgba(255,255,255,0.8)",
                    fontWeight: feature.highlight ? "600" : "400"
                  }}
                >
                  {feature.text}
                </Text>
                <View 
                  className="w-6 h-6 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(212, 175, 55, 0.2)" }}
                >
                  <Ionicons name="checkmark" size={14} color="#D4AF37" />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Price + CTA */}
        <View className="px-5">
          <TouchableOpacity
            onPress={purchasePremium}
            disabled={isPurchasing || !isConnected}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#D4AF37", "#c9a431"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 20,
                paddingVertical: 20,
                alignItems: "center",
                opacity: isPurchasing || !isConnected ? 0.6 : 1,
                shadowColor: "#D4AF37",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              {isPurchasing ? (
                <ActivityIndicator color="#032117" size="small" />
              ) : (
                <View className="items-center">
                  <Text className="text-[#032117] text-xl font-bold">
                    Purchase for {displayPrice}
                  </Text>
                  <Text className="text-[#032117]/70 text-sm mt-1 font-medium">
                    One-time payment • Lifetime access
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {!isConnected && (
            <View className="mt-4 items-center">
              <ActivityIndicator size="small" color="#D4AF37" />
              <Text className="text-white/40 text-xs mt-2">
                Connecting to App Store...
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={restorePurchases}
            disabled={isRestoring}
            className="mt-5 items-center py-3"
          >
            <Text className="text-white/50 text-sm">
              {isRestoring ? "Restoring purchases..." : "Already purchased? Tap to restore"}
            </Text>
          </TouchableOpacity>

          {/* Legal */}
          <Text className="text-white/25 text-[11px] text-center mt-6 leading-5 px-2">
            Payment will be charged to your Apple ID account at confirmation of
            purchase. This is a one-time non-consumable purchase. You can
            restore this purchase on any device signed in with the same Apple ID.
          </Text>
        </View>
      </ScrollView>
    </WallpaperBackground>
  );
}
