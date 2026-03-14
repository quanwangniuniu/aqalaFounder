import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import WallpaperBackground from "@/components/WallpaperBackground";
import { usePreferences } from "@/contexts/PreferencesContext";

export default function HowItWorksScreen() {
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
          How Aqala Works
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 500, alignSelf: "center", width: "100%", gap: 24 }}>
          <Section title="How Aqala Works">
            <Paragraph text="Aqala helps you understand and engage with Islamic content across languages. We combine trusted sources with modern technology to deliver real-time translation, tafsir (commentary), and AI-generated summaries—so you can listen, learn, and connect no matter what language you speak." />
          </Section>

          <Section title="Our Sources">
            <Paragraph text="All Quran verses and tafsirs (exegesis) in Aqala come from quran.com, a widely trusted and verified source for the Quran and its translations." />
            <Paragraph text="This ensures the foundational religious text you see is accurate and authoritative." />
          </Section>

          <Section title="AI Transparency">
            <Paragraph text="We believe in being transparent about how we use technology. Here is how AI is used in Aqala:" />
            <BulletItem text="Verses & Tafsirs: Sourced from quran.com—no AI." />
            <BulletItem text="Translations: AI is used to detect speech and automatically translate it into your language. This enables real-time, multilingual listening." />
            <BulletItem text="Summaries: Content summaries are generated using AI to help you quickly grasp key points." />
            <Paragraph text="AI translations and summaries are learning aids, not authoritative religious rulings. For important decisions or deeper study, we encourage consulting qualified scholars and verified sources." />
          </Section>

          <Section title="Verify Our Sources">
            <Paragraph text="You can verify our Quran and tafsir content anytime at quran.com." />
            <TouchableOpacity
              onPress={() => Linking.openURL("https://quran.com")}
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
              <Ionicons name="open-outline" size={18} color={accent.base} />
              <Text style={{ color: accent.base, fontSize: 14 }}>Visit quran.com</Text>
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
