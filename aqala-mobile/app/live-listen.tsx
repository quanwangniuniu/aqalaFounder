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
  Modal,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecording } from "@soniox/react";
import { useKeepAwake } from "expo-keep-awake";
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import { Ionicons } from "@expo/vector-icons";

import WallpaperBackground from "@/components/WallpaperBackground";
import VerseModal from "@/components/VerseModal";
import VerseHighlightedText from "@/components/VerseHighlightedText";
import SummaryModal from "@/components/SummaryModal";
import EmailModal from "@/components/EmailModal";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, LANGUAGE_OPTIONS } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { savePastTranslation } from "@/lib/firebase/userPastTranslations";
import { SonioxAudioSource } from "@/lib/audio/SonioxAudioSource";
import { findVerseReference } from "@/lib/quran/findVerse";
import type { VerseHighlight } from "@/components/VerseHighlightedText";

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
    "en",
    "ar",
    "ur",
    "hi",
    "bn",
    "tr",
    "id",
    "fr",
    "de",
    "es",
    "pt",
    "ru",
    "zh",
    "ja",
    "ko",
    "vi",
    "th",
    "it",
  ].includes(l.code),
);

// ── Screen ───────────────────────────────────────────────────────────

export default function NativeLiveListenScreen() {
  useKeepAwake();

  const insets = useSafeAreaInsets();
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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [savingPast, setSavingPast] = useState(false);
  const [savedPast, setSavedPast] = useState(false);
  const [savedTranslationText, setSavedTranslationText] = useState("");
  const [verseHighlights, setVerseHighlights] = useState<VerseHighlight[]>([]);

  const selectedLangOption =
    LANG_OPTIONS.find((l) => l.code === targetLang) ?? LANG_OPTIONS[0];

  const translationScrollRef = useRef<ScrollView>(null);
  const sourceScrollRef = useRef<ScrollView>(null);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const userIsScrollingRef = useRef(false);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [savedSourceText, setSavedSourceText] = useState("");

  // ── Audio source (persistent across renders) ──────────────────────

  const audioSourceRef = useRef(new SonioxAudioSource());

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
      if (err?.name === "AbortError" || err?.message?.includes("aborted"))
        return;
      console.error("[LiveListen] Soniox error:", err);
      setError(err.message || "Transcription error");
    },
    onFinished: () => {},
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

  // ── Track Soniox output ──────────────────────────────────────────

  const groups = recording.groups;
  const translationFinalText = groups?.translation?.finalText ?? "";
  const sourceFinalText = groups?.original?.finalText ?? "";

  const baseTranslationRef = useRef("");
  const baseSourceRef = useRef("");
  const prevSessionTranslationRef = useRef("");
  const prevSessionSourceRef = useRef("");

  useEffect(() => {
    if (isListening) {
      baseTranslationRef.current = prevSessionTranslationRef.current;
      baseSourceRef.current = prevSessionSourceRef.current;
    }
  }, [isListening]);

  useEffect(() => {
    if (translationFinalText) {
      const combined = baseTranslationRef.current
        ? `${baseTranslationRef.current} ${translationFinalText}`
        : translationFinalText;
      setSavedTranslationText(combined);
      prevSessionTranslationRef.current = combined;
    }
  }, [translationFinalText]);

  useEffect(() => {
    if (sourceFinalText) {
      const combined = baseSourceRef.current
        ? `${baseSourceRef.current} ${sourceFinalText}`
        : sourceFinalText;
      setSavedSourceText(combined);
      prevSessionSourceRef.current = combined;
    }
  }, [sourceFinalText]);

  // ── Auto-scroll (teleprompter: latest text stays at vertical center) ──

  const scrollToCenter = useCallback(() => {
    if (userIsScrollingRef.current) return;
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    scrollDebounceRef.current = setTimeout(() => {
      translationScrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, []);

  // ── Verse detection (debounced on Arabic source text) ───────────────

  const verseDetectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detectingRef = useRef(false);
  const lastDetectedKeyRef = useRef<string | null>(null);
  const revealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Snapshot the translation word count when Arabic text starts arriving —
  // this marks where the Quran recitation begins in the translation stream
  const verseWordStartRef = useRef(0);
  const arabicStartedRef = useRef(false);

  const runVerseDetection = useCallback(async (
    fullArabic: string,
    wordEnd: number,
  ) => {
    if (detectingRef.current) return;
    if (fullArabic.trim().length < 10) return;
    detectingRef.current = true;

    try {
      const result = await findVerseReference(fullArabic.trim());
      if (result) {
        // Same result as last time — skip
        if (result.verseKey === lastDetectedKeyRef.current) {
          detectingRef.current = false;
          return;
        }
        lastDetectedKeyRef.current = result.verseKey;

        const wordStart = verseWordStartRef.current;

        // 3s reveal delay — text has been flowing as normal typewriter,
        // now quietly wrap the verse block around it
        const timer = setTimeout(() => {
          setVerseHighlights((prev) => {
            // Replace any existing highlight from the same chapter
            const chapter = result.verseKey.split(":")[0];
            const filtered = prev.filter(
              (h) => h.verseKey.split(":")[0] !== chapter,
            );
            return [
              ...filtered,
              {
                startWord: wordStart,
                endWord: wordEnd,
                verseKey: result.verseKey,
                verseReference: result.reference,
              },
            ];
          });
        }, 3000);
        revealTimersRef.current.push(timer);
      }
    } catch (err) {
      console.warn("[VerseDetect] Detection failed:", err);
    }
    detectingRef.current = false;
  }, []);

  // 5s debounce — only fires after Arabic text has been stable for 5 seconds,
  // meaning the reciter has clearly moved on from the Quran verse
  useEffect(() => {
    if (!savedSourceText) return;

    // Mark where in the translation the Arabic recitation started
    if (!arabicStartedRef.current) {
      arabicStartedRef.current = true;
      const currentWords = savedTranslationText.split(/\s+/).filter(Boolean).length;
      verseWordStartRef.current = currentWords;
    }

    if (verseDetectTimerRef.current) clearTimeout(verseDetectTimerRef.current);

    verseDetectTimerRef.current = setTimeout(() => {
      const transWords = savedTranslationText.split(/\s+/).filter(Boolean);
      // Send FULL accumulated Arabic for correct surah identification
      runVerseDetection(savedSourceText, transWords.length);
      // Reset start marker for next verse
      arabicStartedRef.current = false;
    }, 5000);

    return () => {
      if (verseDetectTimerRef.current) clearTimeout(verseDetectTimerRef.current);
    };
  }, [savedSourceText, savedTranslationText, runVerseDetection]);

  // Cleanup reveal timers on unmount
  useEffect(() => {
    return () => {
      revealTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────

  const handleStart = useCallback(() => {
    setError(null);
    setHasStopped(false);
    setSavedPast(false);
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
  }, [recording]);

  const handleStop = useCallback(async () => {
    try {
      await recording.stop();
    } catch {}
    setHasStopped(true);

    // Flush pending verse detection on stop — no need to wait 5s
    if (verseDetectTimerRef.current) clearTimeout(verseDetectTimerRef.current);
    if (savedSourceText.trim().length >= 10) {
      const transWords = savedTranslationText.split(/\s+/).filter(Boolean);
      runVerseDetection(savedSourceText, transWords.length);
    }
  }, [recording, savedSourceText, savedTranslationText, runVerseDetection]);

  const handleLanguageChange = useCallback(
    (code: string) => {
      setTargetLangState(code);
      if (isListening) {
        handleStop().then(() => {
          setTimeout(() => {
            recording.start();
            setHasStopped(false);
          }, 300);
        });
      }
    },
    [isListening, recording, handleStop],
  );

  const handleCopy = useCallback(async () => {
    if (!savedTranslationText.trim()) return;
    try {
      await Share.share({ message: savedTranslationText });
    } catch {}
  }, [savedTranslationText]);

  const getEmailContent = useCallback(() => {
    const sourceText = savedSourceText.trim();
    const translatedText = savedTranslationText.trim();
    const langLabel =
      LANG_OPTIONS.find((l) => l.code === targetLang)?.label || targetLang;
    const escape = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    const safeSource = escape(sourceText || "(No source text recorded)").replace(
      /\n/g,
      "<br>",
    );
    const safeTranslation = escape(
      translatedText || "(No translation recorded)",
    ).replace(/\n/g, "<br>");
    const safeLang = escape(langLabel);

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;background:#f5f5f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
<tr><td align="center" style="padding:0 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="padding:32px 32px 24px;border-bottom:1px solid #eee;">
<h1 style="margin:0;font-size:20px;font-weight:700;color:#1a1a1a;letter-spacing:-0.02em;">Quran Translation Record</h1>
<p style="margin:12px 0 0;font-size:14px;color:#666;">${new Date().toLocaleString()}</p>
<p style="margin:8px 0 0;font-size:14px;color:#666;"><strong>Source:</strong> Arabic &nbsp;|&nbsp; <strong>Translation:</strong> ${safeLang}</p>
</td></tr>
<tr><td style="padding:24px 32px;">
<p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.05em;">Original Text</p>
<p style="margin:0;padding:16px;background:#f9f9f9;border-radius:6px;font-size:16px;line-height:1.8;color:#333;border-left:3px solid #D4AF37;">${safeSource}</p>
</td></tr>
<tr><td style="padding:0 32px 24px;">
<p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.05em;">Translation</p>
<p style="margin:0;padding:16px;background:#f9f9f9;border-radius:6px;font-size:15px;line-height:1.8;color:#333;border-left:3px solid #D4AF37;">${safeTranslation}</p>
</td></tr>
<tr><td style="padding:20px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
<p style="margin:0;font-size:13px;color:#888;">Powered by <strong style="color:#1a1a1a;">Aqala</strong></p>
<p style="margin:4px 0 0;"><a href="https://aqala.org" style="color:#D4AF37;text-decoration:none;font-weight:500;">aqala.org</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    return {
      subject: `Quran Translation – ${new Date().toLocaleDateString()}`,
      body: `QURAN TRANSLATION RECORD

Date: ${new Date().toLocaleString()}
Source Language: Arabic
Translation Language: ${langLabel}

---

ORIGINAL TEXT

${sourceText || "(No source text recorded)"}

---

TRANSLATION

${translatedText || "(No translation recorded)"}

---

Powered by Aqala
https://aqala.org
`,
      html,
    };
  }, [savedSourceText, savedTranslationText, targetLang]);

  const handleSave = useCallback(async () => {
    if (!user?.uid || savingPast || savedPast) return;
    if (!savedTranslationText.trim()) return;
    setSavingPast(true);
    try {
      await savePastTranslation(user.uid, {
        sourceText: savedSourceText,
        translatedParagraphs: [savedTranslationText.trim()],
        verseReferences: verseHighlights.length > 0
          ? [verseHighlights[0].verseReference]
          : [],
        sourceLang: "ar",
        targetLang,
        verseHighlights: verseHighlights.length > 0 ? verseHighlights : undefined,
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
    savedSourceText,
    savedTranslationText,
    verseHighlights,
    targetLang,
  ]);

  // ── Derived ───────────────────────────────────────────────────────

  const translationPartial = recording.groups?.translation?.partialText ?? "";
  const sourcePartial = recording.groups?.original?.partialText ?? "";
  const hasResults = savedTranslationText.length > 0;
  const showPostActions = hasStopped && !isListening && hasResults;

  // ── Source panel auto-scroll ────────────────────────────────────────

  useEffect(() => {
    if (savedSourceText || sourcePartial) {
      setTimeout(
        () => sourceScrollRef.current?.scrollToEnd({ animated: true }),
        80,
      );
    }
  }, [savedSourceText, sourcePartial]);

  // ── Word-by-word typewriter reveal ──────────────────────────────────

  const allTranslationWords = useMemo(
    () => savedTranslationText.split(/\s+/).filter(Boolean),
    [savedTranslationText],
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
  }, [allTranslationWords.length, revealedWordCount, clearRevealTimer]);

  useEffect(() => {
    if (revealedWordCount > 0) scrollToCenter();
  }, [revealedWordCount, scrollToCenter]);

  // ── Verse reference parsing helper ────────────────────────────────

  const parseVerseKey = useCallback((reference: string): string | null => {
    const match = reference.match(/(\d+):(\d+(?:-\d+)?)/);
    return match ? `${match[1]}:${match[2]}` : null;
  }, []);

  // ── Render ────────────────────────────────────────────────────────

  return (
    <WallpaperBackground edges={["top"]}>
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
          <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
            <Ionicons name="mic" size={16} color="white" />
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

        <TouchableOpacity
          onPress={() => setShowLangPicker(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.15)",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.9)",
              fontWeight: "600",
            }}
          >
            {selectedLangOption?.flag} {selectedLangOption?.label}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color="rgba(255,255,255,0.5)"
          />
        </TouchableOpacity>
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

      {/* Error banner — suppress expected AbortError from stop/cleanup */}
      {(error ||
        (recording.error &&
          recording.error.name !== "AbortError" &&
          !recording.error.message?.includes("aborted"))) && (
        <View className="px-4 py-2 bg-red-900/30 border-b border-red-500/30">
          <Text className="text-red-300 text-xs">
            {error || recording.error?.message}
          </Text>
        </View>
      )}

      {/* Source (reference) panel — fixed 2-line height */}
      <View className="border-b border-white/5" style={{ height: 80 }}>
        <View className="px-4 pt-2 pb-1">
          <Text className="text-white/40 text-xs font-medium uppercase tracking-wider">
            Source / Reference
          </Text>
        </View>
        <ScrollView
          ref={sourceScrollRef}
          className="px-4 pb-2"
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {savedSourceText || sourcePartial ? (
            <Text
              style={{
                fontSize: 14,
                lineHeight: 22,
                color: "rgba(255,255,255,0.7)",
                textAlign: "right",
                fontFamily: Platform.OS === "ios" ? "Geeza Pro" : "sans-serif",
              }}
            >
              {savedSourceText}
              {sourcePartial ? (
                <Text style={{ color: "rgba(255,255,255,0.3)" }}>
                  {" "}
                  {sourcePartial}
                </Text>
              ) : null}
            </Text>
          ) : isListening ? (
            <Text className="text-white/25 text-xs italic">
              Listening for audio...
            </Text>
          ) : (
            <Text className="text-white/25 text-xs italic">
              Waiting for audio
            </Text>
          )}
        </ScrollView>
      </View>

      {/* Main translation area — teleprompter scroll keeps latest text centered */}
      <ScrollView
        ref={translationScrollRef}
        className="flex-1 px-4"
        onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: Math.max(scrollViewHeight * 0.5, 100),
        }}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          userIsScrollingRef.current = true;
        }}
        onMomentumScrollEnd={() => {
          userIsScrollingRef.current = false;
        }}
        onScrollEndDrag={() => {
          setTimeout(() => {
            userIsScrollingRef.current = false;
          }, 1200);
        }}
      >
        {revealedWordCount > 0 ? (
          <VerseHighlightedText
            words={allTranslationWords}
            highlights={verseHighlights}
            accentColor={accent.base}
            onVersePress={setSelectedVerseKey}
            maxWord={revealedWordCount}
          />
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
              <View
                className="flex-row items-center gap-2"
                style={{ opacity: 0.5 }}
              >
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
            <Ionicons name="sparkles" size={16} color="white" />
            <Text style={{ color: "white" }} className="text-sm font-medium">
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
                  color={savedPast ? accent.base : "rgba(255,255,255,0.7)"}
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

          <TouchableOpacity
            onPress={() => setShowEmailModal(true)}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/6"
          >
            <Ionicons
              name="mail-outline"
              size={16}
              color="rgba(255,255,255,0.7)"
            />
            <Text className="text-white/70 text-sm font-medium">Email</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mic button — bottom inset applied here so bar fills to screen edge (no dead gap below) */}
      <View
        className="items-center pt-4 border-t border-white/10"
        style={{
          backgroundColor: "rgba(0,0,0,0.15)",
          paddingBottom: Math.max(insets.bottom, 16),
        }}
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
        refinedText={savedTranslationText}
        sourceText={savedSourceText}
        targetLang={targetLang}
      />

      <EmailModal
        visible={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        content={getEmailContent()}
        userEmail={user?.email}
        accentColor={accent.base}
      />

      {/* Language picker */}
      <Modal
        visible={showLangPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLangPicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowLangPicker(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View
              style={{
                backgroundColor: "#0a1f16",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: 40,
                maxHeight: "60%",
              }}
            >
              <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
                <Text className="text-white font-semibold text-base">
                  Translate to
                </Text>
                <TouchableOpacity onPress={() => setShowLangPicker(false)}>
                  <Ionicons
                    name="close"
                    size={22}
                    color="rgba(255,255,255,0.5)"
                  />
                </TouchableOpacity>
              </View>
              <FlatList
                data={LANG_OPTIONS}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => {
                  const active = item.code === targetLang;
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        handleLanguageChange(item.code);
                        setShowLangPicker(false);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 20,
                        paddingVertical: 14,
                        backgroundColor: active
                          ? `${accent.base}15`
                          : "transparent",
                      }}
                    >
                      <Text style={{ fontSize: 20, marginRight: 12 }}>
                        {item.flag}
                      </Text>
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 15,
                          fontWeight: active ? "600" : "400",
                          color: active ? accent.base : "rgba(255,255,255,0.8)",
                        }}
                      >
                        {item.label}
                      </Text>
                      {active && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={accent.base}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </WallpaperBackground>
  );
}
