import { useState, useEffect } from "react";
import { View, Text, Pressable, Platform, Linking, Modal, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { requestRecordingPermissionsAsync, getRecordingPermissionsAsync } from "expo-audio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage, LANGUAGE_OPTIONS, type LanguageOption } from "@/contexts/LanguageContext";

const ONBOARDING_KEY = "aqala_permissions_onboarded";

interface PermissionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  reason: string;
  detail: string;
  granted: boolean | null;
  onRequest: () => void;
  loading: boolean;
}

function PermissionCard({ icon, title, reason, detail, granted, onRequest, loading }: PermissionCardProps) {
  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: granted ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: granted ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.08)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={20} color={granted ? "#D4AF37" : "rgba(255,255,255,0.6)"} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>{title}</Text>
          {granted !== null && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 }}>
              <Ionicons
                name={granted ? "checkmark-circle" : "close-circle"}
                size={12}
                color={granted ? "#4ade80" : "#f87171"}
              />
              <Text style={{ color: granted ? "#4ade80" : "#f87171", fontSize: 11, fontWeight: "500" }}>
                {granted ? "Granted" : "Denied"}
              </Text>
            </View>
          )}
        </View>

        {granted === null && (
          <Pressable onPress={onRequest} disabled={loading}>
            <LinearGradient
              colors={["#D4AF37", "#b8944d"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 10,
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "#032117", fontSize: 13, fontWeight: "600" }}>
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
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.15)",
              }}
            >
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "500" }}>
                Settings
              </Text>
            </View>
          </Pressable>
        )}

        {granted === true && (
          <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
        )}
      </View>

      <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 19 }}>
        {reason}
      </Text>

      <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, lineHeight: 16, marginTop: 4 }}>
        {detail}
      </Text>
    </View>
  );
}

function LanguageDropdown() {
  const { language, setLanguage, getLanguageOption } = useLanguage();
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
          backgroundColor: selected ? "rgba(212,175,55,0.12)" : "transparent",
        }}
      >
        <Text style={{ fontSize: 20, marginRight: 12 }}>{item.flag}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: selected ? "#E8D5A3" : "#fff", fontSize: 15, fontWeight: selected ? "600" : "400" }}>
            {item.label}
          </Text>
          <Text style={{ color: selected ? "rgba(212,175,55,0.7)" : "rgba(255,255,255,0.4)", fontSize: 12 }}>
            {item.nativeLabel}
          </Text>
        </View>
        {selected && <Ionicons name="checkmark" size={18} color="#D4AF37" />}
      </Pressable>
    );
  };

  return (
    <>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "500", marginBottom: 6, letterSpacing: 0.5 }}>
          PREFERRED LANGUAGE
        </Text>
        <Pressable
          onPress={() => setOpen(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.05)",
            borderWidth: 1,
            borderColor: "rgba(212,175,55,0.25)",
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        >
          <Text style={{ fontSize: 18, marginRight: 10 }}>{current?.flag}</Text>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "500", flex: 1 }}>{current?.label}</Text>
          <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.4)" />
        </Pressable>
        <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 4 }}>
          You can change this anytime in settings
        </Text>
      </View>

      <Modal visible={open} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: "#032117",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "70%",
              borderTopWidth: 1,
              borderColor: "rgba(212,175,55,0.2)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "600" }}>Select Language</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color="rgba(255,255,255,0.5)" />
              </Pressable>
            </View>
            <FlatList
              data={LANGUAGE_OPTIONS}
              keyExtractor={(item) => item.code}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginHorizontal: 20 }} />
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
    completeFirstVisit();
    router.replace("/(tabs)");
  };

  const bothAnswered = locationGranted !== null && micGranted !== null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#032117" }} edges={["top", "bottom"]}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: "space-between" }}>
        <View>
          <View style={{ alignItems: "center", marginTop: 16, marginBottom: 24 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: "rgba(212,175,55,0.12)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons name="shield-checkmark" size={28} color="#D4AF37" />
            </View>
            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 6 }}>
              Quick Setup
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: 14,
                textAlign: "center",
                lineHeight: 20,
                maxWidth: 300,
              }}
            >
              Pick your language and grant a couple of permissions to get the best experience.
            </Text>
          </View>

          <LanguageDropdown />

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

        <View style={{ paddingBottom: 8 }}>
          {bothAnswered ? (
            <Pressable onPress={finishOnboarding}>
              <LinearGradient
                colors={["#D4AF37", "#b8944d"]}
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
                <Text style={{ color: "#032117", fontSize: 17, fontWeight: "700" }}>Continue to Aqala</Text>
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
                <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: "500" }}>
                  Skip for now
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
