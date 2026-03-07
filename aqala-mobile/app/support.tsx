import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import WallpaperBackground from "@/components/WallpaperBackground";
import { usePreferences } from "@/contexts/PreferencesContext";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Aqala?",
    a: "Aqala is an app for Muslims that provides prayer times, Qibla direction, and related spiritual tools.",
  },
  {
    q: "How do I delete my account?",
    a: "Contact us at info@aqala.org to request account deletion. We will process your request and delete all associated data within 30 days.",
  },
  {
    q: "What data does Aqala collect?",
    a: "We collect your account info (email, name) and, with your permission, location for prayer times and Qibla. See our Privacy Policy for full details.",
  },
  {
    q: "Is Aqala free?",
    a: "Yes, Aqala is free to use. We may offer optional premium features in the future.",
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);
  const { getAccentColor } = usePreferences();
  const accent = getAccentColor();

  return (
    <WallpaperBackground edges={["top"]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.05)",
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600", flex: 1 }}>
          Help & Support
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 500, alignSelf: "center", width: "100%", gap: 32 }}>
          {/* Contact */}
          <View style={{ gap: 12 }}>
            <Text style={{ color: accent.base, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 1 }}>
              Contact Us
            </Text>

            <TouchableOpacity
              onPress={() => Linking.openURL("mailto:info@aqala.org")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                backgroundColor: "rgba(255,255,255,0.05)",
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.05)",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: `${accent.base}20`,
                }}
              >
                <Ionicons name="mail-outline" size={20} color={accent.base} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>Email Support</Text>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>info@aqala.org</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL("https://instagram.com/aqala.app")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                backgroundColor: "rgba(255,255,255,0.05)",
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.05)",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: `${accent.base}20`,
                }}
              >
                <Ionicons name="logo-instagram" size={20} color={accent.base} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>Instagram</Text>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>@aqala.app</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          </View>

          {/* FAQs */}
          <View style={{ gap: 12 }}>
            <Text style={{ color: accent.base, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 1 }}>
              Frequently Asked Questions
            </Text>

            {FAQS.map((faq, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setExpanded(expanded === index ? null : index)}
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: expanded === index ? `${accent.base}40` : "rgba(255,255,255,0.05)",
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 14, fontWeight: "500", flex: 1, paddingRight: 12 }}>
                    {faq.q}
                  </Text>
                  <Ionicons
                    name={expanded === index ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="rgba(255,255,255,0.4)"
                  />
                </View>
                {expanded === index && (
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingBottom: 14,
                      borderTopWidth: 1,
                      borderTopColor: "rgba(255,255,255,0.05)",
                      paddingTop: 12,
                    }}
                  >
                    <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 20 }}>
                      {faq.a}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Legal Links */}
          <View style={{ gap: 12 }}>
            <Text style={{ color: accent.base, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 1 }}>
              Legal
            </Text>

            <Link href="/privacy" asChild>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.05)",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="rgba(255,255,255,0.5)" />
                  <Text style={{ color: "white", fontSize: 14 }}>Privacy Policy</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            </Link>

            <Link href="/terms" asChild>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.05)",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Ionicons name="document-text-outline" size={18} color="rgba(255,255,255,0.5)" />
                  <Text style={{ color: "white", fontSize: 14 }}>Terms of Service</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </WallpaperBackground>
  );
}
