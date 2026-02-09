import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet, useWindowDimensions } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { usePreferences, WALLPAPERS, WallpaperId } from "@/contexts/PreferencesContext";
// getDarkestColor used for contrast text on gold buttons
import { useLanguage, LANGUAGE_OPTIONS, type LanguageOption } from "@/contexts/LanguageContext";
import { getUserInitials } from "@/utils/userDisplay";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle } from "react-native-svg";
import WallpaperBackground from "@/components/WallpaperBackground";

export default function SettingsScreen() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const { wallpaper, setWallpaper, getDarkestColor } = usePreferences();
  const darkBg = getDarkestColor();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  // Calculate wallpaper tile size: 3 columns with 12px gaps, 20px padding each side
  const containerWidth = Math.min(screenWidth - 40, 500 - 40); // account for p-5 padding
  const tileGap = 12;
  const tileWidth = (containerWidth - tileGap * 2) / 3;
  const tileHeight = tileWidth * 0.75; // 4:3 aspect ratio

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (authLoading) {
    return (
      <WallpaperBackground edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </WallpaperBackground>
    );
  }

  if (!user) {
    return (
      <WallpaperBackground edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-xl font-semibold mb-2">{t("settings.signInRequired")}</Text>
          <Text className="text-white/50 text-sm text-center mb-6">
            {t("settings.signInToAccess")}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            className="bg-[#D4AF37] rounded-xl py-3.5 px-8"
          >
            <Text style={{ color: darkBg }} className="font-semibold text-base">{t("home.signIn")}</Text>
          </TouchableOpacity>
        </View>
      </WallpaperBackground>
    );
  }

  return (
    <WallpaperBackground edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-6 border-b border-white/5">
        <View className="flex-row items-center gap-3" style={{ maxWidth: 500, alignSelf: 'center', width: '100%' }}>
          <Link href="/(tabs)" asChild>
            <TouchableOpacity className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
              <Ionicons name="chevron-back" size={18} color="white" />
            </TouchableOpacity>
          </Link>
          <Text className="text-xl font-semibold text-white">{t("settings.title")}</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-5 gap-8" style={{ maxWidth: 500, alignSelf: 'center', width: '100%' }}>
          {/* Profile Section */}
          <View>
            <Text className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
              {t("settings.profile")}
            </Text>
            <View className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <View className="flex-row items-center gap-4">
                <View className="relative">
                  {user.photoURL ? (
                    <Image
                      source={{ uri: user.photoURL }}
                      className="w-16 h-16 rounded-full"
                      style={{ width: 64, height: 64, borderRadius: 32 }}
                    />
                  ) : (
                    <LinearGradient
                      colors={["rgba(212, 175, 55, 0.2)", "rgba(212, 175, 55, 0.1)"]}
                      className="w-16 h-16 rounded-full items-center justify-center"
                      style={{ width: 64, height: 64, borderRadius: 32 }}
                    >
                      <Text className="text-[#D4AF37] text-xl font-semibold">
                        {getUserInitials(user)}
                      </Text>
                    </LinearGradient>
                  )}
                  {isPremium && (
                    <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D4AF37] rounded-full items-center justify-center" style={{ borderWidth: 2, borderColor: darkBg }}>
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={darkBg} strokeWidth={2.5}>
                        <Path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                  )}
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-lg font-medium text-white" numberOfLines={1}>
                    {user.displayName || "User"}
                  </Text>
                  <Text className="text-sm text-white/50" numberOfLines={1}>{user.email}</Text>
                  <Text className="text-xs mt-1">
                    {isPremium ? (
                      <Text className="text-[#D4AF37]">{t("settings.premiumMember")}</Text>
                    ) : (
                      <Text className="text-white/40">{t("settings.freePlan")}</Text>
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Language Section */}
          <View>
            <Text className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
              {t("settings.language")}
            </Text>
            <View className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <ScrollView className="max-h-48">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => setLanguage(lang.code)}
                    className={`flex-row items-center justify-between p-4 border-b border-white/5 ${
                      language === lang.code ? 'bg-[#D4AF37]/10' : ''
                    }`}
                  >
                    <Text className="text-white text-base">
                      {lang.flag} {lang.label} ({lang.nativeLabel})
                    </Text>
                    {language === lang.code && (
                      <Ionicons name="checkmark" size={20} color="#D4AF37" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Wallpaper Section */}
          <View>
            <Text className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
              {t("settings.wallpaper")}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: tileGap }}>
              {WALLPAPERS.map((wp) => (
                <TouchableOpacity
                  key={wp.id}
                  onPress={() => setWallpaper(wp.id)}
                  activeOpacity={0.7}
                  style={{
                    width: tileWidth,
                    height: tileHeight,
                    borderRadius: 12,
                    overflow: "hidden",
                    borderWidth: 2,
                    borderColor: wallpaper === wp.id ? "#D4AF37" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <LinearGradient
                    colors={[...wp.gradientColors]}
                    style={StyleSheet.absoluteFill}
                  />
                  
                  {/* Label */}
                  <View style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.8)",
                    padding: 6,
                  }}>
                    <Text style={{ fontSize: 10, fontWeight: "500", color: "rgba(255,255,255,0.9)" }}>
                      {wp.name}
                    </Text>
                  </View>
                  
                  {/* Selected checkmark */}
                  {wallpaper === wp.id && (
                    <View style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: "#D4AF37",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Ionicons name="checkmark" size={12} color={darkBg} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-xs text-white/40 mt-3">
              {t("settings.wallpaperHint")}
            </Text>
          </View>

          {/* Plan Section */}
          <View>
            <Text className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
              {t("settings.plan")}
            </Text>
            <View className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
              {isPremium ? (
                <View className="p-5">
                  <View className="flex-row items-center gap-3 mb-3">
                    <View className="w-10 h-10 rounded-full bg-[#D4AF37]/20 items-center justify-center">
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth={2}>
                        <Path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                    <View>
                      <Text className="font-medium text-white">{t("settings.premiumActive")}</Text>
                      <Text className="text-xs text-white/50">{t("settings.adFreeEnabled")}</Text>
                    </View>
                  </View>
                  <Link href="/subscription/manage" asChild>
                    <TouchableOpacity className="w-full items-center py-2.5 bg-white/5 rounded-xl">
                      <Text className="text-sm text-white/70">{t("settings.manageSubscription")}</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              ) : (
                <View className="p-5">
                  <View className="flex-row items-center gap-3 mb-4">
                    <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                      <Ionicons name="star-outline" size={20} color="rgba(255,255,255,0.5)" />
                    </View>
                    <View>
                      <Text className="font-medium text-white">{t("settings.freePlan")}</Text>
                      <Text className="text-xs text-white/50">{t("settings.upgradeToRemoveAds")}</Text>
                    </View>
                  </View>
                  <Link href="/subscription/index" asChild>
                    <TouchableOpacity>
                      <LinearGradient
                        colors={["#D4AF37", "#c9a431"]}
                        className="w-full items-center py-3 rounded-xl"
                      >
                        <Text style={{ color: darkBg }} className="text-sm font-semibold">
                          {t("settings.goAdFree")}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Link>
                </View>
              )}
            </View>
          </View>

          {/* Account Actions */}
          <View>
            <Text className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
              {t("settings.account")}
            </Text>
            <TouchableOpacity
              onPress={handleSignOut}
              className="flex-row items-center gap-3 w-full p-4 bg-white/5 rounded-xl border border-white/5"
            >
              <View className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center">
                <Ionicons name="log-out-outline" size={20} color="#f87171" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-white">{t("settings.signOut")}</Text>
                <Text className="text-xs text-white/50">{t("settings.signOutDesc")}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View className="items-center pt-4 pb-8">
            <Text className="text-2xl font-bold text-white/30 mb-2">AQALA</Text>
            <Text className="text-xs text-white/30">Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </WallpaperBackground>
  );
}
