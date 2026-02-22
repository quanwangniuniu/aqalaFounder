import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Aqala?",
    a: "Aqala is a community platform for Muslims that provides live audio rooms with real-time translation, prayer times, Qibla compass, and social features to connect the global Muslim community.",
  },
  {
    q: "How does real-time translation work?",
    a: "When a speaker talks in a room, their speech is converted to text in real-time using AI speech recognition. The text is then displayed in the room for all participants. Note: translations are automated and intended as a learning aid.",
  },
  {
    q: "How do I report a user?",
    a: "Go to the user's profile, tap the three-dot menu, and select 'Report User'. Choose a reason and add any details. Our moderation team reviews all reports.",
  },
  {
    q: "How do I block a user?",
    a: "Go to the user's profile, tap the three-dot menu, and select 'Block User'. Blocked users won't be able to message you.",
  },
  {
    q: "How do I delete my account?",
    a: "Contact us at info@aqala.org to request account deletion. We will process your request and delete all associated data within 30 days.",
  },
  {
    q: "What data does Aqala collect?",
    a: "We collect your account info (email, name, photo), usage data, and with your permission, location for prayer times. Audio in rooms is processed in real-time and never stored. See our Privacy Policy for full details.",
  },
  {
    q: "Is Aqala free?",
    a: "Yes, Aqala is free to use. We offer an optional premium subscription to remove ads and unlock additional features.",
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-[#032117]" edges={["top"]}>
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
            <Text style={{ color: "#D4AF37", fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 1 }}>
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
                  backgroundColor: "rgba(212,175,55,0.1)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="mail-outline" size={20} color="#D4AF37" />
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
                  backgroundColor: "rgba(212,175,55,0.1)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="logo-instagram" size={20} color="#D4AF37" />
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
            <Text style={{ color: "#D4AF37", fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 1 }}>
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
                  borderColor: expanded === index ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.05)",
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
            <Text style={{ color: "#D4AF37", fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 1 }}>
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
    </SafeAreaView>
  );
}
