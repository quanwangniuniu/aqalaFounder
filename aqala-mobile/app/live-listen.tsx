import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Linking,
  Share,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useRecording } from "@soniox/react";
import { useKeepAwake } from "expo-keep-awake";
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import { Ionicons } from "@expo/vector-icons";

import WallpaperBackground from "@/components/WallpaperBackground";
import VerseModal from "@/components/VerseModal";
import SummaryModal from "@/components/SummaryModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  useLanguage,
  LANGUAGE_OPTIONS,
} from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { savePastTranslation } from "@/lib/firebase/userPastTranslations";
import { useLiveRefinement } from "@/lib/live-listen/useLiveRefinement";
import { SonioxAudioSource } from "@/lib/audio/SonioxAudioSource";

// ── Fade-in wrapper for new content ──────────────────────────────────

function FadeInView({
  children,
  style,
  delay = 0,
}: {
  children: React.ReactNode;
  style?: any;
  delay?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 450,
        delay,
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [opacity, translateY, delay]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

// ── Language options for the selector (codes Soniox supports) ────────

const LANG_OPTIONS = LANGUAGE_OPTIONS.filter((l) =>
  [
    "en", "ar", "ur", "hi", "bn", "tr", "id", "fr", "de",
    "es", "pt", "ru", "zh", "ja", "ko", "vi", "th", "it",
  ].includes(l.code),
);

// ── Screen ───────────────────────────────────────────────────────────

export default function NativeLiveListenScreen() {
  useKeepAwake();

  const router = useRouter();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { getGradientColors, getAccentColor } = usePreferences();
  const accent = getAccentColor();

  // ── State ──────────────────────────────────────────────────────────

  const [targetLang, setTargetLangState] = useState(language || "en");
  const [micReady, setMicReady] = useState(false);
  const [hasStopped, setHasStopped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedVerseKey, setSelectedVerseKey] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [savingPast, setSavingPast] = useState(false);
  const [savedPast, setSavedPast] = useState(false);

  const translationScrollRef = useRef<ScrollView>(null);
  const sourceScrollRef = useRef<ScrollView>(null);

  // ── Audio source (persistent across renders) ──────────────────────

  const audioSourceRef = useRef(new SonioxAudioSource());

  // ── Refinement hook ───────────────────────────────────────────────

  const refinement = useLiveRefinement(targetLang);

  // ── Soniox useRecording ───────────────────────────────────────────

  const recording = useRecording({
    model: "stt-rt-preview",
    language_hints: LANG_OPTIONS.map((l) => l.code),
    enable_language_identification: true,
    enable_endpoint_detection: true,
    translation: {
      type: "one_way",
      target_language: targetLang,
    },
    audio_format: "pcm_s16le",
    sample_rate: 16000,
    num_channels: 1,
    source: audioSourceRef.current,
    onError: (err) => {
      console.error("[LiveListen] Soniox error:", err);
      setError(err.message || "Transcription error");
    },
    onFinished: () => {
      refinement.flush();
    },
    onConnected: () => {
      console.log("[LiveListen] Soniox WebSocket connected");
    },
    onResult: (result) => {
      const statuses = (result.tokens || []).map(
        (t: any) => t.translation_status,
      );
      const unique = [...new Set(statuses)];
      console.log(
        `[LiveListen] tokens: ${result.tokens?.length}, statuses: ${JSON.stringify(unique)}`,
      );
    },
  });

  const isListening = recording.isActive;

  // ── Mic permissions ───────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      const { granted } = await getRecordingPermissionsAsync();
      if (granted) {
        setMicReady(true);
      } else {
        const result = await requestRecordingPermissionsAsync();
        setMicReady(result.granted);
      }
    })();
  }, []);

  // ── Feed Soniox output into refinement pipeline ───────────────────

  const groups = recording.groups;
  const translationFinalText = groups?.translation?.finalText ?? "";
  const sourceFinalText = groups?.original?.finalText ?? "";

  useEffect(() => {
    if (groups && Object.keys(groups).length > 0) {
      console.log(
        "[LiveListen] groups:",
        JSON.stringify(
          Object.fromEntries(
            Object.entries(groups).map(([k, v]: [string, any]) => [
              k,
              { finalLen: v?.finalText?.length ?? 0, partialLen: v?.partialText?.length ?? 0 },
            ]),
          ),
        ),
      );
    }
  }, [groups]);

  useEffect(() => {
    if (translationFinalText) {
      refinement.feedTranslation(translationFinalText);
    }
  }, [translationFinalText]);

  useEffect(() => {
    if (sourceFinalText) {
      refinement.feedSource(sourceFinalText);
    }
  }, [sourceFinalText]);

  // ── Auto-scroll ───────────────────────────────────────────────────

  useEffect(() => {
    if (refinement.refinedParagraphs.length > 0) {
      setTimeout(
        () => translationScrollRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
  }, [refinement.refinedParagraphs.length]);

  useEffect(() => {
    if (refinement.sourceStable) {
      setTimeout(
        () => sourceScrollRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
  }, [refinement.sourceStable]);

  // ── Handlers ──────────────────────────────────────────────────────

  const handleStart = useCallback(() => {
    setError(null);
    setHasStopped(false);
    setSavedPast(false);
    refinement.reset();
    try {
      recording.start();
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (msg.includes("AudioStudio")) {
        setError(
          "Native audio module not available. Please use a development build (not Expo Go).",
        );
      } else {
        setError(msg);
      }
    }
  }, [recording, refinement]);

  const handleStop = useCallback(async () => {
    try {
      await recording.stop();
    } catch {}
    setHasStopped(true);
    refinement.flush();
  }, [recording, refinement]);

  const handleLanguageChange = useCallback(
    (code: string) => {
      setTargetLangState(code);
      refinement.setTargetLang(code);
      if (isListening) {
        handleStop().then(() => {
          refinement.reset();
          setTimeout(() => {
            recording.start();
            setHasStopped(false);
          }, 300);
        });
      }
    },
    [isListening, recording, refinement, handleStop],
  );

  const handleCopy = useCallback(async () => {
    const fullText =
      refinement.refinedParagraphs.join("\n\n") || translationFinalText;
    if (!fullText.trim()) return;
    try {
      await Share.share({ message: fullText });
    } catch {}
  }, [refinement.refinedParagraphs, translationFinalText]);

  const handleSave = useCallback(async () => {
    if (!user?.uid || savingPast || savedPast) return;
    setSavingPast(true);
    try {
      await savePastTranslation(user.uid, {
        sourceText: refinement.sourceStable,
        translatedParagraphs: refinement.refinedParagraphs,
        verseReferences: refinement.verseReferences,
        sourceLang: "ar",
        targetLang,
      });
      setSavedPast(true);
    } catch (e) {
      console.error("Failed to save translation:", e);
    } finally {
      setSavingPast(false);
    }
  }, [
    user,
    savingPast,
    savedPast,
    refinement.sourceStable,
    refinement.refinedParagraphs,
    refinement.verseReferences,
    targetLang,
  ]);

  // ── Derived ───────────────────────────────────────────────────────

  const translationPartial =
    recording.groups?.translation?.partialText ?? "";
  const sourcePartial = recording.groups?.original?.partialText ?? "";
  const hasRefined = refinement.refinedParagraphs.length > 0;
  const hasRawTranslation = translationFinalText.length > 0;
  const hasResults = hasRefined || hasRawTranslation;
  const showPostActions = hasStopped && !isListening && hasResults;

  // ── Word-by-word typewriter reveal ──────────────────────────────────

  const allTranslationWords = useMemo(
    () => translationFinalText.split(/\s+/).filter(Boolean),
    [translationFinalText],
  );

  const [revealedWordCount, setRevealedWordCount] = useState(0);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetWordCountRef = useRef(0);
  targetWordCountRef.current = allTranslationWords.length;

  const clearRevealTimer = useCallback(() => {
    if (revealTimerRef.current) {
      clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (hasRefined) {
      clearRevealTimer();
      return;
    }
    if (revealTimerRef.current) return;
    if (revealedWordCount >= allTranslationWords.length) return;

    revealTimerRef.current = setInterval(() => {
      setRevealedWordCount((prev) => {
        if (prev >= targetWordCountRef.current) {
          clearRevealTimer();
          return prev;
        }
        return prev + 1;
      });
    }, 55);

    return clearRevealTimer;
  }, [allTranslationWords.length, revealedWordCount, hasRefined, clearRevealTimer]);

  useEffect(() => {
    if (!isListening && !hasStopped) {
      setRevealedWordCount(0);
      clearRevealTimer();
    }
  }, [isListening, hasStopped, clearRevealTimer]);

  // ── Verse reference parsing helper ────────────────────────────────

  const parseVerseKey = useCallback((reference: string): string | null => {
    const match = reference.match(/(\d+):(\d+(?:-\d+)?)/);
    return match ? `${match[1]}:${match[2]}` : null;
  }, []);

  // ── Render ────────────────────────────────────────────────────────

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
            <Ionicons name="mic" size={16} color={accent.base} />
          </View>
          <Text
            className="text-white font-semibold text-base"
            numberOfLines={1}
          >
            Listen & Translate
          </Text>
          {isListening && (
            <View
              className="px-2 py-0.5 rounded-full ml-1"
              style={{ backgroundColor: "#ef444433" }}
            >
              <Text className="text-red-400 text-xs font-medium">LIVE</Text>
            </View>
          )}
        </View>
      </View>

      {/* Language selector */}
      <View className="px-4 py-2 border-b border-white/5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
        >
          {LANG_OPTIONS.map((opt) => {
            const active = opt.code === targetLang;
            return (
              <TouchableOpacity
                key={opt.code}
                onPress={() => handleLanguageChange(opt.code)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: active
                    ? `${accent.base}33`
                    : "rgba(255,255,255,0.06)",
                  borderWidth: active ? 1 : 0,
                  borderColor: accent.base,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: active ? "600" : "400",
                    color: active ? accent.base : "rgba(255,255,255,0.6)",
                  }}
                >
                  {opt.flag} {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Mic permission denied */}
      {!micReady && (
        <View className="px-4 py-3 bg-red-900/30 border-b border-red-500/30">
          <Text className="text-red-300 text-xs mb-2">
            Microphone access is required for live translation.
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            }}
            className="flex-row items-center gap-2 bg-white/10 rounded-lg py-2 px-3 self-start"
          >
            <Ionicons name="settings-outline" size={14} color={accent.base} />
            <Text
              style={{ color: accent.base }}
              className="text-xs font-medium"
            >
              Open Settings
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error banner */}
      {(error || refinement.error || recording.error) && (
        <View className="px-4 py-2 bg-red-900/30 border-b border-red-500/30">
          <Text className="text-red-300 text-xs">
            {error || refinement.error || recording.error?.message}
          </Text>
        </View>
      )}

      {/* Source (reference) panel */}
      <View
        className="border-b border-white/5"
        style={{ maxHeight: 120 }}
      >
        <View className="px-4 pt-2 pb-1">
          <Text className="text-white/40 text-xs font-medium uppercase tracking-wider">
            Source / Reference
          </Text>
        </View>
        <ScrollView
          ref={sourceScrollRef}
          className="px-4 pb-2"
          showsVerticalScrollIndicator={false}
        >
          {refinement.sourceStable || sourcePartial ? (
            <Text
              style={{
                fontSize: 15,
                lineHeight: 28,
                color: "rgba(255,255,255,0.7)",
                textAlign: "right",
                fontFamily:
                  Platform.OS === "ios" ? "Geeza Pro" : "sans-serif",
              }}
            >
              {refinement.sourceStable}
              {sourcePartial ? (
                <Text style={{ color: "rgba(255,255,255,0.3)" }}>
                  {" "}
                  {sourcePartial}
                </Text>
              ) : null}
            </Text>
          ) : isListening ? (
            <Text className="text-white/25 text-sm italic">
              Listening for audio...
            </Text>
          ) : (
            <Text className="text-white/25 text-sm italic">
              Waiting for audio
            </Text>
          )}
        </ScrollView>
      </View>

      {/* Main translation area */}
      <ScrollView
        ref={translationScrollRef}
        className="flex-1 px-4 pt-3"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {hasRefined ? (
          refinement.refinedParagraphs.map((para, i) => (
            <FadeInView key={`refined-${i}`} style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 17,
                  lineHeight: 28,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {para}
              </Text>

              {refinement.verseReferences[i] && (
                <TouchableOpacity
                  onPress={() => {
                    const key = parseVerseKey(refinement.verseReferences[i]!);
                    if (key) setSelectedVerseKey(key);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 8,
                    alignSelf: "flex-start",
                    backgroundColor: `${accent.base}1A`,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: `${accent.base}33`,
                  }}
                >
                  <Ionicons
                    name="book-outline"
                    size={12}
                    color={accent.base}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: accent.base,
                    }}
                  >
                    {refinement.verseReferences[i]}
                  </Text>
                </TouchableOpacity>
              )}
            </FadeInView>
          ))
        ) : revealedWordCount > 0 ? (
          <Text
            style={{
              fontSize: 17,
              lineHeight: 28,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {allTranslationWords.slice(0, revealedWordCount).join(" ")}
          </Text>
        ) : null}

        {/* Live preview: partial translation or incoming cursor */}
        {isListening && (
          <View style={{ marginTop: hasResults ? 8 : 0 }}>
            {translationPartial ? (
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 26,
                  color: "rgba(255,255,255,0.5)",
                  fontStyle: "italic",
                }}
              >
                {translationPartial}
                <Text style={{ color: accent.base }}>|</Text>
              </Text>
            ) : !hasResults ? (
              <View className="flex-row items-center gap-2" style={{ opacity: 0.5 }}>
                <ActivityIndicator size="small" color={accent.base} />
                <Text className="text-white/30 text-sm">Listening...</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Empty state */}
        {!isListening && !hasResults && !hasStopped && (
          <View className="items-center pt-20">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: `${accent.base}1A` }}
            >
              <Ionicons name="mic-outline" size={36} color={accent.base} />
            </View>
            <Text className="text-white/50 text-base text-center">
              Tap the microphone to begin{"\n"}live translation
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Post-session actions */}
      {showPostActions && (
        <View
          className="flex-row px-4 py-3 border-t border-white/10 gap-2"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
        >
          <TouchableOpacity
            onPress={() => setShowSummary(true)}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl"
            style={{ backgroundColor: `${accent.base}1A` }}
          >
            <Ionicons name="sparkles" size={16} color={accent.base} />
            <Text
              style={{ color: accent.base }}
              className="text-sm font-medium"
            >
              Summary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCopy}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/6"
          >
            <Ionicons
              name="share-outline"
              size={16}
              color="rgba(255,255,255,0.7)"
            />
            <Text className="text-white/70 text-sm font-medium">Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            disabled={savingPast || savedPast}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/6"
          >
            {savingPast ? (
              <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
            ) : (
              <>
                <Ionicons
                  name={savedPast ? "checkmark-circle" : "bookmark-outline"}
                  size={16}
                  color={
                    savedPast ? accent.base : "rgba(255,255,255,0.7)"
                  }
                />
                <Text
                  style={savedPast ? { color: accent.base } : undefined}
                  className={
                    savedPast
                      ? "text-sm font-medium"
                      : "text-white/70 text-sm font-medium"
                  }
                >
                  {savedPast ? "Saved" : "Save"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Mic button */}
      <View
        className="items-center py-4 border-t border-white/10"
        style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
      >
        {micReady ? (
          <TouchableOpacity
            onPress={isListening ? handleStop : handleStart}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: isListening ? "#ef4444" : accent.base,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: isListening ? "#ef4444" : accent.base,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Ionicons
              name={isListening ? "stop" : "mic"}
              size={32}
              color={isListening ? "white" : "#000"}
            />
          </TouchableOpacity>
        ) : (
          <View className="items-center gap-2">
            <ActivityIndicator size="large" color={accent.base} />
            <Text className="text-white/40 text-xs">
              Requesting microphone...
            </Text>
          </View>
        )}
        <Text className="text-white/30 text-xs mt-2">
          {isListening
            ? "Tap to stop"
            : hasStopped
              ? "Tap to start again"
              : "Tap to begin"}
        </Text>
      </View>

      {/* Modals */}
      <VerseModal
        visible={!!selectedVerseKey}
        onClose={() => setSelectedVerseKey(null)}
        verseKey={selectedVerseKey}
        targetLang={targetLang}
      />

      <SummaryModal
        visible={showSummary}
        onClose={() => setShowSummary(false)}
        refinedText={
          refinement.refinedParagraphs.join("\n\n") || translationFinalText
        }
        sourceText={refinement.sourceStable}
        targetLang={targetLang}
      />
    </WallpaperBackground>
  );
}
