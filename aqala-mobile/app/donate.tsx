import { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { usePreferences } from "@/contexts/PreferencesContext";
import WallpaperBackground from "@/components/WallpaperBackground";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || "https://aqala.io";

const PRESET_AMOUNTS = [7, 20, 50];

function formatMoney(n: number, currency: string = "$") {
  if (!Number.isFinite(n)) return `${currency}0.00`;
  return `${currency}${n.toFixed(2)}`;
}

// ─────────────────────────────────────────────
// Donation Modal
// ─────────────────────────────────────────────
function DonationModal({
  visible,
  onClose,
  darkBg,
}: {
  visible: boolean;
  onClose: () => void;
  darkBg: string;
}) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(PRESET_AMOUNTS[0]);
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const tipAmount = useMemo(() => {
    if (customMode) {
      const n = parseFloat(customValue.replace(/[^\d.]/g, ""));
      return Number.isFinite(n) ? Math.max(0, n) : 0;
    }
    return typeof selectedPreset === "number" ? selectedPreset : 0;
  }, [customMode, customValue, selectedPreset]);

  const handleDonate = async () => {
    if (tipAmount <= 0) {
      Alert.alert("Invalid amount", "Please select or enter a donation amount.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${WEB_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: tipAmount, currency: "aud" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        // Open Stripe checkout in an in-app browser
        await WebBrowser.openBrowserAsync(data.url, {
          dismissButtonStyle: "close",
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          toolbarColor: darkBg,
          controlsColor: "#D4AF37",
        });
        onClose();
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setCustomMode(false);
    setSelectedPreset(PRESET_AMOUNTS[0]);
    setCustomValue("");
    setIsLoading(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onShow={resetState}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Backdrop */}
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={onClose}
        />

        {/* Modal Content */}
        <View
          style={{
            backgroundColor: darkBg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
            borderBottomWidth: 0,
            paddingBottom: Platform.OS === "ios" ? 34 : 16,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.05)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "rgba(212,175,55,0.1)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="heart" size={20} color="#D4AF37" />
              </View>
              <View>
                <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>
                  Support Aqala
                </Text>
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  All proceeds go directly to charity
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>

          {/* Amount Display */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              backgroundColor: "rgba(255,255,255,0.02)",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              Donation Amount
            </Text>
            <Text style={{ fontSize: 32, fontWeight: "700", color: "#D4AF37" }}>
              <Text style={{ fontSize: 26, opacity: 0.7 }}>$</Text>
              {tipAmount.toFixed(2)}
            </Text>
          </View>

          {/* Preset Amounts */}
          <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              {PRESET_AMOUNTS.map((amt, idx) => {
                const active = !customMode && selectedPreset === amt;
                return (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => {
                      setCustomMode(false);
                      setSelectedPreset(amt);
                    }}
                    style={{
                      flex: 1,
                      height: 56,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: active
                        ? "rgba(212,175,55,0.15)"
                        : "rgba(255,255,255,0.05)",
                      borderWidth: active ? 2 : 1,
                      borderColor: active ? "#D4AF37" : "rgba(255,255,255,0.1)",
                      position: "relative",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: active ? "#D4AF37" : "white",
                      }}
                    >
                      <Text style={{ fontSize: 15, opacity: 0.7 }}>$</Text>
                      {amt.toFixed(2)}
                    </Text>

                    {idx === 0 && (
                      <View
                        style={{
                          position: "absolute",
                          bottom: -8,
                          alignSelf: "center",
                          backgroundColor: "#D4AF37",
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 999,
                        }}
                      >
                        <Text style={{ fontSize: 9, fontWeight: "700", color: darkBg }}>
                          Most Popular
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Amount */}
            {!customMode ? (
              <TouchableOpacity
                onPress={() => setCustomMode(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 8,
                }}
              >
                <Ionicons name="create-outline" size={16} color="rgba(255,255,255,0.6)" />
                <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                  Enter custom amount
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ fontSize: 22, color: "rgba(255,255,255,0.5)" }}>$</Text>
                <TextInput
                  autoFocus
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={customValue}
                  onChangeText={setCustomValue}
                  style={{
                    flex: 1,
                    fontSize: 24,
                    color: "white",
                    borderBottomWidth: 2,
                    borderBottomColor: "rgba(212,175,55,0.5)",
                    paddingVertical: 8,
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    setCustomMode(false);
                    setCustomValue("");
                  }}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="close" size={16} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Donate Button */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 8,
              borderTopWidth: 1,
              borderTopColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Secure payment via Stripe
            </Text>
            <TouchableOpacity
              onPress={handleDonate}
              disabled={isLoading || tipAmount <= 0}
              activeOpacity={0.85}
              style={{ opacity: isLoading || tipAmount <= 0 ? 0.5 : 1 }}
            >
              <LinearGradient
                colors={["#D4AF37", "#c9a431"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 56,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isLoading ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <ActivityIndicator size="small" color={darkBg} />
                    <Text style={{ fontSize: 17, fontWeight: "600", color: darkBg }}>
                      Processing...
                    </Text>
                  </View>
                ) : (
                  <Text style={{ fontSize: 17, fontWeight: "700", color: darkBg }}>
                    Donate {formatMoney(tipAmount)}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// Donate Page
// ─────────────────────────────────────────────
export default function DonateScreen() {
  const { getDarkestColor } = usePreferences();
  const darkBg = getDarkestColor();
  const router = useRouter();
  const [donateOpen, setDonateOpen] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Aqala — Real-time translation for Islamic knowledge\nhttps://aqala.io",
        url: "https://aqala.io",
        title: "Aqala",
      });
    } catch {
      // User cancelled
    }
  };

  return (
    <WallpaperBackground edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.1)",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.6)" />
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>Support Aqala</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 500, alignSelf: "center", width: "100%", padding: 16, gap: 24 }}>
          {/* Hero Section */}
          <View style={{ alignItems: "center", gap: 16, paddingTop: 16 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: "rgba(212,175,55,0.2)",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#D4AF37",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <LinearGradient
                colors={["rgba(212,175,55,0.3)", "rgba(212,175,55,0.1)"]}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 40 }}>🤲</Text>
              </LinearGradient>
            </View>
            <Text style={{ fontSize: 24, fontWeight: "700", color: "white" }}>Sadaqah Jariyah</Text>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
              Ongoing charity that continues to benefit
            </Text>
          </View>

          {/* Quranic Verse Card */}
          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              padding: 24,
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          >
            <View style={{ alignItems: "center", gap: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 26,
                  textAlign: "center",
                }}
              >
                {"\u201C"}Then do they not reflect upon the Qur'an, or are there locks upon their
                hearts?{"\u201D"}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "500", color: "#D4AF37" }}>
                Qur'an 47:24
              </Text>
            </View>
          </View>

          {/* Mission Section */}
          <View style={{ gap: 12 }}>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                padding: 20,
              }}
            >
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 22 }}>
                <Text style={{ color: "#D4AF37", fontWeight: "600" }}>Aqala</Text> helps transform
                spoken Islamic knowledge into understanding — no matter the language — allowing
                knowledge to reach the heart.
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                padding: 20,
              }}
            >
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 22 }}>
                The Prophet <Text style={{ color: "#D4AF37" }}>ﷺ</Text> taught that beneficial
                knowledge continues to reward a person even after death.
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  {" "}
                  (Sahih Muslim)
                </Text>
              </Text>
            </View>

            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(212,175,55,0.2)",
                padding: 20,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["rgba(212,175,55,0.1)", "transparent"]}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 16,
                }}
              />
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 22 }}>
                By supporting Aqala, you help create ongoing access to understanding for the global{" "}
                <Text style={{ color: "#D4AF37", fontWeight: "600" }}>Ummah</Text> — a form of{" "}
                <Text style={{ color: "#D4AF37", fontWeight: "600" }}>Sadaqah Jariyah</Text>,
                inshaAllah.
              </Text>
            </View>
          </View>

          {/* Call to Action */}
          <View style={{ alignItems: "center", gap: 8, paddingTop: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "white", textAlign: "center" }}>
              Be the reason someone understands.
            </Text>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
              One donation. Endless understanding.
            </Text>
          </View>

          {/* Donate Button */}
          <TouchableOpacity
            onPress={() => setDonateOpen(true)}
            activeOpacity={0.85}
            style={{
              shadowColor: "#D4AF37",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={["#D4AF37", "#b8944d"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 56,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: darkBg }}>
                Donate to Aqala
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Alternative Actions */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.6)",
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              If you're unable to donate, sharing Aqala, leaving a review, or making du'ā' for this
              project is also deeply appreciated.
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 12,
                marginTop: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => router.push("/reviews")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Ionicons name="chatbubble-outline" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Leave Review</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Ionicons name="share-outline" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Du'a Section */}
          <View style={{ alignItems: "center", gap: 12, paddingTop: 16, paddingBottom: 32 }}>
            <Text
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.8)",
                lineHeight: 30,
                textAlign: "center",
                writingDirection: "rtl",
              }}
            >
              اللهم انفعنا بما علمتنا وزِدنا علماً نافعاً
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                fontStyle: "italic",
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              O Allah, benefit us through what You have taught us and increase us in beneficial
              knowledge.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Donation Modal */}
      <DonationModal visible={donateOpen} onClose={() => setDonateOpen(false)} darkBg={darkBg} />
    </WallpaperBackground>
  );
}
