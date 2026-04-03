import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Share,
  Alert,
  Platform,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNetworkState } from "expo-network";

import WallpaperBackground from "@/components/WallpaperBackground";
import VerseModal from "@/components/VerseModal";
import VerseHighlightedText from "@/components/VerseHighlightedText";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getPastTranslation,
  deletePastTranslation,
  PastTranslation,
} from "@/lib/firebase/userPastTranslations";


export default function PastTranslationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getAccentColor } = usePreferences();
  const { t, language } = useLanguage();
  const accent = getAccentColor();

  const [translation, setTranslation] = useState<PastTranslation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedVerseKey, setSelectedVerseKey] = useState<string | null>(null);
  const networkState = useNetworkState();
  const isNetworkBlocked =
    networkState.isConnected === false ||
    networkState.isInternetReachable === false;

  const loadTranslation = useCallback(async () => {
    if (!id) return;
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(false);
    try {
      const pt = await getPastTranslation(user.uid, id);
      setTranslation(pt);
    } catch (e) {
      console.error("Failed to load past translation:", e);
      setLoadError(true);
      setTranslation(null);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, id]);

  useEffect(() => {
    void loadTranslation();
  }, [loadTranslation]);

  

  const handleShare = useCallback(async () => {
    if (!translation) return;
    const fullText = translation.translatedParagraphs.join("\n\n");
    if (!fullText.trim()) return;
    try {
      await Share.share({ message: fullText });
    } catch {}
  }, [translation]);

  const handleDelete = useCallback(() => {
    if (!user?.uid || !id) return;
    Alert.alert(
      "Delete Translation",
      "Are you sure you want to delete this saved translation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deletePastTranslation(user.uid, id);
              router.back();
            } catch (e) {
              console.error("Failed to delete:", e);
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [user?.uid, id, router]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === "ar" ? "ar" : undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!id) {
    return (
      <WallpaperBackground edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white/80 text-center mb-4">
            Translation not found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="px-5 py-2.5 rounded-full bg-[#D4AF37]"
          >
            <Text className="text-[#032117] font-semibold">Go back</Text>
          </TouchableOpacity>
        </View>
      </WallpaperBackground>
    );
  }

  return (
    <WallpaperBackground edges={["top", "bottom"]}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 border-b border-white/10"
        style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/10 items-center justify-center mr-3"
        >
          <Ionicons name="chevron-back" size={20} color="white" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center gap-2">
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: `${accent.base}33` }}
          >
            <Ionicons name="document-text" size={16} color={accent.base} />
          </View>
          <Text
            className="text-white font-semibold text-base"
            numberOfLines={1}
          >
            Saved Translation
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleShare}
          className="w-9 h-9 rounded-full bg-white/10 items-center justify-center ml-2"
        >
          <Ionicons
            name="share-outline"
            size={18}
            color="rgba(255,255,255,0.7)"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          disabled={deleting}
          className="w-9 h-9 rounded-full bg-white/10 items-center justify-center ml-2"
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={accent.base} />
          <Text className="text-white/40 text-sm mt-3">Loading...</Text>
        </View>
      ) : !translation ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Ionicons
            name={
              loadError || isNetworkBlocked
                ? "cloud-offline-outline"
                : "document-text-outline"
            }
            size={48}
            color="rgba(255,255,255,0.15)"
          />
          <Text className="text-white/60 text-center mt-4 mb-2 px-2">
            {loadError || isNetworkBlocked
              ? t("listen.firestoreLoadFailed")
              : "Translation not found or may have been deleted."}
          </Text>
          {(loadError || isNetworkBlocked) && (
            <TouchableOpacity
              onPress={() => void loadTranslation()}
              className="px-5 py-2.5 rounded-full mb-4"
              style={{ backgroundColor: accent.base }}
            >
              <Text className="text-[#032117] font-semibold">
                {t("listen.retry")}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => router.back()}
            className="px-5 py-2.5 rounded-full bg-white/10"
          >
            <Text className="text-white font-semibold">Go back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Meta bar */}
          <View className="px-4 py-3 border-b border-white/5">
            <View className="flex-row items-center gap-2">
              <View
                className="px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${accent.base}1A` }}
              >
                <Text
                  style={{ color: accent.base }}
                  className="text-xs font-medium"
                >
                  {translation.sourceLang} → {translation.targetLang}
                </Text>
              </View>
              <Text className="text-white/30 text-xs">
                {formatDate(translation.createdAt)}
              </Text>
            </View>
          </View>

          {/* Source text */}
          {translation.sourceText ? (
            <View
              className="border-b border-white/5"
              style={{ maxHeight: 120 }}
            >
              <View className="px-4 pt-3 pb-1">
                <Text className="text-white/40 text-xs font-medium uppercase tracking-wider">
                  Source / Reference
                </Text>
              </View>
              <ScrollView
                className="px-4 pb-3"
                showsVerticalScrollIndicator={false}
              >
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 22,
                    color: "rgba(255,255,255,0.7)",
                    textAlign: "right",
                    fontFamily:
                      Platform.OS === "ios" ? "Geeza Pro" : "sans-serif",
                  }}
                >
                  {translation.sourceText}
                </Text>
              </ScrollView>
            </View>
          ) : null}

          {/* Translated paragraphs */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 40, paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {translation.translatedParagraphs.length > 0 ? (
              translation.translatedParagraphs.map((para, i) => (
                <View key={i} style={{ marginBottom: 20 }}>
                  <VerseHighlightedText
                    words={para.split(/\s+/).filter(Boolean)}
                    highlights={(translation.verseHighlights ?? []).map((h) => ({
                      startWord: h.startWord,
                      endWord: h.endWord,
                      verseKey: h.verseKey,
                      verseReference: h.verseReference,
                      ...(h.canonicalTranslation
                        ? { canonicalTranslation: h.canonicalTranslation }
                        : {}),
                    }))}
                    accentColor={accent.base}
                    onVersePress={setSelectedVerseKey}
                    writingDirection={
                      translation.targetLang === "ar" ? "rtl" : "ltr"
                    }
                  />
                </View>
              ))
            ) : (
              <View style={{ alignItems: "center", paddingTop: 64 }}>
                <Ionicons
                  name="document-text-outline"
                  size={36}
                  color="rgba(255,255,255,0.12)"
                />
                <Text className="text-white/40 text-sm text-center mt-3">
                  This session was saved before the{"\n"}translation finished
                  processing.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      <VerseModal
        visible={!!selectedVerseKey}
        onClose={() => setSelectedVerseKey(null)}
        verseKey={selectedVerseKey}
        targetLang={translation?.targetLang ?? "en"}
      />
    </WallpaperBackground>
  );
}
