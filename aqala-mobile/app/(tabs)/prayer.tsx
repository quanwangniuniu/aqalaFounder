import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { usePrayer } from "@/contexts/PrayerContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrayerTime, getMethodName } from "@/lib/prayer/calculations";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import WallpaperBackground from "@/components/WallpaperBackground";

export default function PrayerScreen() {
  const { isRTL } = useLanguage();
  const {
    prayerTimes,
    settings,
    location,
    loading,
    error,
    nextPrayer,
    currentPrayer,
    timeUntilNext,
    refreshLocation,
    refreshPrayerTimes,
  } = usePrayer();

  const prayers = prayerTimes
    ? [
        { name: "Fajr", nameAr: "الفجر", time: prayerTimes.fajr },
        { name: "Sunrise", nameAr: "الشروق", time: prayerTimes.sunrise, isSunrise: true },
        { name: "Dhuhr", nameAr: "الظهر", time: prayerTimes.dhuhr },
        { name: "Asr", nameAr: "العصر", time: prayerTimes.asr },
        { name: "Maghrib", nameAr: "المغرب", time: prayerTimes.maghrib },
        { name: "Isha", nameAr: "العشاء", time: prayerTimes.isha },
      ]
    : [];

  return (
    <WallpaperBackground edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-6 border-b border-white/5">
        <View style={{ maxWidth: 500, alignSelf: 'center', width: '100%' }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Link href="/(tabs)" asChild>
                <TouchableOpacity className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
                  <Ionicons name="chevron-back" size={18} color="white" />
                </TouchableOpacity>
              </Link>
              <Text className="text-xl font-semibold text-white">Prayer Times</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Link href="/qibla" asChild>
                <TouchableOpacity className="flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                  <Ionicons name="compass" size={16} color="#D4AF37" />
                  <Text className="text-xs font-medium text-[#D4AF37]">Qibla</Text>
                </TouchableOpacity>
              </Link>
              <Link href="/prayers/settings" asChild>
                <TouchableOpacity className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
                  <Ionicons name="settings-outline" size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 py-6 gap-6" style={{ maxWidth: 500, alignSelf: 'center', width: '100%' }}>
          {/* Location Info */}
          {location && !loading && (
            <Pressable onPress={refreshLocation}>
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
                  <Ionicons name="location" size={14} color="rgba(255,255,255,0.5)" />
                </View>
                <Text className="text-sm text-white/50">
                  {location.city ? `${location.city}, ${location.country}` : "Update location"}
                </Text>
              </View>
            </Pressable>
          )}

          {/* Next Prayer Hero Card */}
          {nextPrayer && !loading && !error && (
            <View className="rounded-2xl p-6 border border-white/10 overflow-hidden">
              <LinearGradient
                colors={["#0a5c3e", "#053521"]}
                className="absolute inset-0"
              />
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs text-white/50 uppercase tracking-wider mb-1">Next Prayer</Text>
                  <Text className="text-3xl font-bold text-[#D4AF37]">{nextPrayer.name}</Text>
                  <Text className="text-sm text-white/60 mt-1">in {timeUntilNext}</Text>
                </View>
                <View className="items-end">
                  <View className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 items-center justify-center mb-2">
                    <Ionicons name="time" size={32} color="#D4AF37" />
                  </View>
                  <Text className="text-2xl font-light text-white">{formatPrayerTime(nextPrayer.time)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Loading State */}
          {loading && (
            <View className="items-center py-16">
              <View className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 items-center justify-center mb-4">
                <ActivityIndicator size="large" color="#D4AF37" />
              </View>
              <Text className="text-white/50">Getting your location...</Text>
              <Text className="text-xs text-white/30 mt-2">Please allow location access</Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View className="bg-red-500/5 rounded-2xl p-5 border border-red-500/20">
              <View className="flex-row items-start gap-4">
                <View className="w-10 h-10 rounded-xl bg-red-500/10 items-center justify-center">
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-red-400 text-sm font-medium mb-1">Location Required</Text>
                  <Text className="text-white/50 text-xs mb-4">{error}</Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={refreshLocation}
                      className="px-4 py-2 bg-white/10 rounded-xl"
                    >
                      <Text className="text-sm text-white">Retry Location</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={refreshPrayerTimes}
                      className="px-4 py-2 bg-white/10 rounded-xl"
                    >
                      <Text className="text-sm text-white">Retry Prayer Times</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Prayer Times List */}
          {!loading && !error && prayerTimes && (
            <View>
              <Text className="text-sm font-medium text-[#D4AF37] mb-4 uppercase tracking-wider">
                Today&apos;s Prayers
              </Text>
              <View className="gap-2">
                {prayers.map((prayer) => {
                  const isNext = nextPrayer?.name === prayer.name;
                  const isCurrent = currentPrayer === prayer.name;
                  const isPast = new Date() > prayer.time && !isNext;

                  return (
                    <View
                      key={prayer.name}
                      className={`flex-row items-center justify-between p-4 rounded-2xl border ${
                        isNext
                          ? "bg-[#D4AF37]/10 border-[#D4AF37]/30"
                          : isCurrent
                          ? "bg-white/5 border-white/10"
                          : "bg-white/5 border-white/5"
                      }`}
                      style={{ opacity: isPast ? 0.4 : 1 }}
                    >
                      <View className="flex-row items-center gap-4">
                        <View
                          className={`w-12 h-12 rounded-xl items-center justify-center ${
                            isNext
                              ? "bg-[#D4AF37]/20"
                              : prayer.isSunrise
                              ? "bg-orange-500/10"
                              : "bg-white/5"
                          }`}
                        >
                          {prayer.isSunrise ? (
                            <Ionicons 
                              name="sunny" 
                              size={24} 
                              color={isNext ? "#D4AF37" : "#fb923c"} 
                            />
                          ) : (
                            <Ionicons 
                              name="moon" 
                              size={24} 
                              color={isNext ? "#D4AF37" : "rgba(255,255,255,0.4)"} 
                            />
                          )}
                        </View>
                        <View>
                          <Text className={`font-semibold text-lg ${isNext ? "text-[#D4AF37]" : "text-white"}`}>
                            {prayer.name}
                          </Text>
                          <Text className="text-sm text-white/40">{prayer.nameAr}</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className={`text-xl font-medium ${isNext ? "text-[#D4AF37]" : "text-white/80"}`}>
                          {formatPrayerTime(prayer.time)}
                        </Text>
                        {isNext && (
                          <Text className="text-xs text-[#D4AF37]/70 mt-0.5">in {timeUntilNext}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Calculation Method Info */}
          {!loading && !error && prayerTimes && (
            <View className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <Text className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
                Calculation Method
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center">
                    <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.5)" />
                  </View>
                  <View>
                    <Text className="text-sm text-white font-medium">{getMethodName(settings.method)}</Text>
                    <Text className="text-xs text-white/40">{settings.school === 1 ? "Hanafi School" : "Standard"}</Text>
                  </View>
                </View>
                <Link href="/prayers/settings" asChild>
                  <TouchableOpacity>
                    <Text className="text-xs text-[#D4AF37]">Change</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </WallpaperBackground>
  );
}
