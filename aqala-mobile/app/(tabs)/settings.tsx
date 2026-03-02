import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Switch, Alert, Linking, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { usePreferences, WALLPAPERS, WallpaperId } from "@/contexts/PreferencesContext";
import { useLanguage, LANGUAGE_OPTIONS } from "@/contexts/LanguageContext";
import { usePrivacyConsent } from "@/contexts/PrivacyConsentContext";
import { getUserInitials } from "@/utils/userDisplay";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Defs, Rect, Stop, RadialGradient as SvgRadialGradient, LinearGradient as SvgLinearGradient, Path } from "react-native-svg";
import WallpaperBackground from "@/components/WallpaperBackground";

export default function SettingsScreen() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const { wallpaper, setWallpaper } = usePreferences();
  const { language, setLanguage } = useLanguage();
  const { consent, updateConsent } = usePrivacyConsent();
  const router = useRouter();

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
          <Text className="text-white text-xl font-semibold mb-2">Sign in required</Text>
          <Text className="text-white/50 text-sm text-center mb-6">
            Please sign in to access settings
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            className="bg-[#D4AF37] rounded-xl py-3.5 px-8"
          >
            <Text className="text-[#021a12] font-semibold text-base">Sign In</Text>
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
          <Text className="text-xl font-semibold text-white">Account Settings</Text>
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
              Profile
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
                    <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D4AF37] rounded-full border-2 border-[#032117] items-center justify-center">
                      <Text className="text-[#032117] text-xs">⭐</Text>
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
                      <Text className="text-[#D4AF37]">✨ Premium Member</Text>
                    ) : (
                      <Text className="text-white/40">Free Plan</Text>
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Language Section */}
          <View>
            <Text className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
              Language
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
              Wallpaper
            </Text>
            <View style={styles.wallpaperGrid}>
              {WALLPAPERS.map((wp) => (
                <TouchableOpacity
                  key={wp.id}
                  onPress={() => setWallpaper(wp.id)}
                  className={`relative rounded-xl overflow-hidden border-2 ${
                    wallpaper === wp.id
                      ? "border-[#D4AF37]"
                      : "border-white/10"
                  }`}
                  style={styles.wallpaperThumb}
                >
                  <WallpaperPreviewSvg id={wp.id} width={THUMB_WIDTH} height={THUMB_HEIGHT} />
                  
                  <View className="absolute inset-x-0 bottom-0 bg-black/80 p-2">
                    <Text className="text-[10px] font-medium text-white/90 leading-tight">
                      {wp.name}
                    </Text>
                  </View>
                  
                  {wallpaper === wp.id && (
                    <View className="absolute top-2 right-2 w-5 h-5 bg-[#D4AF37] rounded-full items-center justify-center">
                      <Ionicons name="checkmark" size={12} color="#032117" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-xs text-white/40 mt-3">
              Choose a wallpaper for your home screen
            </Text>
          </View>

          {/* Plan Section */}
          <View>
            <Text className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
              Plan
            </Text>
            <View className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
              {isPremium ? (
                <View className="p-5">
                  <View className="flex-row items-center gap-3 mb-3">
                    <View className="w-10 h-10 rounded-full bg-[#D4AF37]/20 items-center justify-center">
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <Path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </Svg>
                    </View>
                    <View>
                      <Text className="font-medium text-white">Premium Active</Text>
                      <Text className="text-xs text-white/50">Ad-free experience enabled</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View className="p-5">
                  <View className="flex-row items-center gap-3 mb-4">
                    <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                      <Ionicons name="star-outline" size={20} color="rgba(255,255,255,0.5)" />
                    </View>
                    <View>
                      <Text className="font-medium text-white">Free Plan</Text>
                      <Text className="text-xs text-white/50">Upgrade to remove ads</Text>
                    </View>
                  </View>
                  <Link href="/subscription/index" asChild>
                    <TouchableOpacity>
                      <LinearGradient
                        colors={["#D4AF37", "#c9a431"]}
                        className="w-full items-center py-3 rounded-xl"
                      >
                        <Text className="text-sm font-semibold text-[#032117]">
                          Go Ad-Free Forever
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Link>
                </View>
              )}
            </View>
          </View>

          {/* Privacy Preferences */}
          <View>
            <Text className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
              Privacy
            </Text>
            <View className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
              <View className="flex-row items-center justify-between p-4 border-b border-white/5">
                <View className="flex-1 mr-3">
                  <Text className="font-medium text-white text-sm">Analytics</Text>
                  <Text className="text-xs text-white/50 mt-0.5">Help improve the app</Text>
                </View>
                <Switch
                  value={consent?.analytics ?? false}
                  onValueChange={(value) => updateConsent({ analytics: value })}
                  trackColor={{ false: "rgba(255,255,255,0.1)", true: "rgba(212,175,55,0.3)" }}
                  thumbColor={consent?.analytics ? "#D4AF37" : "#666"}
                />
              </View>
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-1 mr-3">
                  <Text className="font-medium text-white text-sm">Personalised Ads</Text>
                  <Text className="text-xs text-white/50 mt-0.5">Relevant ad experience</Text>
                </View>
                <Switch
                  value={consent?.personalizedAds ?? false}
                  onValueChange={(value) => updateConsent({ personalizedAds: value })}
                  trackColor={{ false: "rgba(255,255,255,0.1)", true: "rgba(212,175,55,0.3)" }}
                  thumbColor={consent?.personalizedAds ? "#D4AF37" : "#666"}
                />
              </View>
            </View>
          </View>

          {/* Support & Legal */}
          <View>
            <Text className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
              Support &amp; Legal
            </Text>
            <View className="gap-2">
              <Link href="/support" asChild>
                <TouchableOpacity className="flex-row items-center gap-3 w-full p-4 bg-white/5 rounded-xl border border-white/5">
                  <View className="w-10 h-10 rounded-full bg-[#D4AF37]/10 items-center justify-center">
                    <Ionicons name="help-circle-outline" size={20} color="#D4AF37" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-white">Help &amp; Support</Text>
                    <Text className="text-xs text-white/50">FAQ, contact, and more</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
                </TouchableOpacity>
              </Link>

              <Link href="/privacy" asChild>
                <TouchableOpacity className="flex-row items-center gap-3 w-full p-4 bg-white/5 rounded-xl border border-white/5">
                  <View className="w-10 h-10 rounded-full bg-[#D4AF37]/10 items-center justify-center">
                    <Ionicons name="shield-checkmark-outline" size={20} color="#D4AF37" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-white">Privacy Policy</Text>
                    <Text className="text-xs text-white/50">How we handle your data</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
                </TouchableOpacity>
              </Link>

              <Link href="/terms" asChild>
                <TouchableOpacity className="flex-row items-center gap-3 w-full p-4 bg-white/5 rounded-xl border border-white/5">
                  <View className="w-10 h-10 rounded-full bg-[#D4AF37]/10 items-center justify-center">
                    <Ionicons name="document-text-outline" size={20} color="#D4AF37" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-white">Terms of Service</Text>
                    <Text className="text-xs text-white/50">Usage terms and conditions</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Account Actions */}
          <View>
            <Text className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
              Account
            </Text>
            <View className="gap-2">
              <TouchableOpacity
                onPress={handleSignOut}
                className="flex-row items-center gap-3 w-full p-4 bg-white/5 rounded-xl border border-white/5"
              >
                <View className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center">
                  <Ionicons name="log-out-outline" size={20} color="#f87171" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-white">Sign Out</Text>
                  <Text className="text-xs text-white/50">Log out of your account</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Delete Account",
                    "Are you sure you want to delete your account? This action is permanent and all your data will be erased. To proceed, we'll open an email to our support team.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete Account",
                        style: "destructive",
                        onPress: () => {
                          Linking.openURL(
                            `mailto:info@aqala.org?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20Aqala%20account.%0A%0AEmail:%20${encodeURIComponent(user?.email || "")}%0AUser%20ID:%20${encodeURIComponent(user?.uid || "")}`
                          );
                        },
                      },
                    ]
                  );
                }}
                className="flex-row items-center gap-3 w-full p-4 bg-white/5 rounded-xl border border-red-500/10"
              >
                <View className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center">
                  <Ionicons name="trash-outline" size={20} color="#f87171" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-red-400">Delete Account</Text>
                  <Text className="text-xs text-white/50">Permanently delete your account and data</Text>
                </View>
              </TouchableOpacity>
            </View>
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

function WallpaperPreviewSvg({ id, width, height }: { id: string; width: number; height: number }) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        {/* Mosque at Night */}
        <SvgLinearGradient id="mosque-base" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#021a12" />
          <Stop offset="0.15" stopColor="#032117" />
          <Stop offset="0.4" stopColor="#042d1d" />
          <Stop offset="0.7" stopColor="#032117" />
          <Stop offset="1" stopColor="#021a12" />
        </SvgLinearGradient>
        <SvgRadialGradient id="mosque-glow-top" cx="50%" cy="0%" rx="60%" ry="50%">
          <Stop offset="0" stopColor="#0a5c3e" stopOpacity={0.8} />
          <Stop offset="0.5" stopColor="#0a5c3e" stopOpacity={0.3} />
          <Stop offset="1" stopColor="#0a5c3e" stopOpacity={0} />
        </SvgRadialGradient>
        <SvgRadialGradient id="mosque-glow-br" cx="80%" cy="100%" rx="50%" ry="45%">
          <Stop offset="0" stopColor="#06402b" stopOpacity={0.6} />
          <Stop offset="0.5" stopColor="#06402b" stopOpacity={0.2} />
          <Stop offset="1" stopColor="#06402b" stopOpacity={0} />
        </SvgRadialGradient>

        {/* Emerald — 135deg diagonal */}
        <SvgLinearGradient id="emerald-base" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#032117" />
          <Stop offset="0.5" stopColor="#064d33" />
          <Stop offset="1" stopColor="#032117" />
        </SvgLinearGradient>

        {/* Golden Hour */}
        <SvgLinearGradient id="golden-hour-base" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1a1510" />
          <Stop offset="0.3" stopColor="#2d2418" />
          <Stop offset="0.6" stopColor="#1a1510" />
          <Stop offset="1" stopColor="#0d0a07" />
        </SvgLinearGradient>

        {/* Midnight Blue */}
        <SvgLinearGradient id="midnight-base" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0a0f1a" />
          <Stop offset="0.3" stopColor="#151e30" />
          <Stop offset="0.7" stopColor="#0d1422" />
          <Stop offset="1" stopColor="#080c14" />
        </SvgLinearGradient>

        {/* Desert Sand */}
        <SvgLinearGradient id="desert-base" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1f1a14" />
          <Stop offset="0.3" stopColor="#2d261e" />
          <Stop offset="0.7" stopColor="#1a1510" />
          <Stop offset="1" stopColor="#100d09" />
        </SvgLinearGradient>

        {/* Deep Ocean */}
        <SvgLinearGradient id="deep-ocean-base" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#071318" />
          <Stop offset="0.3" stopColor="#0c2633" />
          <Stop offset="0.7" stopColor="#082028" />
          <Stop offset="1" stopColor="#040d11" />
        </SvgLinearGradient>
      </Defs>

      {id === "mosque" && (
        <>
          <Rect width={width} height={height} fill="url(#mosque-base)" />
          <Rect width={width} height={height} fill="url(#mosque-glow-top)" />
          <Rect width={width} height={height} fill="url(#mosque-glow-br)" />
        </>
      )}
      {id === "emerald" && (
        <Rect width={width} height={height} fill="url(#emerald-base)" />
      )}
      {id === "golden-hour" && (
        <Rect width={width} height={height} fill="url(#golden-hour-base)" />
      )}
      {id === "midnight" && (
        <Rect width={width} height={height} fill="url(#midnight-base)" />
      )}
      {id === "desert" && (
        <Rect width={width} height={height} fill="url(#desert-base)" />
      )}
      {id === "deep-ocean" && (
        <Rect width={width} height={height} fill="url(#deep-ocean-base)" />
      )}
    </Svg>
  );
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const GRID_PADDING = 20;
const GRID_GAP = 12;
const THUMB_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * 2) / 3;
const THUMB_HEIGHT = THUMB_WIDTH * (3 / 4);

const styles = StyleSheet.create({
  wallpaperGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  wallpaperThumb: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
  },
});
