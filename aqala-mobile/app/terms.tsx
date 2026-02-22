import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TermsOfServiceScreen() {
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
          Terms of Service
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

          <Section title="1. Acceptance of Terms">
            <Paragraph text="By downloading, installing, or using Aqala, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the application." />
          </Section>

          <Section title="2. Description of Service">
            <Paragraph text="Aqala is a community platform for Muslims that provides live audio rooms with real-time translation, prayer times, Qibla direction, and social features. The service is available on iOS, Android, and web." />
          </Section>

          <Section title="3. User Accounts">
            <BulletItem text="You must be at least 13 years old to create an account" />
            <BulletItem text="You are responsible for maintaining the security of your account" />
            <BulletItem text="You must provide accurate information when creating your account" />
            <BulletItem text="You may not create accounts for the purpose of abusing the platform" />
          </Section>

          <Section title="4. Community Guidelines">
            <Paragraph text="By using Aqala, you agree to:" />
            <BulletItem text="Treat all users with respect and dignity" />
            <BulletItem text="Not engage in harassment, bullying, or hate speech" />
            <BulletItem text="Not post spam, scams, or misleading content" />
            <BulletItem text="Not impersonate other users or public figures" />
            <BulletItem text="Not share illegal, violent, or explicit content" />
            <BulletItem text="Respect the diverse backgrounds and beliefs of all community members" />
          </Section>

          <Section title="5. Content Moderation">
            <Paragraph text="We employ automated content filtering and user reporting to maintain community standards. Users can report inappropriate content or behaviour, and our moderation team reviews all reports." />
          </Section>

          <Section title="6. Religious Content Disclaimer">
            <Paragraph text="Aqala provides automated real-time translations and prayer time calculations as tools to assist users. These features are intended as learning aids and should not be considered authoritative religious rulings. Always consult qualified scholars for religious guidance." />
          </Section>

          <Section title="7. Intellectual Property">
            <Paragraph text="You retain ownership of content you create on Aqala. By posting content, you grant Aqala a non-exclusive licence to display and distribute it within the service. Aqala's logos, designs, and code are protected by intellectual property laws." />
          </Section>

          <Section title="8. Account Termination">
            <Paragraph text="We may suspend or terminate accounts that violate these terms, our community guidelines, or applicable law. You may delete your account at any time by contacting support." />
          </Section>

          <Section title="9. Disclaimers & Limitations">
            <Paragraph text='The service is provided "as is" without warranties of any kind. Aqala is not liable for any damages arising from your use of the service, including but not limited to loss of data or service interruptions.' />
          </Section>

          <Section title="10. Governing Law">
            <Paragraph text="These terms are governed by the laws of Australia. Any disputes shall be resolved in the courts of New South Wales, Australia." />
          </Section>

          <Section title="11. Contact Us">
            <Paragraph text="If you have questions about these Terms of Service, contact us:" />
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
