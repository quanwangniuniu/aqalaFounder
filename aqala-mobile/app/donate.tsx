import { View, Text, Linking, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import WallpaperBackground from "@/components/WallpaperBackground";
import { usePreferences } from "@/contexts/PreferencesContext";

export default function DonateScreen() {
  const { getAccentColor } = usePreferences();
  const accent = getAccentColor();
  return (
    <WallpaperBackground edges={["top"]}>
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4" style={{ backgroundColor: `${accent.base}20` }}>
          <Text className="text-3xl">🤲</Text>
        </View>
        <Text className="text-white text-xl font-semibold mb-2">Support Aqala</Text>
        <Text className="text-white/50 text-sm text-center mb-6 leading-5">
          Your donation helps provide free access to Islamic knowledge and real-time translations worldwide.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL("https://aqala.io/donate")}
          className="px-6 py-3 rounded-xl mb-4"
          style={{ backgroundColor: accent.base }}
        >
          <Text className="text-white font-semibold text-base">Donate via Web</Text>
        </TouchableOpacity>
        <Link href="/(tabs)" asChild>
          <Text className="text-white/50 text-sm">Go back</Text>
        </Link>
      </View>
    </WallpaperBackground>
  );
}
