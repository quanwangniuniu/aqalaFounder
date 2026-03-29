import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import WallpaperBackground from "@/components/WallpaperBackground";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useIAPContext } from "@/contexts/IAPContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { trackSubscribePremium } from "@/lib/analytics/track";
import { amountFromIapProduct, currencyFromIapProduct } from "@/lib/analytics/iapProduct";

const PREMIUM_SKU = "com.aqala.premium";

const FEATURES = [
  {
    icon: "ban-outline" as const,
    text: "Remove all ads forever",
    highlight: true,
  },
  { icon: "heart-outline" as const, text: "Support Aqala's mission" },
  {
    icon: "infinite-outline" as const,
    text: "One-time payment, no subscription",
  },
  { icon: "mic-outline" as const, text: "Full translation features" },
  { icon: "time-outline" as const, text: "Prayer times & Qibla" },
  { icon: "people-outline" as const, text: "Community rooms" },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { isPremium } = useSubscription();
  const { getAccentColor } = usePreferences();
  const accent = getAccentColor();
  const {
    premiumProduct,
    isPurchasing,
    isRestoring,
    isConnected,
    purchasePremium,
    restorePurchases,
    fetchError,
    retryFetchProducts,
  } = useIAPContext();

  const displayPrice = premiumProduct?.displayPrice;
  const productReady = isConnected && !!premiumProduct;

  const [showRetryUI, setShowRetryUI] = useState(false);
  useEffect(() => {
    if (!isConnected || premiumProduct) {
      setShowRetryUI(false);
      return;
    }
    const t = setTimeout(() => setShowRetryUI(true), 8000);
    return () => clearTimeout(t);
  }, [isConnected, premiumProduct]);

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
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${accent.base}30` },
            ]}
          >
            <Ionicons name="star" size={44} color={accent.base} />
          </View>
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
        <View className="items-center px-6 mt-8 mb-8">
          <View
            style={[
              styles.iconCircle,
              styles.iconCircleLarge,
              { backgroundColor: `${accent.base}25` },
            ]}
          >
            <Ionicons name="star" size={40} color={accent.base} />
          </View>
          <Text className="text-white text-3xl font-bold mb-2 text-center">
            Go Ad-Free
          </Text>
          <Text className="text-white/60 text-center text-base leading-6 max-w-[300px]">
            One purchase. No subscriptions. Ads gone forever.
          </Text>
        </View>

        {/* Features - clean card matching wallpaper */}
        <View className="px-5 mb-8" style={{ maxWidth: 400, alignSelf: "center", width: "100%" }}>
          <View className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            {FEATURES.map((feature, i) => (
              <View
                key={i}
                className={`flex-row items-center px-4 py-3.5 ${
                  i < FEATURES.length - 1 ? "border-b border-white/5" : ""
                }`}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <Ionicons
                    name={feature.icon}
                    size={20}
                    color="white"
                  />
                </View>
                <Text
                  className="flex-1 text-[15px] text-white"
                  style={{ fontWeight: feature.highlight ? "600" : "400" }}
                >
                  {feature.text}
                </Text>
                <Ionicons name="checkmark-circle" size={20} color="white" />
              </View>
            ))}
          </View>
        </View>

        {/* Price + CTA */}
        <View className="px-5" style={{ maxWidth: 400, alignSelf: "center", width: "100%" }}>
          <TouchableOpacity
            onPress={() => {
              const pid =
                (premiumProduct as { id?: string; productId?: string } | null)?.productId ||
                (premiumProduct as { id?: string; productId?: string } | null)?.id ||
                PREMIUM_SKU;
              void trackSubscribePremium({
                amount: amountFromIapProduct(premiumProduct),
                currency: currencyFromIapProduct(premiumProduct),
                product_id: pid,
                payment_method: Platform.OS === "ios" ? "apple" : "google",
                screen_name: "subscription",
              });
              purchasePremium();
            }}
            disabled={isPurchasing || !productReady}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[accent.base, accent.hover]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 20,
                paddingVertical: 20,
                alignItems: "center",
                opacity: isPurchasing || !productReady ? 0.6 : 1,
                shadowColor: accent.base,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              {isPurchasing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <View className="items-center">
                  <Text className="text-white text-xl font-bold">
                    {displayPrice
                      ? `Purchase for ${displayPrice}`
                      : "Loading price..."}
                  </Text>
                  <Text className="text-white/90 text-sm mt-1 font-medium">
                    One-time payment • Lifetime access
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {!isConnected && (
            <View className="mt-4 items-center">
              <ActivityIndicator size="small" color={accent.base} />
              <Text className="text-white/40 text-xs mt-2">
                Connecting to App Store...
              </Text>
            </View>
          )}

          {isConnected && !premiumProduct && !fetchError && !showRetryUI && (
            <View className="mt-4 items-center">
              <ActivityIndicator size="small" color={accent.base} />
              <Text className="text-white/40 text-xs mt-2">
                Loading product information...
              </Text>
            </View>
          )}

          {isConnected && !premiumProduct && (fetchError || showRetryUI) && (
            <View className="mt-4 items-center">
              <Text className="text-white/50 text-sm text-center px-4">
                Unable to load product. This can happen if the app or product
                is still being processed by App Store.
              </Text>
              <TouchableOpacity
                onPress={retryFetchProducts}
                style={{
                  marginTop: 16,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${accent.base}66`,
                }}
              >
                <Text
                  style={{ color: accent.base, fontWeight: "600", fontSize: 15 }}
                >
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={restorePurchases}
            disabled={isRestoring}
            className="mt-5 items-center py-3"
          >
            <Text className="text-white/50 text-sm">
              {isRestoring
                ? "Restoring purchases..."
                : "Already purchased? Tap to restore"}
            </Text>
          </TouchableOpacity>

          {/* Legal */}
          <Text className="text-white/25 text-[11px] text-center mt-6 leading-5 px-2">
            Payment will be charged to your Apple ID account at confirmation of
            purchase. This is a one-time non-consumable purchase. You can
            restore this purchase on any device signed in with the same Apple
            ID.
          </Text>
        </View>
      </ScrollView>
    </WallpaperBackground>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});
