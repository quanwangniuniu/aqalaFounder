import { View, Text, ScrollView, TouchableOpacity, Image, Pressable, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { usePrayer } from "@/contexts/PrayerContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useMessageNotifications } from "@/contexts/MessageNotificationContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { formatPrayerTime } from "@/lib/prayer/calculations";
import { getUserDisplayName, getUserInitials } from "@/utils/userDisplay";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, Path, Polyline } from "react-native-svg";
import WallpaperBackground from "@/components/WallpaperBackground";

export default function HomeScreen() {
  const { t, isRTL } = useLanguage();
  const { nextPrayer, loading: prayerLoading } = usePrayer();
  const { user, loading: authLoading } = useAuth();
  const { isPremium, showAds } = useSubscription();
  const { unreadCount } = useMessageNotifications();
  const { getDarkestColor } = usePreferences();
  const darkBg = getDarkestColor();
  const router = useRouter();

  const handleAdLink = (href: string) => {
    if (showAds && !isPremium) {
      // TODO: Show interstitial ad, then navigate
      router.push(href as any);
    } else {
      router.push(href as any);
    }
  };

  return (
    <WallpaperBackground edges={["top"]}>
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View className="w-full px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between" style={{ maxWidth: 554, alignSelf: 'center', width: '100%' }}>
            {/* Logo */}
            <Link href="/(tabs)" asChild>
              <Pressable>
                <Image
                  source={require("@/assets/aqala-logo.png")}
                  style={{
                    width: 64,
                    height: 64,
                    tintColor: "white",
                  }}
                  resizeMode="contain"
                />
              </Pressable>
            </Link>

            {/* Actions */}
            <View className="flex-row items-center gap-2">
              {/* Search */}
              {user && (
                <Link href="/search" asChild>
                  <TouchableOpacity className="p-2 rounded-full bg-white/5 border border-white/10">
                    <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                </Link>
              )}

              {/* Messages */}
              {user && (
                <Link href="/messages/index" asChild>
                  <TouchableOpacity className="p-2 rounded-full bg-white/5 border border-white/10" style={{ position: "relative" }}>
                    <Ionicons name="chatbubble-outline" size={18} color="rgba(255,255,255,0.7)" />
                    {unreadCount > 0 && (
                      <View
                        style={{
                          position: "absolute",
                          top: -2,
                          right: -2,
                          minWidth: 18,
                          height: 18,
                          borderRadius: 9,
                          backgroundColor: "#D4AF37",
                          alignItems: "center",
                          justifyContent: "center",
                          paddingHorizontal: 4,
                        }}
                      >
                        <Text style={{ color: darkBg, fontSize: 10, fontWeight: "700" }}>
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Link>
              )}

              {/* Profile / Sign In */}
              {!authLoading && (
                user ? (
                  <Link href={`/user/${user.uid}`} asChild>
                    <TouchableOpacity className="flex-row items-center gap-2 px-2 py-1.5 rounded-full bg-white/5 border border-white/10">
                      {user.photoURL ? (
                        <Image
                          source={{ uri: user.photoURL }}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <LinearGradient
                          colors={["rgba(212, 175, 55, 0.3)", "rgba(212, 175, 55, 0.1)"]}
                          className="w-8 h-8 rounded-full items-center justify-center"
                        >
                          <Text className="text-[#D4AF37] text-sm font-semibold">
                            {getUserInitials(user)}
                          </Text>
                        </LinearGradient>
                      )}
                      <View className="pr-1">
                        <Text className="text-xs font-medium text-white leading-tight">
                          {user.username ? `@${user.username}` : getUserDisplayName(user).split(" ")[0]}
                        </Text>
                        {isPremium && (
                          <Text className="text-[10px] text-[#D4AF37]">{t("home.premium")}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </Link>
                ) : (
                  <Link href="/auth/login" asChild>
                    <TouchableOpacity
                      style={{
                        shadowColor: "#D4AF37",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 6,
                      }}
                    >
                      <LinearGradient
                        colors={["#D4AF37", "#b8944d"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 9999,
                        }}
                      >
                        <Text 
                          style={{ 
                            color: darkBg,
                            fontSize: 14,
                            fontWeight: '500',
                          }}
                        >
                          {t("home.signIn")}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Link>
                )
              )}
            </View>
          </View>
        </View>

        {/* Main content */}
        <View className="flex-1 flex-col px-4 pb-6">
          <View className="w-full flex-1 flex-col" style={{ maxWidth: 554, alignSelf: 'center' }}>
            
            {/* Hero Section - Primary CTA */}
            <View className="mt-4">
              <View className="overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6">
                <View>
                  {/* Headline */}
                  <Text className="text-4xl font-bold tracking-tight text-white leading-tight mb-3">
                    {t("home.headline1")}
                    {"\n"}
                    <Text className="text-[#D4AF37]">{t("home.headline2")}</Text>
                  </Text>

                  {/* Subheadline */}
                  <Text className="text-sm text-white/70 leading-relaxed mb-6" style={{ maxWidth: 300 }}>
                    {t("home.subheadline")}
                  </Text>

                  {/* Primary CTA */}
                  <Pressable 
                    onPress={() => handleAdLink("/listen")}
                    style={{
                      alignSelf: 'flex-start',
                      shadowColor: "#D4AF37",
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                      elevation: 8,
                    }}
                  >
                    <LinearGradient
                      colors={["#D4AF37", "#b8944d"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ 
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderRadius: 9999,
                        gap: 12,
                      }}
                    >
                      <View 
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: `${darkBg}66`,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name="mic" size={20} color="white" />
                      </View>
                      <Text 
                        style={{ 
                          color: darkBg,
                          fontSize: 16,
                          fontWeight: '600',
                        }}
                      >
                        {t("home.startListening")}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Feature Grid – two columns, equal-height rows */}
            <View style={{ marginTop: 16, gap: 12 }}>
              {/* Row 1 */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                {/* Prayer Times Card */}
                <Pressable onPress={() => handleAdLink("/prayers")} style={{ flex: 1 }}>
                  <View className="overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4" style={{ flex: 1 }}>
                    <View className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 items-center justify-center mb-3">
                      <Ionicons name="time-outline" size={20} color="#D4AF37" />
                    </View>
                    
                    <Text className="text-xs text-white/50 mb-0.5">{t("home.prayerTimes")}</Text>
                    {!prayerLoading && nextPrayer ? (
                      <>
                        <Text className="text-sm font-medium text-white">{nextPrayer.name}</Text>
                        <Text className="text-xs text-[#D4AF37]/80">{formatPrayerTime(nextPrayer.time)}</Text>
                      </>
                    ) : (
                      <>
                        <Text className="text-sm font-medium text-white">{t("home.viewSchedule")}</Text>
                        <Text className="text-xs text-white/0">–</Text>
                      </>
                    )}
                  </View>
                </Pressable>

                {/* Qibla Card */}
                <Pressable onPress={() => handleAdLink("/qibla")} style={{ flex: 1 }}>
                  <View className="overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4" style={{ flex: 1 }}>
                    <View className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 items-center justify-center mb-3">
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Circle cx={12} cy={12} r={10} stroke="#D4AF37" strokeWidth={2} />
                        <Path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#D4AF37" strokeWidth={2} strokeLinecap="round" />
                        <Circle cx={12} cy={12} r={3} fill="#D4AF37" />
                      </Svg>
                    </View>
                    
                    <Text className="text-xs text-white/50 mb-0.5">{t("home.qiblaFinder")}</Text>
                    <Text className="text-sm font-medium text-white">{t("home.findDirection")}</Text>
                    <Text className="text-xs text-white/40">{t("home.compassGuide")}</Text>
                  </View>
                </Pressable>
              </View>

              {/* Row 2 */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                {/* Mosques Card */}
                <Pressable onPress={() => handleAdLink("/rooms")} style={{ flex: 1 }}>
                  <View className="overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4" style={{ flex: 1 }}>
                    <View className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 items-center justify-center mb-3">
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Path d="M3 21h18" stroke="#D4AF37" strokeWidth={2} strokeLinecap="round" />
                        <Path d="M5 21V7l7-4 7 4v14" stroke="#D4AF37" strokeWidth={2} />
                        <Path d="M9 21v-6h6v6" stroke="#D4AF37" strokeWidth={2} />
                        <Circle cx={12} cy={10} r={2} stroke="#D4AF37" strokeWidth={2} />
                      </Svg>
                    </View>
                    
                    <Text className="text-xs text-white/50 mb-0.5">{t("home.mosques")}</Text>
                    <Text className="text-sm font-medium text-white">{t("home.joinRoom")}</Text>
                    <Text className="text-xs text-white/40">{t("home.sharedListening")}</Text>
                  </View>
                </Pressable>

                {/* Support Card */}
                {showAds && user ? (
                  <Link href="/subscription/index" asChild>
                    <TouchableOpacity style={{ flex: 1 }}>
                      <View className="overflow-hidden rounded-2xl bg-white/5 border border-[#D4AF37]/20 p-4" style={{ flex: 1 }}>
                        <View className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 items-center justify-center mb-3">
                          <Ionicons name="star-outline" size={20} color="#D4AF37" />
                        </View>
                        
                        <Text className="text-xs text-[#D4AF37]/70 mb-0.5">{t("home.goPremium")}</Text>
                        <Text className="text-sm font-medium text-white">{t("home.removeAds")}</Text>
                        <Text className="text-xs text-[#D4AF37]">{t("home.oneTime")}</Text>
                      </View>
                    </TouchableOpacity>
                  </Link>
                ) : (
                  <Link href="/donate" asChild>
                    <TouchableOpacity style={{ flex: 1 }}>
                      <View className="overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4" style={{ flex: 1 }}>
                        <View className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 items-center justify-center mb-3">
                          <Ionicons name="heart" size={20} color="#D4AF37" />
                        </View>
                        
                        <Text className="text-xs text-white/50 mb-0.5">{t("home.support")}</Text>
                        <Text className="text-sm font-medium text-white">{t("home.donate")}</Text>
                        <Text className="text-xs text-white/40">{t("home.helpKeepFree")}</Text>
                      </View>
                    </TouchableOpacity>
                  </Link>
                )}
              </View>
            </View>

            {/* Bottom Section */}
            <View className="pt-8">
              {/* Quranic verse */}
              <View className="items-center mb-4">
                <Text className="text-sm text-white/50 text-center" style={{ maxWidth: 300 }}>
                  {t("home.quranVerse")}
                  {"\n"}
                  <Text className="text-xs text-white/30">{t("home.quranRef")}</Text>
                </Text>
              </View>

              {/* Bottom actions */}
              <View className="flex-row items-center justify-center gap-4">
                <Link href="/reviews" asChild>
                  <TouchableOpacity>
                    <Text className="text-xs text-white/40">⭐ {t("home.shareThoughts")}</Text>
                  </TouchableOpacity>
                </Link>
                
                <View className="w-1 h-1 rounded-full bg-white/20" />
                
                <Text className="text-xs text-white/30">
                  {isPremium ? t("home.thankYouPremium") : t("home.freeForever")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </WallpaperBackground>
  );
}
