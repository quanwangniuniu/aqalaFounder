import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { usePrayer } from "@/contexts/PrayerContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { formatPrayerTime, getMethodName } from "@/lib/prayer/calculations";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import WallpaperBackground from "@/components/WallpaperBackground";

const GOLD = "#D4AF37";

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
  } = usePrayer();

  const prayers = prayerTimes
    ? [
        { name: "Fajr", nameAr: "الفجر", time: prayerTimes.fajr, icon: "moon" as const },           // pre-dawn
        { name: "Sunrise", nameAr: "الشروق", time: prayerTimes.sunrise, icon: "sunny" as const },   // sunrise
        { name: "Dhuhr", nameAr: "الظهر", time: prayerTimes.dhuhr, icon: "sunny" as const },        // midday
        { name: "Asr", nameAr: "العصر", time: prayerTimes.asr, icon: "partly-sunny" as const },     // afternoon
        { name: "Maghrib", nameAr: "المغرب", time: prayerTimes.maghrib, icon: "sunny-outline" as const }, // sunset
        { name: "Isha", nameAr: "العشاء", time: prayerTimes.isha, icon: "moon" as const },         // night
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
                <TouchableOpacity className="flex-row items-center gap-2 px-3 py-1.5 rounded-full border border-white/20" style={{ backgroundColor: `${accent.base}20`, borderColor: `${accent.base}50` }}>
                  <Ionicons name="compass" size={16} color={accent.base} />
                  <Text className="text-xs font-medium" style={{ color: accent.base }}>{t("prayer.qibla")}</Text>
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
                  {location.city ? `${location.city}, ${location.country}` : t("prayer.updateLocation")}
                </Text>
              </View>
            </Pressable>
          )}

          {/* Next Prayer Hero Card */}
          {nextPrayer && !loading && !error && (
            <View className="rounded-2xl p-6 border border-white/10 overflow-hidden">
              <LinearGradient
                colors={[accent.base, accent.hover]}
                className="absolute inset-0"
              />
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs uppercase tracking-wider mb-1" style={{ color: GOLD }}>{t("prayer.nextPrayer")}</Text>
                  <Text className="text-3xl font-bold" style={{ color: GOLD }}>{t(`prayer.${nextPrayer.name.toLowerCase()}` as const)}</Text>
                  <Text className="text-sm text-white/60 mt-1">
                    {(nextPrayer as any).isTomorrow ? t("prayer.tomorrow") : `${t("prayer.inTime")} ${timeUntilNext}`}
                  </Text>
                </View>
                <View className="items-end">
                  <View className="w-16 h-16 rounded-2xl items-center justify-center mb-2" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                    <Ionicons name="time" size={32} color={GOLD} />
                  </View>
                  <Text className="text-2xl font-light" style={{ color: GOLD }}>{formatPrayerTime(nextPrayer.time)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Loading State */}
          {loading && (
            <View className="items-center py-16">
              <View className="w-16 h-16 rounded-2xl items-center justify-center mb-4" style={{ backgroundColor: `${accent.base}20` }}>
                <ActivityIndicator size="large" color={accent.base} />
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
              <Text className="text-sm font-medium mb-4 uppercase tracking-wider" style={{ color: GOLD }}>
                {t("prayer.todaysPrayers")}
              </Text>
              <View className="gap-2">
                {prayers.map((prayer) => {
                  const isNext = nextPrayer?.name === prayer.name && !(nextPrayer as any).isTomorrow;
                  const isCurrent = currentPrayer === prayer.name;
                  const isPast = new Date() > prayer.time && !isCurrent;

                  return (
                    <View
                      key={prayer.name}
                      className="flex-row items-center justify-between p-4 rounded-2xl border"
                      style={{
                        opacity: isPast ? 0.4 : 1,
                        backgroundColor: isNext ? `${accent.base}35` : "rgba(255,255,255,0.05)",
                        borderColor: isCurrent ? GOLD : isNext ? `${accent.base}70` : "rgba(255,255,255,0.05)",
                        borderWidth: isCurrent ? 1.5 : 1,
                      }}
                    >
                      <View className="flex-row items-center gap-4 flex-1">
                        <View
                          className="w-12 h-12 rounded-xl items-center justify-center"
                          style={{
                            backgroundColor: isNext
                              ? "rgba(255,255,255,0.15)"
                              : prayer.name === "Maghrib"
                              ? "rgba(251,146,60,0.1)"
                              : prayer.icon === "sunny" || prayer.icon === "partly-sunny"
                              ? "rgba(251,191,36,0.1)"
                              : "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Ionicons
                            name={prayer.icon}
                            size={24}
                            color={
                              isCurrent
                                ? GOLD
                                : prayer.name === "Maghrib"
                                ? "#fb923c"
                                : prayer.icon === "sunny" || prayer.icon === "partly-sunny"
                                ? "#fbbf24"
                                : "rgba(255,255,255,0.5)"
                            }
                          />
                        </View>
                        <View className="flex-1 min-w-0">
                          <Text
                            className="font-semibold text-lg"
                            style={{ color: isCurrent ? GOLD : "white" }}
                          >
                            {t(`prayer.${prayer.name.toLowerCase()}` as const)}
                          </Text>
                          <Text className={`text-sm ${isCurrent ? "" : "text-white/40"}`} style={isCurrent ? { color: GOLD, opacity: 0.9 } : undefined}>
                            {isCurrent ? `${t("prayer.now")} · ` : ""}{prayer.nameAr}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end ml-2">
                        <Text
                          className="font-medium text-xl"
                          style={{ color: isCurrent ? GOLD : "rgba(255,255,255,0.85)" }}
                        >
                          {formatPrayerTime(prayer.time)}
                        </Text>
                        {isNext && (
                          <Text className="text-xs mt-0.5 text-white/70">{t("prayer.inTime")} {timeUntilNext}</Text>
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
              <Text className="text-sm font-medium mb-3 uppercase tracking-wider" style={{ color: GOLD }}>
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
                    <Text className="text-xs text-white/90">{t("prayer.change")}</Text>
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
