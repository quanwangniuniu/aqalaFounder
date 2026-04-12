import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  Linking,
  Modal,
  FlatList,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import {
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
} from "expo-audio";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useLanguage,
  LANGUAGE_OPTIONS,
  type LanguageOption,
} from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import WallpaperBackground from "@/components/WallpaperBackground";

const ONBOARDING_KEY = "aqala_permissions_onboarded";
const GOLD = "#D4AF37";

interface PermissionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  reason: string;
  detail: string;
  granted: boolean | null;
  onRequest: () => void;
  loading: boolean;
}

function PermissionCard({
  icon,
  title,
  reason,
  detail,
  granted,
  onRequest,
  loading,
}: PermissionCardProps) {
  return (
    <View
      style={{
        backgroundColor:
          granted === true ? `${GOLD}08` : "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor:
          granted === true ? `${GOLD}35` : "rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: 18,
        marginBottom: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor:
              granted === true ? `${GOLD}1A` : "rgba(255,255,255,0.05)",
            borderWidth: 1,
            borderColor:
              granted === true ? `${GOLD}25` : "rgba(255,255,255,0.06)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={icon}
            size={22}
            color={granted === true ? GOLD : "rgba(255,255,255,0.5)"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ color: "#fff", fontSize: 17, fontWeight: "600" }}
          >
            {title}
          </Text>
          {granted !== null && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 3,
              }}
            >
              <Ionicons
                name={granted ? "checkmark-circle" : "close-circle"}
                size={13}
                color={granted ? "#4ade80" : "#f87171"}
              />
              <Text
                style={{
                  color: granted ? "#4ade80" : "#f87171",
                  fontSize: 12,
                  fontWeight: "500",
                }}
              >
                {granted ? "Granted" : "Denied"}
              </Text>
            </View>
          )}
        </View>

        {granted === null && (
          <Pressable
            onPress={onRequest}
            disabled={loading}
            style={{
              shadowColor: GOLD,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <LinearGradient
              colors={[GOLD, "#b8944d"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 11,
                borderRadius: 12,
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text
                style={{
                  color: "#032117",
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                {loading ? "..." : "Allow"}
              </Text>
            </LinearGradient>
          </Pressable>
        )}

        {granted === false && (
          <Pressable
            onPress={() => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 11,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                Settings
              </Text>
            </View>
          </Pressable>
        )}

        {granted === true && (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: `${GOLD}20`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="checkmark" size={16} color="#4ade80" />
          </View>
        )}
      </View>

      <Text
        style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: 14,
          lineHeight: 20,
        }}
      >
        {reason}
      </Text>

      <Text
        style={{
          color: "rgba(255,255,255,0.3)",
          fontSize: 12,
          lineHeight: 17,
          marginTop: 4,
        }}
      >
        {detail}
      </Text>
    </View>
  );
}

function LanguageDropdown() {
  const { language, setLanguage, getLanguageOption } = useLanguage();
  const { getGradientColors } = usePreferences();
  const gradientColors = getGradientColors();
  const sheetBg = gradientColors[0] ?? "#032117";
  const [open, setOpen] = useState(false);
  const current = getLanguageOption(language);

  const renderItem = ({ item }: { item: LanguageOption }) => {
    const selected = item.code === language;
    return (
      <Pressable
        onPress={() => {
          setLanguage(item.code);
          setOpen(false);
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          paddingHorizontal: 20,
          backgroundColor: selected ? `${GOLD}15` : "transparent",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: selected ? GOLD : "#fff",
              fontSize: 15,
              fontWeight: selected ? "600" : "400",
            }}
          >
            {item.label}
          </Text>
          <Text
            style={{
              color: selected ? `${GOLD}CC` : "rgba(255,255,255,0.4)",
              fontSize: 12,
            }}
          >
            {item.nativeLabel}
          </Text>
        </View>
        {selected && <Ionicons name="checkmark" size={18} color={GOLD} />}
      </Pressable>
    );
  };

  return (
    <>
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: GOLD,
            fontSize: 12,
            fontWeight: "600",
            marginBottom: 8,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Preferred Language
        </Text>
        <Pressable
          onPress={() => setOpen(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.03)",
            borderWidth: 1,
            borderColor: `${GOLD}30`,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: `${GOLD}15`,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="language-outline" size={18} color={GOLD} />
          </View>
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "500",
              flex: 1,
            }}
          >
            {current?.label}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color="rgba(255,255,255,0.4)"
          />
        </Pressable>
        <Text
          style={{
            color: "rgba(255,255,255,0.25)",
            fontSize: 12,
            marginTop: 6,
          }}
        >
          You can change this anytime in settings
        </Text>
      </View>

      <Modal visible={open} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: sheetBg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "70%",
              borderTopWidth: 1,
              borderColor: `${GOLD}25`,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 12,
              }}
            >
              <Text
                style={{ color: "#fff", fontSize: 17, fontWeight: "600" }}
              >
                Select Language
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color="#fff" />
              </Pressable>
            </View>
            <FlatList
              data={LANGUAGE_OPTIONS}
              keyExtractor={(item) => item.code}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              ItemSeparatorComponent={() => (
                <View
                  style={{
                    height: 1,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    marginHorizontal: 20,
                  }}
                />
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeFirstVisit } = useLanguage();
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const [micGranted, setMicGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [locStatus, micStatus] = await Promise.all([
          Location.getForegroundPermissionsAsync(),
          getRecordingPermissionsAsync(),
        ]);
        if (locStatus.granted) setLocationGranted(true);
        if (micStatus.granted) setMicGranted(true);

        if (locStatus.granted && micStatus.granted) {
          await AsyncStorage.setItem(ONBOARDING_KEY, "true");
          if (Platform.OS === "ios") {
            try {
              await requestTrackingPermissionsAsync();
            } catch {}
          }
          completeFirstVisit();
          router.replace("/(tabs)");
        }
      } catch (e) {
        console.error("Permission pre-check error:", e);
      }
    })();
  }, []);

  const requestLocation = async () => {
    setLoading("location");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationGranted(status === "granted");
    } catch (e) {
      console.error("Location permission error:", e);
      setLocationGranted(false);
    }
    setLoading(null);
  };

  const requestMicrophone = async () => {
    setLoading("microphone");
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      setMicGranted(granted);
    } catch (e) {
      console.error("Microphone permission error:", e);
      setMicGranted(false);
    }
    setLoading(null);
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    if (Platform.OS === "ios") {
      try {
        await requestTrackingPermissionsAsync();
      } catch {}
    }
    completeFirstVisit();
    router.replace("/(tabs)");
  };

  const bothAnswered = locationGranted !== null && micGranted !== null;

  return (
    <WallpaperBackground edges={["top", "bottom"]}>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        {/* ── Scrollable content ── */}
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          {/* Logo */}
          <View style={{ alignItems: "center", marginTop: 12, marginBottom: 8 }}>
            <Image
              source={require("@/assets/aqala-logo.png")}
              style={{ width: 72, height: 38, tintColor: "white" }}
              resizeMode="contain"
            />
          </View>

          {/* Hero */}
          <View style={{ alignItems: "center", marginTop: 8, marginBottom: 28 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                backgroundColor: `${GOLD}18`,
                borderWidth: 1,
                borderColor: `${GOLD}30`,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="shield-checkmark" size={30} color={GOLD} />
            </View>
            <Text
              style={{
                color: "#fff",
                fontSize: 26,
                fontWeight: "700",
                textAlign: "center",
                marginBottom: 8,
                letterSpacing: -0.3,
              }}
            >
              Quick Setup
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 15,
                textAlign: "center",
                lineHeight: 22,
                maxWidth: 310,
              }}
            >
              Pick your language and grant a couple of permissions to get the
              best experience.
            </Text>
          </View>

          {/* Language */}
          <LanguageDropdown />

          {/* Permissions section label */}
          <Text
            style={{
              color: GOLD,
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 10,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Permissions
          </Text>

          <PermissionCard
            icon="location-outline"
            title="Location"
            reason="Used to calculate accurate prayer times for your area and point you towards the Qibla."
            detail="Your location is only accessed while the app is open and never stored or shared."
            granted={locationGranted}
            onRequest={requestLocation}
            loading={loading === "location"}
          />

          <PermissionCard
            icon="mic-outline"
            title="Microphone"
            reason="Required for live translation — lets Aqala listen to a khutbah and translate in real time."
            detail="Audio is processed in real time and never recorded. Only active when you tap 'Start Listening'."
            granted={micGranted}
            onRequest={requestMicrophone}
            loading={loading === "microphone"}
          />
        </View>

        {/* ── Bottom CTA (pinned) ── */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingBottom: 16,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.06)",
          }}
        >
          {bothAnswered ? (
            <Pressable
              onPress={finishOnboarding}
              style={{
                shadowColor: GOLD,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 10,
                elevation: 6,
              }}
            >
              <LinearGradient
                colors={[GOLD, "#b8944d"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 16,
                  borderRadius: 14,
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    color: "#032117",
                    fontSize: 17,
                    fontWeight: "700",
                  }}
                >
                  Continue to Aqala
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#032117" />
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable onPress={finishOnboarding}>
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 16,
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  Skip for now
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </WallpaperBackground>
  );
}
