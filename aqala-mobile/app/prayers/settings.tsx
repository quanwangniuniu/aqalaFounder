import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { usePrayer } from "@/contexts/PrayerContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { CALCULATION_METHODS, PrayerName } from "@/lib/prayer/calculations";
import { Ionicons } from "@expo/vector-icons";
import WallpaperBackground from "@/components/WallpaperBackground";

const ADHAN_PRAYERS: { key: PrayerName; label: string; labelAr: string }[] = [
  { key: "fajr", label: "Fajr", labelAr: "الفجر" },
  { key: "sunrise", label: "Sunrise", labelAr: "الشروق" },
  { key: "dhuhr", label: "Dhuhr", labelAr: "الظهر" },
  { key: "asr", label: "Asr", labelAr: "العصر" },
  { key: "maghrib", label: "Maghrib", labelAr: "المغرب" },
  { key: "isha", label: "Isha", labelAr: "العشاء" },
];

export default function PrayerSettingsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { getDarkestColor } = usePreferences();
  const darkBg = getDarkestColor();
  const { settings, setMethod, setSchool, toggleAdhan } = usePrayer();

  return (
    <WallpaperBackground edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.05)",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.05)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="chevron-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>Prayer Settings</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 500, alignSelf: "center", width: "100%", padding: 20, gap: 24 }}>
          {/* ── Adhan Notifications ── */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Ionicons name="notifications" size={18} color="#D4AF37" />
              <Text style={{ color: "#D4AF37", fontSize: 13, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>
                Adhan Notifications
              </Text>
            </View>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16, lineHeight: 18 }}>
              Enable the adhan call for specific prayer times. You'll receive a notification with the adhan sound.
            </Text>

            <View style={{ gap: 8 }}>
              {ADHAN_PRAYERS.map((prayer) => {
                const enabled = settings.adhan?.[prayer.key] ?? false;
                return (
                  <TouchableOpacity
                    key={prayer.key}
                    onPress={() => toggleAdhan(prayer.key)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 14,
                      borderRadius: 14,
                      backgroundColor: enabled ? "rgba(212, 175, 55, 0.08)" : "rgba(255,255,255,0.04)",
                      borderWidth: 1,
                      borderColor: enabled ? "rgba(212, 175, 55, 0.25)" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          backgroundColor: enabled ? "rgba(212, 175, 55, 0.15)" : "rgba(255,255,255,0.06)",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons
                          name={enabled ? "notifications" : "notifications-off-outline"}
                          size={20}
                          color={enabled ? "#D4AF37" : "rgba(255,255,255,0.3)"}
                        />
                      </View>
                      <View>
                        <Text style={{ color: enabled ? "white" : "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: "500" }}>
                          {prayer.label}
                        </Text>
                        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{prayer.labelAr}</Text>
                      </View>
                    </View>

                    {/* Toggle indicator */}
                    <View
                      style={{
                        width: 48,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: enabled ? "#D4AF37" : "rgba(255,255,255,0.1)",
                        padding: 2,
                        justifyContent: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: enabled ? darkBg : "rgba(255,255,255,0.3)",
                          alignSelf: enabled ? "flex-end" : "flex-start",
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Calculation Method ── */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Ionicons name="calculator-outline" size={18} color="#D4AF37" />
              <Text style={{ color: "#D4AF37", fontSize: 13, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>
                Calculation Method
              </Text>
            </View>

            <View style={{ gap: 6 }}>
              {CALCULATION_METHODS.map((method) => {
                const selected = settings.method === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => setMethod(method.id)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 14,
                      borderRadius: 14,
                      backgroundColor: selected ? "rgba(212, 175, 55, 0.08)" : "rgba(255,255,255,0.04)",
                      borderWidth: 1,
                      borderColor: selected ? "rgba(212, 175, 55, 0.25)" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? "#D4AF37" : "rgba(255,255,255,0.7)",
                        fontSize: 14,
                        fontWeight: selected ? "600" : "400",
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {method.name}
                    </Text>
                    {selected && <Ionicons name="checkmark-circle" size={20} color="#D4AF37" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── School ── */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Ionicons name="school-outline" size={18} color="#D4AF37" />
              <Text style={{ color: "#D4AF37", fontSize: 13, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>
                Asr Calculation
              </Text>
            </View>

            <View style={{ gap: 6 }}>
              {[
                { id: 0, name: "Shafi'i / Standard", desc: "Shadow equals object length" },
                { id: 1, name: "Hanafi", desc: "Shadow equals twice object length" },
              ].map((school) => {
                const selected = settings.school === school.id;
                return (
                  <TouchableOpacity
                    key={school.id}
                    onPress={() => setSchool(school.id as 0 | 1)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 14,
                      borderRadius: 14,
                      backgroundColor: selected ? "rgba(212, 175, 55, 0.08)" : "rgba(255,255,255,0.04)",
                      borderWidth: 1,
                      borderColor: selected ? "rgba(212, 175, 55, 0.25)" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: selected ? "#D4AF37" : "rgba(255,255,255,0.7)",
                          fontSize: 14,
                          fontWeight: selected ? "600" : "400",
                        }}
                      >
                        {school.name}
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>
                        {school.desc}
                      </Text>
                    </View>
                    {selected && <Ionicons name="checkmark-circle" size={20} color="#D4AF37" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </WallpaperBackground>
  );
}
