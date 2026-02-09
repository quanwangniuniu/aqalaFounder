import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { usePrayer } from "@/contexts/PrayerContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { formatPrayerTime, getMethodName, PrayerName } from "@/lib/prayer/calculations";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import WallpaperBackground from "@/components/WallpaperBackground";

export default function PrayerScreen() {
  const { isRTL, t } = useLanguage();
  const { getAccentColor } = usePreferences();
  const accent = getAccentColor();
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
    toggleAdhan,
    stopAdhan,
    isAdhanPlaying,
  } = usePrayer();

  const prayerIcons: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
    Fajr:    { icon: "moon",           color: "#94a3b8", bg: "bg-indigo-500/10" },    // pre-dawn, still dark
    Sunrise: { icon: "sunny",          color: "#fb923c", bg: "bg-orange-500/10" },    // sun rising
    Dhuhr:   { icon: "sunny",          color: "#facc15", bg: "bg-yellow-500/10" },    // midday sun
    Asr:     { icon: "partly-sunny",   color: "#fbbf24", bg: "bg-amber-500/10" },     // afternoon sun
    Maghrib: { icon: "cloudy-night",   color: "#f97316", bg: "bg-orange-500/10" },    // sunset
    Isha:    { icon: "moon",           color: "#818cf8", bg: "bg-indigo-500/10" },    // nighttime
  };

  const prayers = prayerTimes
    ? [
        { key: "fajr" as PrayerName, name: "Fajr", nameAr: "الفجر", time: prayerTimes.fajr },
        { key: "sunrise" as PrayerName, name: "Sunrise", nameAr: "الشروق", time: prayerTimes.sunrise },
        { key: "dhuhr" as PrayerName, name: "Dhuhr", nameAr: "الظهر", time: prayerTimes.dhuhr },
        { key: "asr" as PrayerName, name: "Asr", nameAr: "العصر", time: prayerTimes.asr },
        { key: "maghrib" as PrayerName, name: "Maghrib", nameAr: "المغرب", time: prayerTimes.maghrib },
        { key: "isha" as PrayerName, name: "Isha", nameAr: "العشاء", time: prayerTimes.isha },
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
              <Text className="text-xl font-semibold text-white">{t("prayer.title")}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Link href="/qibla" asChild>
                <TouchableOpacity className="flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                  <Ionicons name="compass" size={16} color="#D4AF37" />
                  <Text className="text-xs font-medium text-[#D4AF37]">{t("prayer.qibla")}</Text>
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

      {/* Adhan playing banner */}
      {isAdhanPlaying && (
        <TouchableOpacity
          onPress={stopAdhan}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            paddingVertical: 12,
            paddingHorizontal: 20,
            backgroundColor: "rgba(212, 175, 55, 0.12)",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(212, 175, 55, 0.2)",
          }}
        >
          <Ionicons name="volume-high" size={20} color="#D4AF37" />
          <Text style={{ color: "#D4AF37", fontSize: 14, fontWeight: "600" }}>
            Adhan Playing
          </Text>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: "rgba(212, 175, 55, 0.2)",
              marginLeft: 4,
            }}
          >
            <Text style={{ color: "#D4AF37", fontSize: 12, fontWeight: "600" }}>
              Tap to Stop
            </Text>
          </View>
        </TouchableOpacity>
      )}

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
                  {location.city ? `${location.city}, ${location.country}` : t("prayer.updateLocation")}
                </Text>
              </View>
            </Pressable>
          )}

          {/* Next Prayer Hero Card */}
          {nextPrayer && !loading && !error && (
            <View className="rounded-2xl p-6 border border-white/10 overflow-hidden">
              <LinearGradient
                colors={[accent.hover, accent.base]}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 }}
              />
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs text-white/50 uppercase tracking-wider mb-1">{t("prayer.nextPrayer")}</Text>
                  <Text className="text-3xl font-bold text-[#D4AF37]">{nextPrayer.name}</Text>
                  <Text className="text-sm text-white/60 mt-1">{t("prayer.in")} {timeUntilNext}</Text>
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
              <Text className="text-white/50">{t("prayer.gettingLocation")}</Text>
              <Text className="text-xs text-white/30 mt-2">{t("prayer.allowLocation")}</Text>
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
                  <Text className="text-red-400 text-sm font-medium mb-1">{t("prayer.locationRequired")}</Text>
                  <Text className="text-white/50 text-xs mb-4">{error}</Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={refreshLocation}
                      className="px-4 py-2 bg-white/10 rounded-xl"
                    >
                      <Text className="text-sm text-white">{t("prayer.retryLocation")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={refreshPrayerTimes}
                      className="px-4 py-2 bg-white/10 rounded-xl"
                    >
                      <Text className="text-sm text-white">{t("prayer.retryPrayerTimes")}</Text>
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
                {t("prayer.todaysPrayers")}
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
                              : prayerIcons[prayer.name]?.bg || "bg-white/5"
                          }`}
                        >
                          <Ionicons 
                            name={prayerIcons[prayer.name]?.icon || "time"} 
                            size={24} 
                            color={isNext ? "#D4AF37" : prayerIcons[prayer.name]?.color || "rgba(255,255,255,0.4)"} 
                          />
                        </View>
                        <View>
                          <Text className={`font-semibold text-lg ${isNext ? "text-[#D4AF37]" : "text-white"}`}>
                            {prayer.name}
                          </Text>
                          <Text className="text-sm text-white/40">{prayer.nameAr}</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-3">
                        {/* Adhan toggle */}
                        <TouchableOpacity
                          onPress={() => toggleAdhan(prayer.key)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: settings.adhan?.[prayer.key]
                              ? "rgba(212, 175, 55, 0.15)"
                              : "rgba(255,255,255,0.05)",
                            borderWidth: 1,
                            borderColor: settings.adhan?.[prayer.key]
                              ? "rgba(212, 175, 55, 0.3)"
                              : "rgba(255,255,255,0.08)",
                          }}
                        >
                          <Ionicons
                            name={settings.adhan?.[prayer.key] ? "notifications" : "notifications-off-outline"}
                            size={16}
                            color={settings.adhan?.[prayer.key] ? "#D4AF37" : "rgba(255,255,255,0.3)"}
                          />
                        </TouchableOpacity>

                        <View className="items-end">
                          <Text className={`text-xl font-medium ${isNext ? "text-[#D4AF37]" : "text-white/80"}`}>
                            {formatPrayerTime(prayer.time)}
                          </Text>
                          {isNext && (
                            <Text className="text-xs text-[#D4AF37]/70 mt-0.5">{t("prayer.in")} {timeUntilNext}</Text>
                          )}
                        </View>
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
                {t("prayer.calculationMethod")}
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center">
                    <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.5)" />
                  </View>
                  <View>
                    <Text className="text-sm text-white font-medium">{getMethodName(settings.method)}</Text>
                    <Text className="text-xs text-white/40">{settings.school === 1 ? t("prayer.hanafiSchool") : t("prayer.standard")}</Text>
                  </View>
                </View>
                <Link href="/prayers/settings" asChild>
                  <TouchableOpacity>
                    <Text className="text-xs text-[#D4AF37]">{t("prayer.change")}</Text>
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
