import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

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
          Privacy Policy
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 500, alignSelf: "center", width: "100%", gap: 24 }}>
          <View>
            <Text style={{ color: "#D4AF37", fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 1 }}>
              Last Updated: February 2026
            </Text>
          </View>

          <Section title="1. Information We Collect">
            <BulletItem text="Account information: Email address, display name, username, and profile photo when you create an account." />
            <BulletItem text="Usage data: Room participation, message history, and app interactions to improve the service." />
            <BulletItem text="Device data: Device type, OS version, and app version for troubleshooting and analytics." />
            <BulletItem text="Location data: Only when you grant permission, used for prayer times and Qibla direction." />
            <BulletItem text="Audio data: Microphone access only during live room sessions for real-time translation (never stored)." />
          </Section>

          <Section title="2. How We Use Your Data">
            <BulletItem text="Providing and improving the Aqala service" />
            <BulletItem text="Calculating accurate prayer times based on your location" />
            <BulletItem text="Real-time speech-to-text translation in rooms (audio is processed in real-time and not stored)" />
            <BulletItem text="Sending notifications about rooms and messages" />
            <BulletItem text="Content moderation to maintain community safety" />
          </Section>

          <Section title="3. Third-Party Services">
            <BulletItem text="Firebase (Google): Authentication, database, and analytics" />
            <BulletItem text="Cloudinary: Profile photo hosting" />
            <BulletItem text="Soniox: Real-time speech-to-text (audio streamed, not stored)" />
            <BulletItem text="Google AdMob: Advertising (for non-premium users)" />
          </Section>

          <Section title="4. Data Retention & Deletion">
            <Paragraph text="You can request deletion of your account and all associated data at any time by contacting us at info@aqala.org. We will process deletion requests within 30 days." />
          </Section>

          <Section title="5. Children's Privacy">
            <Paragraph text="Aqala is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will promptly delete it." />
          </Section>

          <Section title="6. Your Rights">
            <BulletItem text="Access your personal data" />
            <BulletItem text="Request correction of inaccurate data" />
            <BulletItem text="Request deletion of your data" />
            <BulletItem text="Opt out of analytics and tracking" />
            <BulletItem text="Export your data" />
          </Section>

          <Section title="7. Security">
            <Paragraph text="We implement industry-standard security measures including encryption in transit (TLS), secure authentication via Firebase Auth, and regular security reviews. However, no method of transmission over the internet is 100% secure." />
          </Section>

          <Section title="8. Contact Us">
            <Paragraph text="If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:" />
            <TouchableOpacity
              onPress={() => Linking.openURL("mailto:info@aqala.org")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: "rgba(255,255,255,0.05)",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                marginTop: 8,
              }}
            >
              <Ionicons name="mail-outline" size={18} color="#D4AF37" />
              <Text style={{ color: "#D4AF37", fontSize: 14 }}>info@aqala.org</Text>
            </TouchableOpacity>
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>{title}</Text>
      {children}
    </View>
  );
}

function BulletItem({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, paddingLeft: 4 }}>
      <Text style={{ color: "#D4AF37", fontSize: 14, lineHeight: 20 }}>{"\u2022"}</Text>
      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 20, flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}

function Paragraph({ text }: { text: string }) {
  return (
    <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 22 }}>{text}</Text>
  );
}
