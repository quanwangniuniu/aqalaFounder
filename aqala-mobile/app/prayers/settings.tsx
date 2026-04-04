import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Platform,
} from "react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePrayer } from "@/contexts/PrayerContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { requestPrayerNotificationPermission } from "@/lib/prayer/prayerNotifications";
import {
  CALCULATION_METHODS,
  CalculationMethod,
  School,
  getMethodName,
} from "@/lib/prayer/calculations";
import WallpaperBackground from "@/components/WallpaperBackground";

const GOLD = "#D4AF37";

const SCHOOL_OPTIONS: { value: School; label: string; desc: string }[] = [
  { value: 0, label: "Standard", desc: "Shafi'i, Maliki, Hanbali" },
  { value: 1, label: "Hanafi", desc: "Later Asr time" },
];

const ADJUSTMENT_PRAYERS = [
  { key: "fajr" as const, label: "Fajr" },
  { key: "sunrise" as const, label: "Sunrise" },
  { key: "dhuhr" as const, label: "Dhuhr" },
  { key: "asr" as const, label: "Asr" },
  { key: "maghrib" as const, label: "Maghrib" },
  { key: "isha" as const, label: "Isha" },
];

export default function PrayerSettingsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { getAccentColor } = usePreferences();
  const accent = getAccentColor();
  const {
    settings,
    location,
    setMethod,
    setSchool,
    setAdjustment,
    refreshLocation,
    notificationPrefs,
    updateNotificationPrefs,
  } = usePrayer();

  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [notifPerm, setNotifPerm] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;
    Notifications.getPermissionsAsync().then(({ status }) =>
      setNotifPerm(status),
    );
  }, [notificationPrefs.enabled]);

  const openSystemSettings = () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      Linking.openSettings();
    }
  };

  const onMasterNotifChange = async (on: boolean) => {
    if (Platform.OS === "web") {
      Alert.alert("Not available", "Prayer notifications are not supported on web.");
      return;
    }
    if (on) {
      const ok = await requestPrayerNotificationPermission();
      setNotifPerm(ok ? "granted" : "denied");
      if (!ok) {
        Alert.alert(
          t("prayer.notifPermissionDenied"),
          t("prayer.notifPermissionBody"),
          [
            { text: t("share.cancel"), style: "cancel" },
            { text: t("prayer.openSettings"), onPress: openSystemSettings },
          ],
        );
        return;
      }
    }
    updateNotificationPrefs({ enabled: on });
  };

  return (
    <WallpaperBackground edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-6 border-b border-white/5">
        <View
          style={{ maxWidth: 500, alignSelf: "center", width: "100%" }}
        >
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-8 h-8 rounded-full bg-white/5 items-center justify-center"
            >
              <Ionicons name="chevron-back" size={18} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-white">
              Prayer Settings
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="px-5 py-6 gap-6"
          style={{ maxWidth: 500, alignSelf: "center", width: "100%" }}
        >
          {/* ── Calculation Section ── */}
          <View>
            <Text className="text-sm font-medium mb-3 uppercase tracking-wider" style={{ color: GOLD }}>
              Calculation
            </Text>

            <View className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
              {/* Method Selector */}
              <TouchableOpacity
                onPress={() => setShowMethodPicker((v) => !v)}
                className="flex-row items-center justify-between p-4"
                activeOpacity={0.7}
              >
                <View className="flex-1 mr-3">
                  <Text className="text-white font-medium">Method</Text>
                  <Text className="text-sm text-white/50 mt-0.5">
                    {getMethodName(settings.method)}
                  </Text>
                </View>
                <Ionicons
                  name={showMethodPicker ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="rgba(255,255,255,0.4)"
                />
              </TouchableOpacity>

              {/* Method Picker List */}
              {showMethodPicker && (
                <View className="border-t border-white/5 bg-black/20">
                  {CALCULATION_METHODS.map((method) => {
                    const isSelected = settings.method === method.id;
                    return (
                      <TouchableOpacity
                        key={method.id}
                        onPress={() => {
                          setMethod(method.id as CalculationMethod);
                          setShowMethodPicker(false);
                        }}
                        className={`flex-row items-center justify-between px-4 py-3.5 ${isSelected ? "" : ""}`}
                        style={isSelected ? { backgroundColor: `${accent.base}20` } : undefined}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`text-sm ${isSelected ? "font-medium" : ""}`}
                          style={{ color: isSelected ? GOLD : "white" }}
                        >
                          {method.name}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={GOLD}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <View className="border-t border-white/5" />

              {/* School (Asr calculation) */}
              <View className="p-4">
                <Text className="text-white font-medium mb-3">
                  School (Asr calculation)
                </Text>
                <View className="flex-row gap-2">
                  {SCHOOL_OPTIONS.map((option) => {
                    const isSelected = settings.school === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setSchool(option.value)}
                        className={`flex-1 p-3 rounded-lg border ${!isSelected ? "border-white/10" : ""}`}
                        style={isSelected ? { backgroundColor: `${accent.base}20`, borderColor: `${accent.base}50` } : undefined}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`font-medium text-sm ${!isSelected ? "text-white" : ""}`}
                          style={isSelected ? { color: GOLD } : undefined}
                        >
                          {option.label}
                        </Text>
                        <Text className="text-xs text-white/40 mt-0.5">
                          {option.desc}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View className="border-t border-white/5" />

              {/* Manual Adjustments Toggle */}
              <TouchableOpacity
                onPress={() => setShowAdjustments((v) => !v)}
                className="flex-row items-center justify-between p-4"
                activeOpacity={0.7}
              >
                <View className="flex-1 mr-3">
                  <Text className="text-white font-medium">
                    Manual Adjustments
                  </Text>
                  <Text className="text-sm text-white/50 mt-0.5">
                    Fine-tune prayer times (±minutes)
                  </Text>
                </View>
                <Ionicons
                  name={showAdjustments ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="rgba(255,255,255,0.4)"
                />
              </TouchableOpacity>

              {/* Adjustments Panel */}
              {showAdjustments && (
                <View className="border-t border-white/5 bg-black/20 p-4 gap-4">
                  <Text className="text-xs text-white/40">
                    Adjust each prayer time by minutes. Positive values delay
                    the time, negative values advance it.
                  </Text>
                  {ADJUSTMENT_PRAYERS.map((prayer) => {
                    const value = settings.adjustments[prayer.key];
                    return (
                      <View
                        key={prayer.key}
                        className="flex-row items-center justify-between"
                      >
                        <Text className="text-sm text-white">
                          {prayer.label}
                        </Text>
                        <View className="flex-row items-center gap-2">
                          <TouchableOpacity
                            onPress={() =>
                              setAdjustment(prayer.key, value - 1)
                            }
                            className="w-8 h-8 rounded-lg bg-white/5 items-center justify-center"
                            activeOpacity={0.6}
                          >
                            <Ionicons
                              name="remove"
                              size={16}
                              color="white"
                            />
                          </TouchableOpacity>
                          <Text className="w-12 text-center text-sm text-white font-mono">
                            {value >= 0 ? "+" : ""}
                            {value}m
                          </Text>
                          <TouchableOpacity
                            onPress={() =>
                              setAdjustment(prayer.key, value + 1)
                            }
                            className="w-8 h-8 rounded-lg bg-white/5 items-center justify-center"
                            activeOpacity={0.6}
                          >
                            <Ionicons name="add" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {/* ── Notifications (local) ── */}
          {Platform.OS !== "web" ? (
            <View>
              <Text
                className="text-sm font-medium mb-3 uppercase tracking-wider"
                style={{ color: GOLD }}
              >
                {t("prayer.notifSection")}
              </Text>

              <View className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
                <View className="flex-row items-center justify-between p-4">
                  <View className="flex-1 mr-3">
                    <Text className="text-white font-medium">
                      {t("prayer.notifMaster")}
                    </Text>
                    <Text className="text-sm text-white/50 mt-0.5">
                      {t("prayer.notifMasterHint")}
                    </Text>
                  </View>
                  <Switch
                    value={notificationPrefs.enabled}
                    onValueChange={onMasterNotifChange}
                    trackColor={{
                      false: "rgba(255,255,255,0.12)",
                      true: `${accent.base}99`,
                    }}
                    thumbColor={
                      notificationPrefs.enabled ? accent.base : "#888"
                    }
                  />
                </View>

                {notificationPrefs.enabled &&
                  notifPerm &&
                  notifPerm !== "granted" && (
                    <TouchableOpacity
                      onPress={openSystemSettings}
                      className="mx-4 mb-3 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30"
                    >
                      <Text className="text-amber-200 text-xs">
                        {t("prayer.notifPermissionBody")}
                      </Text>
                      <Text className="text-amber-100 text-xs font-semibold mt-1">
                        {t("prayer.openSettings")} →
                      </Text>
                    </TouchableOpacity>
                  )}

              </View>
            </View>
          ) : null}

          {/* ── Location Section ── */}
          <View>
            <Text className="text-sm font-medium mb-3 uppercase tracking-wider" style={{ color: GOLD }}>
              Location
            </Text>

            <View className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
              <View className="p-4 flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-white font-medium">
                    Current Location
                  </Text>
                  {location ? (
                    <Text className="text-sm text-white/50 mt-0.5">
                      {location.city && location.country
                        ? `${location.city}, ${location.country}`
                        : `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                    </Text>
                  ) : (
                    <Text className="text-sm text-white/50 mt-0.5">
                      Not set
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={refreshLocation}
                  className="px-4 py-2 bg-white/10 rounded-lg"
                  activeOpacity={0.7}
                >
                  <Text className="text-sm text-white">Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Info Section ── */}
          <View className="rounded-xl border p-4" style={{ backgroundColor: `${accent.base}0D`, borderColor: `${accent.base}20` }}>
            <View className="flex-row gap-3">
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={GOLD}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <View className="flex-1">
                <Text className="text-sm text-white/60 mb-2">
                  <Text className="font-semibold text-white">
                    Calculation Methods
                  </Text>{" "}
                  differ based on the angle of the sun used to determine Fajr
                  and Isha times. Choose the method used in your region.
                </Text>
                <Text className="text-sm text-white/60">
                  <Text className="font-semibold text-white">
                    School
                  </Text>{" "}
                  affects Asr timing: Standard (Shafi&apos;i) calculates when
                  shadow equals object height, Hanafi when it equals twice the
                  height.
                </Text>
              </View>
            </View>
          </View>

          {/* Data source */}
          <Text className="text-xs text-white/20 text-center pt-4">
            Prayer times provided by Aladhan API
          </Text>
        </View>
      </ScrollView>
    </WallpaperBackground>
  );
}
