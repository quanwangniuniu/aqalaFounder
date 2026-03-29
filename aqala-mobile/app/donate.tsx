import { useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import WallpaperBackground from "@/components/WallpaperBackground";
import { usePreferences } from "@/contexts/PreferencesContext";
import { trackDonate, trackButtonClick } from "@/lib/analytics/track";

export default function DonateScreen() {
  const { getAccentColor } = usePreferences();
  const accent = getAccentColor();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      void trackDonate({
        amount: 0,
        currency: "USD",
        product_id: "",
        payment_method: "none",
        action: "view_screen",
      });
    }, [])
  );

  return (
    <WallpaperBackground edges={["top"]}>
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4" style={{ backgroundColor: `${accent.base}20` }}>
          <Text className="text-3xl">🤲</Text>
        </View>
        <Text className="text-white text-xl font-semibold mb-2">Support Aqala</Text>
        <Text className="text-white/50 text-sm text-center mb-6 leading-5">
          Your support helps provide free access to Islamic knowledge and real-time translations worldwide.
          Go ad-free with a one-time purchase.
        </Text>
        <TouchableOpacity
          onPress={() => {
            void trackButtonClick({
              element_name: "donate_go_ad_free",
              screen_name: "donate",
            });
            void trackDonate({
              amount: 0,
              currency: "USD",
              product_id: "com.aqala.premium",
              payment_method: "none",
              action: "cta_subscription",
            });
            router.replace("/subscription");
          }}
          className="px-6 py-3 rounded-xl mb-4"
          style={{ backgroundColor: accent.base }}
        >
          <Text className="text-white font-semibold text-base">Go Ad-Free</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white/50 text-sm">Go back</Text>
        </TouchableOpacity>
      </View>
    </WallpaperBackground>
  );
}
