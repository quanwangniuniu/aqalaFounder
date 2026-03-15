import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import WallpaperBackground from "@/components/WallpaperBackground";
import { WebView } from "react-native-webview";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { auth } from "@/lib/firebase/config";
import { Ionicons } from "@expo/vector-icons";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || "https://aqala.io";

export default function PastTranslationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getGradientColors } = usePreferences();
  const gradientColors = getGradientColors();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getToken = async () => {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setAuthToken(token);
        } catch {
          setAuthToken(null);
        }
      }
    };
    getToken();
  }, [user]);

  const preloadJS = `
    (function() {
      try {
        ${authToken ? `localStorage.setItem('firebase_auth_token', '${authToken}');` : ""}
      } catch(e) {}
    })();
    true;
  `;

  const url = id ? `${WEB_URL}/listen/past/${id}` : null;

  if (!url) {
    return (
      <WallpaperBackground edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white/80 text-center mb-4">Translation not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="px-5 py-2.5 rounded-full bg-[#D4AF37]"
          >
            <Text className="text-[#032117] font-semibold">Go back</Text>
          </TouchableOpacity>
        </View>
      </WallpaperBackground>
    );
  }

  return (
    <WallpaperBackground edges={["top", "bottom"]}>
      <View
        className="flex-row items-center px-4 py-3 border-b border-white/10"
        style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/10 items-center justify-center mr-3"
        >
          <Ionicons name="chevron-back" size={20} color="white" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-[#D4AF37]/20 items-center justify-center">
            <Ionicons name="document-text" size={16} color="#D4AF37" />
          </View>
          <Text className="text-white font-semibold text-base" numberOfLines={1}>
            Past Translation
          </Text>
        </View>
      </View>

      <View className="flex-1">
        {loading && (
          <View className="absolute inset-0 z-10 items-center justify-center">
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text className="text-white/60 text-sm mt-3">Loading...</Text>
          </View>
        )}
        <WebView
          source={{ uri: url }}
          style={{ flex: 1, backgroundColor: gradientColors[0] }}
          onLoadEnd={() => setLoading(false)}
          injectedJavaScriptBeforeContentLoaded={preloadJS}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    </WallpaperBackground>
  );
}
