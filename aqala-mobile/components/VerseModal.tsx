import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { usePreferences } from "@/contexts/PreferencesContext";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || "https://aqala.io";

interface VerseData {
  verseKey: string;
  verseNumber: number;
  arabicText: string;
  translation: string;
}

interface VerseResponse {
  chapter: number;
  chapterName: string;
  chapterNameArabic: string;
  verses: VerseData[];
  startVerse: number;
  endVerse: number;
  totalVerses: number;
  revelationPlace: string;
}

interface VerseModalProps {
  visible: boolean;
  onClose: () => void;
  verseKey: string | null;
  targetLang: string;
}

export default function VerseModal({
  visible,
  onClose,
  verseKey,
  targetLang,
}: VerseModalProps) {
  const [data, setData] = useState<VerseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const { getGradientColors, getAccentColor } = usePreferences();
  const gradientColors = getGradientColors() as [string, string, ...string[]];
  const accent = getAccentColor();

  useEffect(() => {
    if (!visible || !verseKey) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    (async () => {
      try {
        const res = await fetch(
          `${WEB_URL}/api/verse?key=${encodeURIComponent(verseKey)}&lang=${targetLang}`,
        );
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const json: VerseResponse = await res.json();
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load verse");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, verseKey, targetLang]);

  const openQuranCom = useCallback(() => {
    if (!verseKey) return;
    const [ch, v] = verseKey.split(":");
    Linking.openURL(`https://quran.com/${ch}/${v?.split("-")[0] ?? "1"}`);
  }, [verseKey]);

  const isHighlighted = useCallback(
    (verseNumber: number) => {
      if (!data) return false;
      return verseNumber >= data.startVerse && verseNumber <= data.endVerse;
    },
    [data],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />

        <LinearGradient
          colors={gradientColors}
          style={{
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
            maxHeight: "90%",
          }}
        >
          {/* Drag handle */}
          <View
            style={{ alignItems: "center", paddingTop: 10, paddingBottom: 4 }}
          >
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
            />
          </View>

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.05)",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: `${accent.base}26`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="book-outline" size={20} color={accent.base} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 18, fontWeight: "600", color: "white" }}
                numberOfLines={1}
              >
                {data?.chapterName ?? verseKey ?? "Verse"}
                {data?.chapterNameArabic
                  ? ` — ${data.chapterNameArabic}`
                  : ""}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 2,
                }}
              >
                {verseKey}
                {data?.revelationPlace
                  ? ` · ${data.revelationPlace}`
                  : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.08)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="close"
                size={18}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <View style={{ paddingVertical: 56, alignItems: "center" }}>
              <ActivityIndicator size="large" color={accent.base} />
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 16,
                }}
              >
                Loading verse...
              </Text>
            </View>
          ) : error ? (
            <View style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
              <View
                style={{
                  backgroundColor: "rgba(248,113,113,0.1)",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <Text style={{ fontSize: 14, color: "#f87171" }}>{error}</Text>
              </View>
            </View>
          ) : data ? (
            <>
              <ScrollView
                ref={scrollRef}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingTop: 16,
                  paddingBottom: 12,
                }}
                showsVerticalScrollIndicator={false}
              >
                {data.verses
                  .filter(
                    (v) =>
                      v.verseNumber >= data.startVerse &&
                      v.verseNumber <= data.endVerse,
                  )
                  .map((verse) => {
                    const highlighted = isHighlighted(verse.verseNumber);
                    return (
                      <View
                        key={verse.verseKey}
                        style={{
                          marginBottom: 20,
                          paddingLeft: highlighted ? 12 : 0,
                          borderLeftWidth: highlighted ? 3 : 0,
                          borderLeftColor: accent.base,
                        }}
                      >
                        {/* Verse number */}
                        <Text
                          style={{
                            fontSize: 11,
                            color: accent.base,
                            fontWeight: "600",
                            marginBottom: 6,
                          }}
                        >
                          {verse.verseKey}
                        </Text>

                        {/* Arabic */}
                        <Text
                          style={{
                            fontSize: 24,
                            lineHeight: 44,
                            color: "white",
                            textAlign: "right",
                            marginBottom: 12,
                            fontFamily:
                              Platform.OS === "ios"
                                ? "Geeza Pro"
                                : "sans-serif",
                          }}
                        >
                          {verse.arabicText}
                        </Text>

                        {/* Translation */}
                        <Text
                          style={{
                            fontSize: 15,
                            lineHeight: 24,
                            color: "rgba(255,255,255,0.8)",
                          }}
                        >
                          {verse.translation}
                        </Text>
                      </View>
                    );
                  })}
              </ScrollView>

              {/* Footer actions */}
              <View
                style={{
                  flexDirection: "row",
                  paddingHorizontal: 20,
                  paddingTop: 12,
                  paddingBottom: Platform.OS === "ios" ? 36 : 20,
                  borderTopWidth: 1,
                  borderTopColor: "rgba(255,255,255,0.05)",
                  gap: 12,
                }}
              >
                <TouchableOpacity
                  onPress={openQuranCom}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color="rgba(255,255,255,0.7)"
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    Read on Quran.com
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </LinearGradient>
      </View>
    </Modal>
  );
}
