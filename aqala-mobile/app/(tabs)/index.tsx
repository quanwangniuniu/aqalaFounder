import { View, Text, ScrollView, TouchableOpacity, Image, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { usePrayer } from "@/contexts/PrayerContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { formatPrayerTime } from "@/lib/prayer/calculations";
import { getUserDisplayName, getUserInitials } from "@/utils/userDisplay";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const { t, isRTL } = useLanguage();
  const { nextPrayer, loading: prayerLoading } = usePrayer();
  const { user, loading: authLoading } = useAuth();
  const { isPremium, showAds } = useSubscription();
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
    <SafeAreaView className="flex-1 bg-[#032117]" edges={["top"]}>
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
                    <Text className="text-white/70 text-base">🔍</Text>
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
                          <Text className="text-[10px] text-[#D4AF37]">Premium ✨</Text>
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
                            color: '#021a12',
                            fontSize: 14,
                            fontWeight: '500',
                          }}
                        >
                          Sign In
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
              <View className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6">
                {/* Decorative glow */}
                <View className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full" style={{ transform: [{ translateX: 96 }, { translateY: -96 }] }} />
                <View className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full" style={{ transform: [{ translateX: -64 }, { translateY: 64 }] }} />
                
                <View className="relative">
                  {/* Headline */}
                  <Text className="text-3xl font-bold tracking-tight text-white leading-tight mb-3">
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
                        paddingHorizontal: 24,
                        paddingVertical: 14,
                        borderRadius: 9999,
                        gap: 12,
                      }}
                    >
                      <View 
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: 'rgba(3, 33, 23, 0.4)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name="mic" size={20} color="white" />
                      </View>
                      <Text 
                        style={{ 
                          color: '#032117',
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

            {/* Feature Grid */}
            <View className="mt-4 flex-row flex-wrap gap-3">
              {/* Prayer Times Card */}
              <Pressable onPress={() => handleAdLink("/prayers")} className="flex-1" style={{ minWidth: '47%' }}>
                <View className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4">
                  <View className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full" style={{ transform: [{ translateX: 40 }, { translateY: -40 }] }} />
                  
                  <View className="relative">
                    <View className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 items-center justify-center mb-3">
                      <Text className="text-[#D4AF37] text-lg">🕐</Text>
                    </View>
                    
                    <Text className="text-xs text-white/50 mb-0.5">Prayer Times</Text>
                    {!prayerLoading && nextPrayer ? (
                      <>
                        <Text className="text-lg font-semibold text-white leading-tight">{nextPrayer.name}</Text>
                        <Text className="text-xs text-[#D4AF37]/80">{formatPrayerTime(nextPrayer.time)}</Text>
                      </>
                    ) : (
                      <Text className="text-sm text-white/60">View schedule</Text>
                    )}
                  </View>
                </View>
              </Pressable>

              {/* Qibla Card */}
              <Pressable onPress={() => handleAdLink("/qibla")} className="flex-1" style={{ minWidth: '47%' }}>
                <View className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4">
                  <View className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full" style={{ transform: [{ translateX: 40 }, { translateY: -40 }] }} />
                  
                  <View className="relative">
                    <View className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 items-center justify-center mb-3">
                      <Text className="text-[#D4AF37] text-lg">🧭</Text>
                    </View>
                    
                    <Text className="text-xs text-white/50 mb-0.5">Qibla Finder</Text>
                    <Text className="text-sm font-medium text-white">Find Direction</Text>
                    <Text className="text-xs text-white/40">Compass guide</Text>
                  </View>
                </View>
              </Pressable>

              {/* Mosques Card */}
              <Pressable onPress={() => handleAdLink("/rooms")} className="flex-1" style={{ minWidth: '47%' }}>
                <View className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4">
                  <View className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full" style={{ transform: [{ translateX: 40 }, { translateY: -40 }] }} />
                  
                  <View className="relative">
                    <View className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 items-center justify-center mb-3">
                      <Text className="text-[#D4AF37] text-lg">🕌</Text>
                    </View>
                    
                    <Text className="text-xs text-white/50 mb-0.5">Mosques</Text>
                    <Text className="text-sm font-medium text-white">Join a Room</Text>
                    <Text className="text-xs text-white/40">Shared listening</Text>
                  </View>
                </View>
              </Pressable>

              {/* Support Card */}
              {showAds && user ? (
                <Link href="/subscription/index" asChild>
                  <TouchableOpacity className="flex-1" style={{ minWidth: '47%' }}>
                    <LinearGradient
                      colors={["rgba(212, 175, 55, 0.1)", "rgba(212, 175, 55, 0.05)"]}
                      className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 p-4"
                    >
                      <View className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/10 rounded-full" style={{ transform: [{ translateX: 40 }, { translateY: -40 }] }} />
                      
                      <View className="relative">
                        <View className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 items-center justify-center mb-3">
                          <Text className="text-[#D4AF37] text-lg">⭐</Text>
                        </View>
                        
                        <Text className="text-xs text-[#D4AF37]/70 mb-0.5">Go Premium</Text>
                        <Text className="text-sm font-medium text-white">Remove Ads</Text>
                        <Text className="text-xs text-[#D4AF37]">$15 one-time</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>
              ) : (
                <Link href="/donate" asChild>
                  <TouchableOpacity className="flex-1" style={{ minWidth: '47%' }}>
                    <View className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4">
                      <View className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full" style={{ transform: [{ translateX: 40 }, { translateY: -40 }] }} />
                      
                      <View className="relative">
                        <View className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 items-center justify-center mb-3">
                          <Text className="text-[#D4AF37] text-lg">❤️</Text>
                        </View>
                        
                        <Text className="text-xs text-white/50 mb-0.5">Support</Text>
                        <Text className="text-sm font-medium text-white">Donate</Text>
                        <Text className="text-xs text-white/40">{t("home.helpKeepFree")}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
              )}
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
                  {isPremium ? "Thank you for supporting Aqala ✨" : t("home.freeForever")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
