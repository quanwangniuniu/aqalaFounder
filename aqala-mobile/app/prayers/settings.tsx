import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePrayer } from "@/contexts/PrayerContext";
import {
  CALCULATION_METHODS,
  CalculationMethod,
  School,
  getMethodName,
} from "@/lib/prayer/calculations";
import WallpaperBackground from "@/components/WallpaperBackground";

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
  const {
    settings,
    location,
    setMethod,
    setSchool,
    setAdjustment,
    refreshLocation,
  } = usePrayer();

  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);

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
            <Text className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
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
                        className={`flex-row items-center justify-between px-4 py-3.5 ${
                          isSelected ? "bg-[#D4AF37]/10" : ""
                        }`}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`text-sm ${
                            isSelected ? "text-[#D4AF37] font-medium" : "text-white"
                          }`}
                        >
                          {method.name}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color="#D4AF37"
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
                        className={`flex-1 p-3 rounded-lg border ${
                          isSelected
                            ? "bg-[#D4AF37]/10 border-[#D4AF37]/30"
                            : "border-white/10"
                        }`}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`font-medium text-sm ${
                            isSelected ? "text-[#D4AF37]" : "text-white"
                          }`}
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

          {/* ── Location Section ── */}
          <View>
            <Text className="text-sm font-medium text-[#D4AF37] mb-3 uppercase tracking-wider">
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
          <View className="bg-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/10 p-4">
            <View className="flex-row gap-3">
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#D4AF37"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <View className="flex-1">
                <Text className="text-sm text-white/60 mb-2">
                  <Text className="text-[#D4AF37] font-semibold">
                    Calculation Methods
                  </Text>{" "}
                  differ based on the angle of the sun used to determine Fajr
                  and Isha times. Choose the method used in your region.
                </Text>
                <Text className="text-sm text-white/60">
                  <Text className="text-[#D4AF37] font-semibold">
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
