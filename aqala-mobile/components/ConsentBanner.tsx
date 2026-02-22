import { useState } from "react";
import { View, Text, TouchableOpacity, Switch, Platform } from "react-native";
import { usePrivacyConsent } from "@/contexts/PrivacyConsentContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ConsentBanner() {
  const { showBanner, acceptAll, rejectAll, updateConsent } = usePrivacyConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [personalizedAds, setPersonalizedAds] = useState(true);
  const router = useRouter();

  if (!showBanner) return null;

  const handleSavePreferences = () => {
    updateConsent({ analytics, personalizedAds });
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#0a1a14",
        borderTopWidth: 1,
        borderTopColor: "rgba(212,175,55,0.2)",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 20,
      }}
    >
      {showDetails ? (
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Manage Preferences</Text>
            <TouchableOpacity onPress={() => setShowDetails(false)}>
              <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(255,255,255,0.05)",
              padding: 14,
              borderRadius: 12,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>Analytics</Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>
                Help us improve the app experience
              </Text>
            </View>
            <Switch
              value={analytics}
              onValueChange={setAnalytics}
              trackColor={{ false: "rgba(255,255,255,0.1)", true: "rgba(212,175,55,0.3)" }}
              thumbColor={analytics ? "#D4AF37" : "#666"}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(255,255,255,0.05)",
              padding: 14,
              borderRadius: 12,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>Personalised Ads</Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>
                Show ads relevant to your interests
              </Text>
            </View>
            <Switch
              value={personalizedAds}
              onValueChange={setPersonalizedAds}
              trackColor={{ false: "rgba(255,255,255,0.1)", true: "rgba(212,175,55,0.3)" }}
              thumbColor={personalizedAds ? "#D4AF37" : "#666"}
            />
          </View>

          <TouchableOpacity
            onPress={handleSavePreferences}
            style={{
              backgroundColor: "#D4AF37",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#021a12", fontSize: 14, fontWeight: "600" }}>Save Preferences</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: "rgba(212,175,55,0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="shield-checkmark" size={18} color="#D4AF37" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "white", fontSize: 14, fontWeight: "600", marginBottom: 4 }}>
                Your Privacy Matters
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 18 }}>
                We use analytics and ads to keep Aqala free. You can manage your preferences anytime.{" "}
                <Text
                  style={{ color: "#D4AF37" }}
                  onPress={() => router.push("/privacy")}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={rejectAll}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.08)",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "500" }}>
                Reject
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDetails(true)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.08)",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "500" }}>
                Manage
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={acceptAll}
              style={{
                flex: 1.2,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: "#D4AF37",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#021a12", fontSize: 13, fontWeight: "600" }}>Accept All</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
