import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import WallpaperBackground from "@/components/WallpaperBackground";
import { usePreferences } from "@/contexts/PreferencesContext";

export default function TermsOfServiceScreen() {
  const router = useRouter();
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
            <Text style={{ color: accent.base, fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 1 }}>
              Last Updated: February 2026
            </Text>
          </View>

          <Section title="1. Acceptance of Terms">
            <Paragraph text="By downloading, installing, or using Aqala, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the application." />
          </Section>

          <Section title="2. Description of Service">
            <Paragraph text="Aqala is an app for Muslims that provides prayer times, Qibla direction, and related spiritual tools. The service is available on iOS and Android." />
          </Section>

          <Section title="3. User Accounts">
            <BulletItem text="You must be at least 13 years old to create an account" />
            <BulletItem text="You are responsible for maintaining the security of your account" />
            <BulletItem text="You must provide accurate information when creating your account" />
          </Section>

          <Section title="4. Religious Content Disclaimer">
            <Paragraph text="Aqala provides prayer time calculations and related tools to assist users. These features are intended as aids and should not be considered authoritative religious rulings. Always consult qualified scholars for religious guidance." />
          </Section>

          <Section title="5. Intellectual Property">
            <Paragraph text="Aqala's logos, designs, and app are protected by intellectual property laws. You may not copy or misuse our branding or code." />
          </Section>

          <Section title="6. Account Termination">
            <Paragraph text="We may suspend or terminate accounts that violate these terms or applicable law. You may delete your account at any time by contacting support." />
          </Section>

          <Section title="7. Disclaimers & Limitations">
            <Paragraph text='The service is provided "as is" without warranties of any kind. Aqala is not liable for any damages arising from your use of the service, including but not limited to loss of data or service interruptions.' />
          </Section>

          <Section title="8. Governing Law">
            <Paragraph text="These terms are governed by the laws of Australia. Any disputes shall be resolved in the courts of New South Wales, Australia." />
          </Section>

          <Section title="9. Contact Us">
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
              <Ionicons name="mail-outline" size={18} color={accent.base} />
              <Text style={{ color: accent.base, fontSize: 14 }}>info@aqala.org</Text>
            </TouchableOpacity>
          </Section>
        </View>
      </ScrollView>
    </WallpaperBackground>
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
  const { getAccentColor } = usePreferences();
  const color = getAccentColor().base;
  return (
    <View style={{ flexDirection: "row", gap: 8, paddingLeft: 4 }}>
      <Text style={{ color, fontSize: 14, lineHeight: 20 }}>{"\u2022"}</Text>
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
