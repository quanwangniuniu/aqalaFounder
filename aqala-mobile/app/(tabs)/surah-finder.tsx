import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecording } from "@soniox/react";
import { useKeepAwake } from "expo-keep-awake";
import { useNetworkState } from "expo-network";
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import { Ionicons } from "@expo/vector-icons";

import WallpaperBackground from "@/components/WallpaperBackground";
import VerseModal from "@/components/VerseModal";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import {
  saveSurahFinderDetection,
  subscribeSurahFinderDetections,
  type SurahFinderDetection,
} from "@/lib/firebase/userSurahFinderDetections";
import { SonioxAudioSource } from "@/lib/audio/SonioxAudioSource";
import {
  findVerseReference,
  formatVerseKeyAndReference,
  parseVerseRangeFromKey,
  type VerseDetectionResult,
} from "@/lib/quran/findVerse";

const MAX_PAST_DETECTIONS = 25;

/** Server snapshot + optimistic rows saved before the listener sees the new doc. */
function mergePastDetectionsFromServer(
  server: SurahFinderDetection[],
  prev: SurahFinderDetection[],
  max: number,
): SurahFinderDetection[] {
  const byId = new Map<string, SurahFinderDetection>();
  for (const i of server) byId.set(i.id, i);
  for (const p of prev) {
    if (!byId.has(p.id)) byId.set(p.id, p);
  }
  return Array.from(byId.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, max);
}

const VERSE_DETECT_DEBOUNCE_MS = 900;
const VERSE_DETECT_INTERVAL_MS = 1600;

/** Matcher ratio (matched words / prefix length). Not shown as "accuracy of surah ID" but as alignment strength. */
function certaintyTier(
  confidence: number,
): "high" | "medium" | "low" {
  if (confidence >= 0.45) return "high";
  if (confidence >= 0.25) return "medium";
  return "low";
}

export default function SurahFinderScreen() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { getAccentColor } = usePreferences();
  const accent = getAccentColor();

  const userRef = useRef(user);
  userRef.current = user;

  const [micReady, setMicReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedArabic, setSavedArabic] = useState("");
  const [match, setMatch] = useState<VerseDetectionResult | null>(null);
  const [pastDetections, setPastDetections] = useState<SurahFinderDetection[]>(
    [],
  );
  const [pastDetectionsLoading, setPastDetectionsLoading] = useState(false);
  const [modalKey, setModalKey] = useState<string | null>(null);

  const networkState = useNetworkState();
  const isNetworkBlocked =
    networkState.isConnected === false ||
    networkState.isInternetReachable === false;

  const audioSourceRef = useRef(new SonioxAudioSource());

  const recording = useRecording({
    model: "stt-rt-preview",
    language_hints: ["ar"],
    enable_language_identification: true,
    enable_endpoint_detection: true,
    audio_format: "pcm_s16le",
    sample_rate: 16000,
    num_channels: 1,
    source: audioSourceRef.current,
    onError: (err) => {
      if (err?.name === "AbortError" || err?.message?.includes("aborted"))
        return;
      console.error("[SurahFinder] Soniox error:", err);
      setError(err.message || "Transcription error");
    },
    onFinished: () => {},
    onConnected: () => {},
    onResult: () => {},
  });

  const isListening = recording.isActive;
  const streamFinal = recording.finalText ?? "";
  const streamPartial = recording.partialText ?? "";

  const baseArabicRef = useRef("");
  const prevSessionArabicRef = useRef("");

  useEffect(() => {
    (async () => {
      const { granted } = await getRecordingPermissionsAsync();
      if (granted) setMicReady(true);
      else {
        const r = await requestRecordingPermissionsAsync();
        setMicReady(r.granted);
      }
    })();
  }, []);

  useEffect(() => {
    if (isListening) {
      baseArabicRef.current = prevSessionArabicRef.current;
    }
  }, [isListening]);

  useEffect(() => {
    if (!streamFinal) return;
    const combined = baseArabicRef.current
      ? `${baseArabicRef.current} ${streamFinal}`
      : streamFinal;
    setSavedArabic(combined);
    prevSessionArabicRef.current = combined;
  }, [streamFinal]);

  const savedArabicRef = useRef(savedArabic);
  savedArabicRef.current = savedArabic;

  const verseDetectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const detectingRef = useRef(false);
  const throttleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSpanByChapterRef = useRef<
    Record<string, { startVerse: number; endVerse: number }>
  >({});
  /** Last verseKey we saved to Firestore for this listen session (refinements share the same key). */
  const lastHistoryVerseKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setPastDetections([]);
      setPastDetectionsLoading(false);
      return;
    }
    setPastDetectionsLoading(true);
    const unsub = subscribeSurahFinderDetections(
      user.uid,
      (items) => {
        setPastDetections((prev) =>
          mergePastDetectionsFromServer(items, prev, MAX_PAST_DETECTIONS),
        );
        setPastDetectionsLoading(false);
      },
      (err) => {
        console.warn("[SurahFinder] Past detections sync:", err);
        setPastDetectionsLoading(false);
      },
      MAX_PAST_DETECTIONS,
    );
    return () => unsub();
  }, [user?.uid]);

  const runDetection = useCallback(async (fullArabic: string) => {
    if (detectingRef.current) return;
    if (fullArabic.trim().length < 10) return;
    detectingRef.current = true;

    try {
      const result = await findVerseReference(fullArabic.trim(), {
        mode: "surahFinder",
      });
      if (!result) {
        detectingRef.current = false;
        return;
      }

      const parsed = parseVerseRangeFromKey(result.verseKey);
      if (!parsed) {
        detectingRef.current = false;
        return;
      }

      const chStr = String(parsed.chapter);
      let startVerse = parsed.startVerse;
      let endVerse = parsed.endVerse;
      const kept = lastSpanByChapterRef.current[chStr];
      const VERSE_MERGE_GAP = 5;
      if (
        kept &&
        startVerse <= kept.endVerse + VERSE_MERGE_GAP &&
        endVerse >= kept.startVerse - VERSE_MERGE_GAP
      ) {
        startVerse = Math.min(kept.startVerse, startVerse);
        endVerse = Math.max(kept.endVerse, endVerse);
      }
      lastSpanByChapterRef.current[chStr] = { startVerse, endVerse };

      const { verseKey, reference } = formatVerseKeyAndReference(
        parsed.chapter,
        startVerse,
        endVerse,
      );

      const merged: VerseDetectionResult = {
        ...result,
        verseKey,
        reference,
        confidence: result.confidence,
      };

      if (merged.verseKey !== lastHistoryVerseKeyRef.current) {
        lastHistoryVerseKeyRef.current = merged.verseKey;
        const uid = userRef.current?.uid;
        if (uid) {
          void saveSurahFinderDetection(uid, {
            verseKey: merged.verseKey,
            reference: merged.reference,
            confidence: merged.confidence,
          })
            .then((docId) => {
              setPastDetections((prev) => {
                if (prev.some((p) => p.id === docId)) return prev;
                const row: SurahFinderDetection = {
                  id: docId,
                  userId: uid,
                  verseKey: merged.verseKey,
                  reference: merged.reference,
                  confidence: merged.confidence,
                  createdAt: new Date(),
                };
                return mergePastDetectionsFromServer(
                  [row],
                  prev,
                  MAX_PAST_DETECTIONS,
                );
              });
            })
            .catch((e) => {
              console.warn("[SurahFinder] Failed to save detection:", e);
            });
        }
      }

      setMatch(merged);
    } catch (e) {
      console.warn("[SurahFinder] Detection failed:", e);
    }
    detectingRef.current = false;
  }, []);

  useEffect(() => {
    if (!savedArabic.trim()) return;
    if (verseDetectTimerRef.current) clearTimeout(verseDetectTimerRef.current);
    verseDetectTimerRef.current = setTimeout(() => {
      runDetection(savedArabicRef.current.trim());
    }, VERSE_DETECT_DEBOUNCE_MS);
    return () => {
      if (verseDetectTimerRef.current)
        clearTimeout(verseDetectTimerRef.current);
    };
  }, [savedArabic, runDetection]);

  useEffect(() => {
    if (!isListening) return;
    const id = setInterval(() => {
      const src = savedArabicRef.current;
      if (!src || src.trim().length < 10) return;
      void runDetection(src.trim());
    }, VERSE_DETECT_INTERVAL_MS);
    throttleTimerRef.current = id;
    return () => {
      clearInterval(id);
      if (throttleTimerRef.current === id) throttleTimerRef.current = null;
    };
  }, [isListening, runDetection]);

  useEffect(() => {
    return () => {
      if (verseDetectTimerRef.current) clearTimeout(verseDetectTimerRef.current);
      if (throttleTimerRef.current) clearInterval(throttleTimerRef.current);
    };
  }, []);

  const recordingStopRef = useRef(recording.stop);
  recordingStopRef.current = recording.stop;

  useEffect(() => {
    if (!isListening || !isNetworkBlocked) return;
    void (async () => {
      try {
        await recordingStopRef.current();
      } catch {}
      setError(t("listen.connectionLost"));
    })();
  }, [isListening, isNetworkBlocked, t]);

  const handleStart = useCallback(() => {
    if (isNetworkBlocked) {
      setError(t("listen.needInternetForLive"));
      return;
    }
    setError(null);
    setMatch(null);
    lastSpanByChapterRef.current = {};
    lastHistoryVerseKeyRef.current = null;
    try {
      recording.start();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("AudioStudio")) {
        setError(
          "Native audio module not available. Please use a development build (not Expo Go).",
        );
      } else {
        setError(msg);
      }
    }
  }, [recording, isNetworkBlocked, t]);

  const handleStop = useCallback(async () => {
    try {
      await recording.stop();
    } catch {}
    if (verseDetectTimerRef.current) clearTimeout(verseDetectTimerRef.current);
    const src = savedArabicRef.current.trim();
    if (src.length >= 10) {
      await runDetection(src);
    }
  }, [recording, runDetection]);

  const handleFindAnotherSurah = useCallback(async () => {
    try {
      if (recording.isActive) await recording.stop();
    } catch {}
    if (verseDetectTimerRef.current) clearTimeout(verseDetectTimerRef.current);
    setMatch(null);
    setSavedArabic("");
    baseArabicRef.current = "";
    prevSessionArabicRef.current = "";
    lastSpanByChapterRef.current = {};
    lastHistoryVerseKeyRef.current = null;
    setError(null);
  }, [recording]);

  const showError =
    error ||
    (recording.error &&
      recording.error.name !== "AbortError" &&
      !recording.error.message?.includes("aborted") &&
      recording.error.message);

  const matchTier = match ? certaintyTier(match.confidence) : null;
  const pctRounded = match ? Math.round(match.confidence * 100) : 0;

  return (
    <WallpaperBackground edges={["top"]}>
      <View
        className="flex-row items-center px-4 py-3 border-b border-white/10"
        style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
      >
        <TouchableOpacity
          onPress={() => router.navigate("/listen")}
          accessibilityRole="button"
          accessibilityLabel="Back to Listen"
          className="w-9 h-9 rounded-full bg-white/10 items-center justify-center mr-3"
        >
          <Ionicons name="chevron-back" size={20} color="white" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center gap-2 min-w-0">
          <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
            <Ionicons name="radio-outline" size={17} color="white" />
          </View>
          <View className="flex-1 min-w-0">
            <Text
              className="text-white font-semibold text-base"
              numberOfLines={1}
            >
              {t("listen.surahFinderTitle")}
            </Text>
            <Text className="text-white/45 text-[11px]" numberOfLines={1}>
              {t("listen.surahFinderSubtitle")}
            </Text>
          </View>
          {isListening ? (
            <View
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#ef444433" }}
            >
              <Text className="text-red-400 text-xs font-medium">LIVE</Text>
            </View>
          ) : null}
        </View>
      </View>

      {isNetworkBlocked ? (
        <View className="px-4 py-2.5 bg-amber-900/35 border-b border-amber-500/25">
          <Text className="text-amber-100 text-xs">{t("listen.offlineDetail")}</Text>
        </View>
      ) : null}

      {!micReady ? (
        <View className="px-4 py-3 bg-red-900/30 border-b border-red-500/30">
          <Text className="text-red-300 text-xs">
            Microphone access is required.
          </Text>
        </View>
      ) : null}

      {showError ? (
        <View className="px-4 py-2 bg-red-900/30 border-b border-red-500/30">
          <Text className="text-red-300 text-xs">
            {error || recording.error?.message}
          </Text>
        </View>
      ) : null}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: `${accent.base}28` }}
          >
            <Ionicons name="radio-outline" size={36} color={accent.base} />
          </View>
          <Text className="text-white/70 text-sm text-center leading-relaxed px-2">
            {t("listen.surahFinderHint")}
          </Text>
        </View>

        {match ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setModalKey(match.verseKey)}
            className="rounded-2xl border border-white/10 p-5 mb-4"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            <Text className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-3">
              {t("listen.surahFinderMatchLabel")}
            </Text>
            <View className="flex-row items-start justify-between gap-3 mb-3">
              <View
                className="px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor:
                    matchTier === "high"
                      ? "rgba(52,211,153,0.2)"
                      : matchTier === "medium"
                        ? "rgba(251,191,36,0.2)"
                        : "rgba(251,146,60,0.22)",
                }}
              >
                <Text
                  className="text-[11px] font-semibold"
                  style={{
                    color:
                      matchTier === "high"
                        ? "#6ee7b7"
                        : matchTier === "medium"
                          ? "#fcd34d"
                          : "#fdba74",
                  }}
                >
                  {matchTier === "high"
                    ? t("listen.surahFinderCertaintyStrong")
                    : matchTier === "medium"
                      ? t("listen.surahFinderCertaintyLikely")
                      : t("listen.surahFinderCertaintyTentative")}
                </Text>
              </View>
              <Text
                className="text-2xl font-bold tabular-nums"
                style={{ color: accent.base }}
              >
                {pctRounded}%
              </Text>
            </View>
            <Text
              className="text-xl font-semibold leading-snug"
              style={{ color: accent.base }}
            >
              {match.reference}
            </Text>
            <Text className="text-white/40 text-xs mt-3 leading-relaxed">
              {t("listen.surahFinderConfidence").replace(
                "{pct}",
                String(pctRounded),
              )}
            </Text>
            <Text className="text-[#D4AF37]/90 text-xs mt-2">
              {t("listen.surahFinderTapVerse")}
            </Text>
          </TouchableOpacity>
        ) : null}

        {match || isListening || savedArabic.length > 0 ? (
          <TouchableOpacity
            onPress={() => void handleFindAnotherSurah()}
            accessibilityRole="button"
            accessibilityLabel={t("listen.surahFinderFindAnother")}
            className="rounded-xl border border-white/15 py-3 px-4 mb-4 items-center"
            style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            activeOpacity={0.8}
          >
            <Text className="text-white/85 text-sm font-medium">
              {t("listen.surahFinderFindAnother")}
            </Text>
          </TouchableOpacity>
        ) : null}

        {!match && isListening && savedArabic.length > 0 ? (
          <View className="items-center py-4 mb-4">
            <ActivityIndicator size="small" color={accent.base} />
            <Text className="text-white/45 text-xs mt-3 text-center">
              {t("listen.surahFinderIdentifying")}
            </Text>
          </View>
        ) : null}

        {match && isListening ? (
          <View className="flex-row items-center justify-center gap-2 mb-4 px-2">
            <ActivityIndicator size="small" color={accent.base} />
            <Text className="text-white/40 text-[11px] text-center flex-1">
              {t("listen.surahFinderRefining")}
            </Text>
          </View>
        ) : null}

        {(savedArabic.length > 0 || streamPartial) && (
          <View
            className="rounded-xl border border-white/5 p-4 mb-4"
            style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
          >
            <Text className="text-white/40 text-[10px] font-medium uppercase tracking-wider mb-2">
              {t("listen.surahFinderHeard")}
            </Text>
            <Text
              style={{
                fontSize: 15,
                lineHeight: 26,
                color: "rgba(255,255,255,0.75)",
                textAlign: "right",
                fontFamily: Platform.OS === "ios" ? "Geeza Pro" : "sans-serif",
              }}
            >
              {savedArabic}
              {streamPartial ? (
                <Text style={{ color: "rgba(255,255,255,0.28)" }}>
                  {" "}
                  {streamPartial}
                </Text>
              ) : null}
            </Text>
          </View>
        )}

        <View className="mb-4">
          <Text className="text-white/45 text-[10px] font-semibold uppercase tracking-widest mb-2">
            {t("listen.surahFinderPastDetections")}
          </Text>
          {!user?.uid ? (
            <TouchableOpacity
              onPress={() => router.push("/auth/login")}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <Text className="text-white/35 text-xs leading-relaxed">
                {t("listen.surahFinderPastSignIn")}
              </Text>
              <Text className="text-[#D4AF37]/90 text-xs mt-1 font-medium">
                {t("listen.signIn")}
              </Text>
            </TouchableOpacity>
          ) : pastDetectionsLoading ? (
            <View className="py-2">
              <ActivityIndicator size="small" color={accent.base} />
            </View>
          ) : pastDetections.length === 0 ? (
            <Text className="text-white/30 text-xs leading-relaxed">
              {t("listen.surahFinderPastEmpty")}
            </Text>
          ) : (
            <View className="gap-2">
              {pastDetections.map((row) => {
                const tier = certaintyTier(row.confidence);
                const pct = Math.round(row.confidence * 100);
                const timeLabel = row.createdAt.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <TouchableOpacity
                    key={row.id}
                    onPress={() => setModalKey(row.verseKey)}
                    activeOpacity={0.85}
                    className="rounded-xl border border-white/8 p-3 flex-row items-center justify-between gap-3"
                    style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                  >
                    <View className="flex-1 min-w-0">
                      <Text
                        className="text-[13px] font-semibold"
                        style={{ color: accent.base }}
                        numberOfLines={2}
                      >
                        {row.reference}
                      </Text>
                      <Text className="text-white/35 text-[11px] mt-0.5">
                        {timeLabel} · {pct}%
                        {tier === "high"
                          ? ` · ${t("listen.surahFinderCertaintyStrong")}`
                          : tier === "medium"
                            ? ` · ${t("listen.surahFinderCertaintyLikely")}`
                            : ` · ${t("listen.surahFinderCertaintyTentative")}`}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="rgba(255,255,255,0.35)"
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {!isListening && !savedArabic && !match ? (
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-white/45 text-sm text-center px-4">
              {t("listen.surahFinderIdle")}
            </Text>
          </View>
        ) : null}
      </ScrollView>

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
            disabled={!isListening && isNetworkBlocked}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: isListening
                ? "#ef4444"
                : isNetworkBlocked
                  ? "rgba(255,255,255,0.25)"
                  : accent.base,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: isListening ? "#ef4444" : accent.base,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Ionicons
              name={isListening ? "stop" : "mic"}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>
        ) : (
          <ActivityIndicator size="large" color={accent.base} />
        )}
        <Text className="text-white/65 text-xs mt-2 text-center px-6">
          {isNetworkBlocked && !isListening
            ? t("listen.needInternetForLive")
            : isListening
              ? t("listen.surahFinderTapStop")
              : t("listen.surahFinderTapStart")}
        </Text>
      </View>

      <VerseModal
        visible={!!modalKey}
        onClose={() => setModalKey(null)}
        verseKey={modalKey}
        targetLang={language || "en"}
      />
    </WallpaperBackground>
  );
}
