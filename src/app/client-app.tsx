"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import CharityModal from "./charity-modal";
import VerseModal from "@/components/VerseModal";
import EmailModal from "@/components/EmailModal";
import Toast from "@/components/Toast";
import {
  saveTranslation,
  subscribeTranslations,
  TranslationEntry,
} from "@/lib/firebase/translationHistory";
import { updateBroadcastActivity } from "@/lib/firebase/rooms";
import { useRooms } from "@/contexts/RoomsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useLiveKitBroadcast, BroadcastMessage } from "@/hooks/useLiveKitBroadcast";

// Client-side API key - must be prefixed with NEXT_PUBLIC_ to be available in browser
const SONIOX_API_KEY = process.env.NEXT_PUBLIC_SONIOX_API_KEY || "";

function concatReadable(...parts: string[]) {
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ClientApp({
  autoStart = false,
  openDonate = false,
  mosqueId,
  translatorId,
  onClaimReciter,
  onReleaseReciter,
}: {
  autoStart?: boolean;
  openDonate?: boolean;
  mosqueId?: string;
  translatorId?: string;
  onClaimReciter?: () => Promise<void>;
  onReleaseReciter?: () => Promise<void>;
}) {
  const router = useRouter();
  const { rooms } = useRooms();
  const { user } = useAuth();
  const { language: preferredLanguage, t, isRTL } = useLanguage();
  const { getAccentColor } = usePreferences();
  const accentColor = getAccentColor();
  
  // LiveKit for real-time translation + audio broadcast
  const {
    connect: connectLiveKit,
    disconnect: disconnectLiveKit,
    sendMessage: sendLiveKitMessage,
    toggleAudio: toggleLiveKitAudio,
    isConnected: liveKitConnected,
    isAudioEnabled: liveKitAudioEnabled,
  } = useLiveKitBroadcast({
    roomName: mosqueId || "default",
    participantName: translatorId || "broadcaster",
    isPublisher: true,
  });
  
  const clientRef = useRef<any | null>(null);
  const startedRef = useRef<boolean>(false);
  const enFinalSeen = useRef<Set<string>>(new Set());
  const arFinalSeen = useRef<Set<string>>(new Set());
  const [isListening, setIsListening] = useState(false);
  const [hasStopped, setHasStopped] = useState(false);
  // Ref to track stopped state synchronously (avoids stale closures)
  const stoppedRef = useRef<boolean>(false);
  // Flag to prevent Firestore from loading ANY translations until session starts
  // This prevents stale/old translations from appearing on page refresh
  const sessionStartedRef = useRef<boolean>(false);
  const LANG_OPTIONS = [
    { code: "en", label: "English" },
    { code: "ar", label: "Arabic" },
    { code: "ur", label: "Urdu" },
    { code: "hi", label: "Hindi" },
    { code: "bn", label: "Bengali" },
    { code: "pa", label: "Punjabi" },
    { code: "tr", label: "Turkish" },
    { code: "id", label: "Indonesian" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
    { code: "it", label: "Italian" },
    { code: "pt", label: "Portuguese" },
    { code: "ru", label: "Russian" },
    { code: "zh", label: "Chinese" },
    { code: "ja", label: "Japanese" },
    { code: "ko", label: "Korean" },
    { code: "vi", label: "Vietnamese" },
    { code: "th", label: "Thai" },
  ];
  // Initialize targetLang from user's preferred language (from language selection modal)
  const [targetLang, setTargetLang] = useState(preferredLanguage || "en");
  // Ref to track targetLang synchronously (avoids stale closures in callbacks)
  const targetLangRef = useRef<string>(preferredLanguage || "en");
  // Flag to prevent onFinished from setting isListening=false during language switch
  const switchingLanguageRef = useRef<boolean>(false);
  const labelFor = (code: string) =>
    LANG_OPTIONS.find((l) => l.code === code)?.label ?? code;
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const detectedLangRef = useRef<string | null>(null);
  const [enParagraphs, setEnParagraphs] = useState<string[]>([]);
  const [refinedParagraphs, setRefinedParagraphs] = useState<string[]>([]);
  // Ref to track refinedParagraphs for live broadcast (avoids stale closure)
  const refinedParagraphsRef = useRef<string[]>([]);
  // Verse references corresponding to each refined paragraph (e.g., "Al-Fatiha 1:2")
  const [verseReferences, setVerseReferences] = useState<(string | null)[]>([]);
  // Currently selected verse key for the modal (e.g., "18:38" or "18:38-42")
  const [selectedVerseKey, setSelectedVerseKey] = useState<string | null>(null);
  const [enPartial, setEnPartial] = useState("");
  const enPartialRef = useRef("");
  const [enCurrent, setEnCurrent] = useState("");
  const enCurrentRef = useRef("");
  // Track last displayed live text to avoid flashing "Listening..." between words
  const lastLiveTextRef = useRef<string>("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const translationScrollRef = useRef<HTMLDivElement | null>(null);
  const [userAtBottom, setUserAtBottom] = useState(true);
  const FOOTER_OFFSET_PX = 160;
  // Reference source text (original language) to show it's listening
  const [srcStable, setSrcStable] = useState("");
  const srcStableRef = useRef("");
  const [srcPartial, setSrcPartial] = useState("");
  const srcPartialRef = useRef("");
  const refScrollRef = useRef<HTMLDivElement | null>(null);
  const refAtBottomRef = useRef<boolean>(true);
  // Sequential refinement queue: refine one batch (EN+AR) at a time for steady flow
  const pendingQueueRef = useRef<
    Array<{ en: string; ar: string; fast?: boolean }>
  >([]);
  const refiningRef = useRef<boolean>(false);
  // UI: bottom sheet modal visibility
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // Char-capped accumulator for quicker, smaller paragraphs
  const accumulatorRef = useRef<string>("");
  const arabicAccumulatorRef = useRef<string>("");
  const arabicSentenceBufferRef = useRef<string>("");
  const arabicThreeRef = useRef<string[]>([]);
  const accFlushTimerRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string>("");

  // Email & copy feature states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  // Summary feature states
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  // Q&A chat states for summary follow-up questions
  const [summaryConversation, setSummaryConversation] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const summaryScrollRef = useRef<HTMLDivElement>(null);
  const qaEndRef = useRef<HTMLDivElement>(null);
  // Track loaded translation IDs to avoid duplicates
  const loadedTranslationIdsRef = useRef<Set<string>>(new Set());
  // Track translations by targetLang to handle language switching
  const translationMapRef = useRef<Map<string, string[]>>(new Map());
  // Live stream broadcast interval for <1 second translation latency
  const liveStreamIntervalRef = useRef<number | null>(null);
  // Track accumulated finalized translations for live broadcast
  const liveAccumulatedRef = useRef<string>("");

  function resetSilenceTimer() {
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    // If there is no activity for 3s, force-flush whatever we have
    silenceTimerRef.current = window.setTimeout(() => {
      // Use ref to avoid stale closure
      if (!stoppedRef.current) {
        flushPendingNow();
      }
    }, 3000);
  }

  // Track last sent message to avoid duplicate sends
  const lastSentTextRef = useRef<string>("");
  
  // Track broadcast activity updates (don't spam Firestore)
  const lastActivityUpdateRef = useRef<number>(0);
  const ACTIVITY_UPDATE_INTERVAL_MS = 5000; // Update activity every 5 seconds
  
  // Start live stream broadcasting via LiveKit WebSocket (real-time, no Firestore writes)
  function startLiveStreamBroadcast() {
    if (!mosqueId || !translatorId) return;

    // Connect to LiveKit room for broadcasting (audio can be toggled separately)
    connectLiveKit();

    // Clear any existing interval
    if (liveStreamIntervalRef.current) {
      window.clearInterval(liveStreamIntervalRef.current);
    }

    // Reset accumulated text
    liveAccumulatedRef.current = "";
    lastActivityUpdateRef.current = 0;
    
    // Update activity immediately on start
    updateBroadcastActivity(mosqueId);

    // Broadcast every 500ms via LiveKit WebSocket (no Firestore writes!)
    liveStreamIntervalRef.current = window.setInterval(() => {
      // Combine all finalized refined paragraphs + current accumulator + partial
      const refinedText = refinedParagraphsRef.current.join("\n\n");
      const currentRaw = concatReadable(enCurrentRef.current, enPartialRef.current);
      const fullText = concatReadable(refinedText, currentRaw);

      // Only send if content changed
      if (fullText === lastSentTextRef.current && !enPartialRef.current) return;
      lastSentTextRef.current = fullText;

      // Send via LiveKit data channel (WebSocket - instant, no write limits)
      sendLiveKitMessage({
        type: "translation",
        text: fullText,
        partial: enPartialRef.current,
        lang: targetLangRef.current,
        timestamp: Date.now(),
      });

      // Also send source text if available
      if (srcStableRef.current || srcPartialRef.current) {
        sendLiveKitMessage({
          type: "source",
          text: srcStableRef.current,
          partial: srcPartialRef.current,
          lang: detectedLangRef.current || "unknown",
          timestamp: Date.now(),
        });
      }
      
      // Update broadcast activity every 5 seconds (to mark room as live)
      const now = Date.now();
      if (now - lastActivityUpdateRef.current > ACTIVITY_UPDATE_INTERVAL_MS) {
        lastActivityUpdateRef.current = now;
        updateBroadcastActivity(mosqueId);
      }
    }, 500);
  }

  // Stop live stream broadcasting
  function stopLiveStreamBroadcast() {
    if (liveStreamIntervalRef.current) {
      window.clearInterval(liveStreamIntervalRef.current);
      liveStreamIntervalRef.current = null;
    }

    // Disconnect from LiveKit (audio stops automatically)
    disconnectLiveKit();
  }

  function flushPendingNow() {
    // Combine any finalized leftover plus current partials to avoid losing last words on stop
    const finalizedLeftover = (enCurrentRef.current || "").trim();
    const enToFlush = concatReadable(finalizedLeftover, enPartial);
    const arToFlush = concatReadable(arabicAccumulatorRef.current, srcPartial);
    if (enToFlush.length > 0) {
      pendingQueueRef.current.push({
        en: enToFlush,
        ar: arToFlush,
      });
      enCurrentRef.current = "";
      setEnCurrent("");
    }
    // Cancel any idle timer
    if (accFlushTimerRef.current) {
      window.clearTimeout(accFlushTimerRef.current);
      accFlushTimerRef.current = null;
    }
    // Flush any previously accumulated batch awaiting size/timeout
    if (accumulatorRef.current && accumulatorRef.current.trim().length > 0) {
      pendingQueueRef.current.push({
        en: accumulatorRef.current.trim(),
        ar: arabicAccumulatorRef.current,
      });
      accumulatorRef.current = "";
      arabicAccumulatorRef.current = "";
    }
    // Kick the refine queue
    if (!refiningRef.current) {
      triggerRefine();
    }
  }

  useEffect(() => {
    return () => {
      try {
        clientRef.current?.cancel();
      } catch {}
      // Clean up live stream on unmount
      if (liveStreamIntervalRef.current) {
        window.clearInterval(liveStreamIntervalRef.current);
      }
      // Disconnect from LiveKit
      disconnectLiveKit();
    };
  }, [mosqueId, disconnectLiveKit]);

  // Sync refs with state for live stream broadcast (avoids stale closures in setInterval)
  useEffect(() => {
    refinedParagraphsRef.current = refinedParagraphs;
  }, [refinedParagraphs]);

  useEffect(() => {
    enPartialRef.current = enPartial;
  }, [enPartial]);

  useEffect(() => {
    srcStableRef.current = srcStable;
  }, [srcStable]);

  useEffect(() => {
    srcPartialRef.current = srcPartial;
  }, [srcPartial]);

  useEffect(() => {
    detectedLangRef.current = detectedLang;
  }, [detectedLang]);

  // Optionally open the donation modal on mount (from landing page secondary button)
  useEffect(() => {
    if (openDonate) {
      setIsSheetOpen(true);
    }
  }, [openDonate]);

  // Auto-start listening when arriving on /translate
  useEffect(() => {
    if (autoStart && !startedRef.current) {
      startedRef.current = true;
      // Defer to ensure mount completes
      setTimeout(() => {
        if (!isListening) {
          handleStart();
        }
      }, 0);
    }
  }, [autoStart, isListening]);

  // Track current targetLang to detect changes
  const prevTargetLangRef = useRef<string>(targetLang);

  // Sync targetLang with preferredLanguage from context when it changes (e.g., from language modal)
  useEffect(() => {
    if (preferredLanguage && preferredLanguage !== targetLang && !isListening) {
      setTargetLang(preferredLanguage);
      targetLangRef.current = preferredLanguage;
    }
  }, [preferredLanguage]);

  // Subscribe to Firestore translations to load historical data
  useEffect(() => {
    if (!mosqueId || !user) {
      return;
    }

    // If targetLang changed, reset and reload translations for new language
    if (prevTargetLangRef.current !== targetLang) {
      prevTargetLangRef.current = targetLang;
      // Clear paragraphs for new language - we'll reload them
      const langKey = targetLang;
      if (!translationMapRef.current.has(langKey)) {
        translationMapRef.current.set(langKey, []);
        setRefinedParagraphs([]);
      } else {
        // Restore paragraphs for this language
        setRefinedParagraphs(translationMapRef.current.get(langKey) || []);
      }
    }

    const unsubscribe = subscribeTranslations(
      mosqueId,
      (incoming) => {
        // CRITICAL: Don't load ANY translations until a session has been explicitly started
        // This prevents stale translations from appearing on page refresh
        if (!sessionStartedRef.current) return;

        // Only load translations from current session (prevents old translations from appearing)
        const currentSession = sessionIdRef.current;
        if (!currentSession) return; // No active session

        // Filter to only show translations matching current target language AND current session
        const matchingLang = incoming.filter(
          (entry) =>
            entry.targetLang === targetLang &&
            entry.sessionId === currentSession
        );

        const langKey = targetLang;
        const existingForLang = translationMapRef.current.get(langKey) || [];
        const existingTexts = new Set(existingForLang);

        // Find new translations we haven't loaded yet for this language
        const newTranslations = matchingLang.filter((entry) => {
          const entryKey = `${entry.id}_${targetLang}`;
          // Skip if already loaded for this language
          if (loadedTranslationIdsRef.current.has(entryKey)) {
            return false;
          }
          // Skip if content already exists (avoid duplicates)
          return !existingTexts.has(entry.translatedText);
        });

        if (newTranslations.length > 0) {
          const newParagraphs = newTranslations.map(
            (entry) => entry.translatedText
          );

          // Update stored translations for this language
          const updatedForLang = [...existingForLang, ...newParagraphs];
          translationMapRef.current.set(langKey, updatedForLang);

          // Update refinedParagraphs, avoiding duplicates with current state
          setRefinedParagraphs((prev) => {
            const prevSet = new Set(prev);
            const uniqueNew = newParagraphs.filter(
              (text) => !prevSet.has(text)
            );
            return uniqueNew.length > 0 ? [...prev, ...uniqueNew] : prev;
          });

          // Mark these translations as loaded for this language
          newTranslations.forEach((entry) => {
            const entryKey = `${entry.id}_${targetLang}`;
            loadedTranslationIdsRef.current.add(entryKey);
          });
        }
      },
      (err) => {
        // Silently ignore permission errors
        if (
          err?.code !== "permission-denied" &&
          !err?.message?.includes("permission")
        ) {
          console.error("Error loading translation history:", err);
        }
      }
    );

    return () => unsubscribe();
  }, [mosqueId, user, targetLang]);

  // Single-line reference preview: always show the latest ~120 chars
  const oneLineReference = useMemo(() => {
    const all = concatReadable(srcStable, srcPartial);
    const maxChars = 120;
    if (!all) return "";
    return all.length > maxChars ? all.slice(all.length - maxChars) : all;
  }, [srcStable, srcPartial]);

  // End of reference helpers
  function buildContextSnippet(): string {
    const refinedContext = refinedParagraphs.join("\n");
    // Use the last ~3000 characters for context to keep tokens bounded
    const maxChars = 3000;
    const ctx =
      refinedContext.length > maxChars
        ? refinedContext.slice(refinedContext.length - maxChars)
        : refinedContext;
    return ctx;
  }

  function buildArabicSnippet(): string {
    const recent = concatReadable(srcStable, srcPartial);
    const maxChars = 450;
    return recent.length > maxChars
      ? recent.slice(recent.length - maxChars)
      : recent;
  }

  async function refineSegment(
    text: string,
    arabic?: string,
    fast?: boolean
  ): Promise<{ result: string | null; verseReference: string | null }> {
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          context: buildContextSnippet(),
          arabicText: arabic ?? buildArabicSnippet(),
          fast: !!fast,
          targetLang: targetLangRef.current,
        }),
      });
      if (!res.ok) {
        let detailText = "";
        try {
          const d = await res.json();
          detailText =
            typeof d?.detail === "string" ? d.detail : JSON.stringify(d);
        } catch {
          detailText = await res.text();
        }
        setError(`Refine error (${res.status}): ${detailText}`);
        return { result: null, verseReference: null };
      }
      const data = await res.json();
      return {
        result: (data?.result as string) || null,
        verseReference: (data?.verseReference as string) || null,
      };
    } catch (e: any) {
      setError(`Refine request failed: ${e?.message ?? String(e)}`);
      return { result: null, verseReference: null };
    }
  }

  function splitRefinedIntoParas(
    text: string,
    maxLen = 420,
    maxSentencesPerChunk = 2
  ): string[] {
    const cleaned = (text || "").trim();
    if (cleaned.length === 0) return [];
    // If server returned explicit paragraphs separated by blank lines, prefer those
    const paraParts = cleaned
      .split(/\n\s*\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (paraParts.length > 1) {
      // If any paragraph is extremely long, softly split by sentences to keep <= maxLen
      const out: string[] = [];
      for (const para of paraParts) {
        const bySent = splitIntoSentences(para);
        let cur = "";
        let sentCount = 0;
        for (const s of bySent) {
          const next = cur ? `${cur} ${s}` : s;
          if (
            (next.length > maxLen && cur) ||
            sentCount + 1 > maxSentencesPerChunk
          ) {
            out.push(cur);
            cur = s;
            sentCount = 1;
          } else {
            cur = next;
            sentCount += 1;
          }
        }
        if (cur) out.push(cur);
      }
      return out;
    }
    if (cleaned.length <= maxLen) return [cleaned];
    // Split on sentence boundaries while keeping punctuation and closing quotes/brackets attached
    const sentences = splitIntoSentences(cleaned);
    const chunks: string[] = [];
    let current = "";
    let sentCount = 0;
    for (const s of sentences) {
      const next = current ? `${current} ${s}` : s;
      if (
        (next.length > maxLen && current) ||
        sentCount + 1 > maxSentencesPerChunk
      ) {
        chunks.push(current);
        current = s;
        sentCount = 1;
      } else {
        current = next;
        sentCount += 1;
      }
    }
    if (current.trim().length > 0) chunks.push(current.trim());
    return chunks;
  }
  function splitIntoSentences(text: string): string[] {
    const cleaned = (text || "").trim();
    if (!cleaned) return [];
    // Primary split on sentence-ending punctuation
    const matchArr = cleaned.match(/[^.!?؟؛۔]+[.!?؟؛۔]["'”’)\]]*/g);
    let parts: string[];
    if (matchArr && matchArr.length > 0) {
      parts = Array.from(matchArr)
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      // Fallback: split on commas/Arabic comma/semicolon/em dash
      parts = cleaned
        .split(/[،,;؛—–]+/g)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    // Final fallback: enforce soft breaks every ~28 words to avoid super long runs
    const out: string[] = [];
    for (const p of parts) {
      const words = p.split(/\s+/);
      if (words.length <= 28) {
        out.push(p);
        continue;
      }
      for (let i = 0; i < words.length; i += 28) {
        out.push(words.slice(i, i + 28).join(" "));
      }
    }
    return out;
  }

  async function triggerRefine() {
    if (refiningRef.current) return;
    const next = pendingQueueRef.current.shift();
    if (!next) return;
    refiningRef.current = true;
    const { result: refined, verseReference } = await refineSegment(
      next.en,
      next.ar,
      !!next.fast
    );
    // Don't update state if we've stopped (prevents post-stop UI changes)
    if (stoppedRef.current) {
      refiningRef.current = false;
      return;
    }
    if (refined && refined.trim().length > 0) {
      const pieces = splitRefinedIntoParas(refined, 420, 2);
      // Reset live text ref since we're finalizing a paragraph
      lastLiveTextRef.current = "";

      // Add all pieces at once to preserve order (CSS animation handles visual smoothness)
      // Previous drip approach caused interleaving when multiple refinements completed
      setRefinedParagraphs((prev) => [...prev, ...pieces]);

      // Add verse references for each piece (only first piece gets the reference)
      setVerseReferences((prev) => [
        ...prev,
        verseReference, // First piece gets the reference
        ...Array(pieces.length - 1).fill(null), // Rest get null
      ]);

      // Also store in translationMapRef for current targetLang
      const langKey = targetLangRef.current;
      const existing = translationMapRef.current.get(langKey) || [];
      translationMapRef.current.set(langKey, [...existing, ...pieces]);
      // Save translation to history if mosqueId and translatorId are provided
      if (mosqueId && translatorId && next.ar.trim() && refined.trim()) {
        try {
          await saveTranslation(mosqueId, {
            sourceText: next.ar.trim(),
            translatedText: refined.trim(),
            sourceLang: detectedLang || "unknown",
            targetLang: targetLangRef.current,
            translatorId,
            sessionId: sessionIdRef.current,
          });
        } catch (err) {
          // Silently fail - don't interrupt translation flow
          console.error("Failed to save translation history:", err);
        }
      }
    }
    refiningRef.current = false;
    // Only continue processing if not stopped
    if (!stoppedRef.current && pendingQueueRef.current.length > 0) {
      // process the next sentence quickly to keep flow
      setTimeout(triggerRefine, 200);
    }
  }

  // Drip-append queue for extra pieces produced by a single refine call
  const displayQueueRef = useRef<string[]>([]);
  const displayDripActiveRef = useRef<boolean>(false);
  function dripNextPiece() {
    // Stop dripping if we've stopped listening
    if (stoppedRef.current) {
      displayDripActiveRef.current = false;
      displayQueueRef.current = [];
      return;
    }
    if (displayQueueRef.current.length === 0) {
      displayDripActiveRef.current = false;
      return;
    }
    const next = displayQueueRef.current.shift();
    if (next && next.trim().length > 0) {
      setRefinedParagraphs((prev) => [...prev, next]);
      // Also store in translationMapRef for current targetLang
      const langKey = targetLangRef.current;
      const existing = translationMapRef.current.get(langKey) || [];
      translationMapRef.current.set(langKey, [...existing, next]);
    }
    // Small delay so UI feels sequential without being slow
    setTimeout(dripNextPiece, 1500);
  }
  function enqueueDisplayPieces(pieces: string[]) {
    if (!pieces || pieces.length === 0) return;
    displayQueueRef.current.push(...pieces);
    if (!displayDripActiveRef.current) {
      displayDripActiveRef.current = true;
      setTimeout(dripNextPiece, 1500);
    }
  }
  function scheduleRefinement(chunk: string) {
    // Don't schedule if stopped
    if (stoppedRef.current) return;
    // Accumulate up to ~550 chars or flush on punctuation with min length, or 800ms idle
    const add = chunk.trim();
    if (add.length === 0) return;
    accumulatorRef.current = accumulatorRef.current
      ? `${accumulatorRef.current} ${add}`
      : add;
    // Enforce a hard limit of max 3 sentences per refine to reduce latency
    const sentencesNow = splitIntoSentences(accumulatorRef.current);
    if (sentencesNow.length >= 3) {
      const firstThree = sentencesNow.slice(0, 3).join(" ").trim();
      const remainder = sentencesNow.slice(3).join(" ").trim();
      const isFirst =
        refinedParagraphs.length === 0 &&
        pendingQueueRef.current.length === 0 &&
        !refiningRef.current;
      pendingQueueRef.current.push({
        en: firstThree,
        ar: arabicAccumulatorRef.current,
        fast: isFirst ? true : false,
      });
      accumulatorRef.current = remainder;
      arabicAccumulatorRef.current = "";
      if (accFlushTimerRef.current) {
        window.clearTimeout(accFlushTimerRef.current);
        accFlushTimerRef.current = null;
      }
      if (!refiningRef.current) triggerRefine();
      return;
    }
    // If current chunk ends a sentence/paragraph and we have a decent body, flush early
    // Allow trailing quotes/brackets after terminal punctuation.
    const endsSentence =
      /([.!?؟؛۔])(?:["'”’)\]]+)?$/.test(add) || /\n\n/.test(add);
    if (endsSentence && accumulatorRef.current.length >= 100) {
      const isFirst =
        refinedParagraphs.length === 0 &&
        pendingQueueRef.current.length === 0 &&
        !refiningRef.current;
      pendingQueueRef.current.push({
        en: accumulatorRef.current,
        ar: arabicAccumulatorRef.current,
        fast: isFirst ? true : false,
      });
      accumulatorRef.current = "";
      arabicAccumulatorRef.current = "";
      if (accFlushTimerRef.current) {
        window.clearTimeout(accFlushTimerRef.current);
        accFlushTimerRef.current = null;
      }
      if (!refiningRef.current) triggerRefine();
      return;
    }
    // Hard cap for chunk size
    if (accumulatorRef.current.length >= 550) {
      pendingQueueRef.current.push({
        en: accumulatorRef.current,
        ar: arabicAccumulatorRef.current,
      });
      accumulatorRef.current = "";
      arabicAccumulatorRef.current = "";
      if (accFlushTimerRef.current) {
        window.clearTimeout(accFlushTimerRef.current);
        accFlushTimerRef.current = null;
      }
      if (!refiningRef.current) triggerRefine();
      return;
    }
    // Soft timeout to flush small remainders
    if (accFlushTimerRef.current) {
      window.clearTimeout(accFlushTimerRef.current);
    }
    accFlushTimerRef.current = window.setTimeout(() => {
      if (accumulatorRef.current) {
        pendingQueueRef.current.push({
          en: accumulatorRef.current,
          ar: arabicAccumulatorRef.current,
        });
        accumulatorRef.current = "";
        arabicAccumulatorRef.current = "";
        if (!refiningRef.current) triggerRefine();
      }
      accFlushTimerRef.current = null;
    }, 800);
  }

  // Render only refined, finalized chunks for maximum stability
  const renderList = refinedParagraphs;
  // Track whether the user is at bottom of the reference box
  useEffect(() => {
    const el = refScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8; // 8px threshold
      refAtBottomRef.current = nearBottom;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    // initialize state
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);
  // Auto-scroll reference only if the user is already at bottom
  useEffect(() => {
    const el = refScrollRef.current;
    if (!el) return;
    if (refAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [srcStable, srcPartial]);

  async function handleStart() {
    setError(null);

    // If in mosque context, always attempt to claim reciter role when record is clicked
    if (mosqueId && translatorId && user) {
      const room = rooms.find((r) => r.id === mosqueId);
      if (room) {
        const isActiveReciter = room.activeTranslatorId === user.uid;

        // Only try to claim if we're not already the active reciter
        if (!isActiveReciter && onClaimReciter) {
          try {
            await onClaimReciter();
            // After claiming, proceed with starting translation
            // The room state will update via real-time subscription
          } catch (err: any) {
            // Claim failed (likely another user is the reciter)
            setError(
              err?.message ||
                "Failed to become lead reciter. Another user may already be the lead reciter."
            );
            return;
          }
        }
      }
    }

    setHasStopped(false);
    stoppedRef.current = false; // Reset stopped flag for new session
    sessionStartedRef.current = true; // Allow Firestore to load translations for this session
    // Generate new session ID for this translation session
    sessionIdRef.current = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    enFinalSeen.current = new Set();
    setDetectedLang(null);
    setEnParagraphs([]);

    // Clear ALL previous translations for fresh start
    setRefinedParagraphs([]);
    setVerseReferences([]); // Clear verse references too
    translationMapRef.current.clear();
    loadedTranslationIdsRef.current.clear();

    // Clear accumulators
    accumulatorRef.current = "";
    arabicAccumulatorRef.current = "";
    arabicSentenceBufferRef.current = "";
    arabicThreeRef.current = [];
    pendingQueueRef.current = [];
    displayQueueRef.current = [];

    setEnCurrent("");
    enCurrentRef.current = "";
    setEnPartial("");
    lastLiveTextRef.current = ""; // Reset live text for fresh start
    arFinalSeen.current = new Set();
    setSrcStable("");
    setSrcPartial("");
    setIsListening(true);

    // Start live stream broadcasting for <1 second latency
    startLiveStreamBroadcast();

    try {
      const { SonioxClient } = await import("@soniox/speech-to-text-web");
      clientRef.current = new SonioxClient({
        apiKey: SONIOX_API_KEY,
        onError: (_status: any, message: string) => {
          setError(message || "Unexpected error");
        },
        onFinished: () => {
          // Don't change listening state if we're switching languages
          if (!switchingLanguageRef.current) {
            setIsListening(false);
          }
          // Ensure the last snippet gets refined even without trailing punctuation
          flushPendingNow();
        },
      });

      await clientRef.current.start({
        model: "stt-rt-preview",
        languageHints: LANG_OPTIONS.map((l) => l.code),
        enableLanguageIdentification: true,
        translation: {
          type: "one_way",
          target_language: targetLang,
        },
        audioFormat: "auto",
        enableEndpointDetection: true,
        onPartialResult: (result: any) => {
          // Be tolerant to token shapes from Soniox:
          // treat anything not explicitly marked as "translation" as source/original.
          const arTokens = (result.tokens || []).filter(
            (t: any) =>
              (t.translation_status || "").toLowerCase() !== "translation"
          );
          const enTokens = (result.tokens || []).filter(
            (t: any) =>
              (t.translation_status || "").toLowerCase() === "translation"
          );

          const pickLanguage = (tokens: any[]) => {
            const counts = new Map<string, number>();
            for (const t of tokens) {
              const code = (t.language || t.source_language || "").trim();
              if (!code) continue;
              const weight = t.is_final ? 2 : 1;
              counts.set(code, (counts.get(code) || 0) + weight);
            }
            let best: string | null = null;
            let bestVal = 0;
            for (const [code, val] of counts) {
              if (val > bestVal) {
                best = code;
                bestVal = val;
              }
            }
            return best;
          };
          const lang = pickLanguage(arTokens);
          if (lang && lang !== detectedLang) {
            setDetectedLang(lang);
          }

          const appendFinal = (
            tokens: any[],
            seen: Set<string>,
            onText: (text: string) => void
          ) => {
            const finals = tokens.filter((t) => t.is_final);
            if (finals.length === 0) return;
            finals.sort((a, b) => (a.start_ms ?? 0) - (b.start_ms ?? 0));
            const newText = finals
              .filter((t, idx) => {
                const key = `${t.start_ms ?? idx}-${t.text}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              })
              .map((t) => t.text)
              .join("");
            if (newText) onText(newText);
          };

          // Append finalized English text to sentence/paragraph accumulator.
          const appendToParagraphs = (text: string) => {
            if (!text) return;
            let buffer = enCurrentRef.current + text;
            // Split into sentence-like chunks, keeping punctuation marks (. ! ? Arabic ؟ ؛ ۔).
            const parts = buffer.split(/([\.!\?؟؛۔])/);
            let leftover = "";
            const maxRunOnWords = 28; // safety for long, punctuation-less runs
            const sliceFirstWords = (
              t: string,
              n: number
            ): { head: string; tail: string } => {
              const words = t.trim().split(/\s+/);
              if (words.length <= n) return { head: t.trim(), tail: "" };
              const head = words.slice(0, n).join(" ");
              const tail = words.slice(n).join(" ");
              return { head, tail };
            };
            for (let i = 0; i < parts.length; i += 2) {
              const segment = (parts[i] || "").trim();
              const delim = parts[i + 1];
              if (!segment && !delim) continue;
              if (delim) {
                const sentence = concatReadable(segment + delim);
                if (sentence) {
                  // Log each finalized rough transcription sentence from Soniox
                  try {
                    // eslint-disable-next-line no-console
                    console.log("[transcribed]", sentence);
                  } catch {}
                  setEnParagraphs((prev) => [...prev, sentence]);
                  // Queue for refinement; do not show raw to prioritize accuracy
                  scheduleRefinement(sentence);
                }
              } else {
                leftover = concatReadable(segment);
              }
            }
            // If leftover grows too long without punctuation, force-chunk by words
            while (leftover && leftover.split(/\s+/).length > maxRunOnWords) {
              const { head, tail } = sliceFirstWords(leftover, maxRunOnWords);
              if (head) {
                try {
                  // eslint-disable-next-line no-console
                  console.log("[transcribed/run-on-slice]", head);
                } catch {}
                scheduleRefinement(head);
              }
              leftover = tail.trim();
            }
            enCurrentRef.current = leftover;
            setEnCurrent(() => leftover);
          };

          // If detected language equals target language, use source tokens for translation display
          // (Soniox won't produce translation tokens when source = target)
          const sameLanguage = lang === targetLangRef.current;
          
          if (sameLanguage) {
            // Use source tokens directly as translation since no translation needed
            appendFinal(arTokens, enFinalSeen.current, appendToParagraphs);
          } else {
            // Normal case: use translation tokens
            appendFinal(enTokens, enFinalSeen.current, appendToParagraphs);
          }
          
          // Accumulate reference source text (original stream)
          appendFinal(arTokens, arFinalSeen.current, (text) => {
            setSrcStable((prev) => concatReadable(prev, text));
            arabicAccumulatorRef.current = arabicAccumulatorRef.current
              ? concatReadable(arabicAccumulatorRef.current, text)
              : text;
            // Build Arabic sentences and log every 3 sentences
            let arBuf = concatReadable(arabicSentenceBufferRef.current, text);
            const parts = arBuf.split(/([\.!\?؟؛۔])/);
            let leftover = "";
            for (let i = 0; i < parts.length; i += 2) {
              const seg = (parts[i] || "").trim();
              const delim = parts[i + 1];
              if (!seg && !delim) continue;
              if (delim) {
                const full = concatReadable(seg + delim);
                if (full) {
                  arabicThreeRef.current.push(full);
                  if (arabicThreeRef.current.length === 3) {
                    try {
                      // eslint-disable-next-line no-console
                      console.log("[arabic x3]", arabicThreeRef.current);
                    } catch {}
                    arabicThreeRef.current = [];
                  }
                }
              } else {
                leftover = concatReadable(seg);
              }
            }
            arabicSentenceBufferRef.current = leftover;
          });

          const partialText = (tokens: any[]) =>
            tokens
              .filter((t) => !t.is_final)
              .map((t) => t.text)
              .join("")
              .replace(/\s+/g, " ")
              .trim();

          // For same language, also use source partials as translation partials
          if (sameLanguage) {
            setEnPartial(partialText(arTokens));
          } else {
            setEnPartial(partialText(enTokens));
          }
          setSrcPartial(partialText(arTokens));
          // Reset inactivity timer since we received audio tokens
          resetSilenceTimer();
        },
      });
      // Kick off the inactivity timer when we begin
      resetSilenceTimer();
    } catch (e: any) {
      setIsListening(false);
      setError(e?.message || "Failed to start listening");
    }
  }

  // Handle language change - restart Soniox with new target if currently listening
  async function handleLanguageChange(newLang: string) {
    if (newLang === targetLang) return;

    // Update ref synchronously FIRST (before async operations)
    targetLangRef.current = newLang;
    setTargetLang(newLang);

    // If not listening, just update the state
    if (!isListening) return;

    // If listening, we need to restart the Soniox client with the new target language
    // First, flush any pending text to preserve it
    flushPendingNow();

    // Set flag to prevent onFinished from changing isListening state
    switchingLanguageRef.current = true;

    // Stop current client gracefully (don't use handleStop as it sets hasStopped)
    try {
      clientRef.current?.stop();
    } catch {}

    // Immediately re-assert listening state to prevent any flash
    // (belt-and-suspenders in case onFinished fires synchronously)
    setIsListening(true);

    // Clear timers
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (accFlushTimerRef.current) {
      window.clearTimeout(accFlushTimerRef.current);
      accFlushTimerRef.current = null;
    }

    // Clear partial/current state but KEEP refined paragraphs
    enCurrentRef.current = "";
    setEnCurrent("");
    setEnPartial("");
    lastLiveTextRef.current = "";
    accumulatorRef.current = "";
    arabicAccumulatorRef.current = "";
    enFinalSeen.current = new Set();

    // Restart with new language
    try {
      const { SonioxClient } = await import("@soniox/speech-to-text-web");
      clientRef.current = new SonioxClient({
        apiKey: SONIOX_API_KEY,
        onError: (_status: any, message: string) => {
          setError(message || "Unexpected error");
        },
        onFinished: () => {
          // Don't change listening state if we're switching languages
          if (!switchingLanguageRef.current) {
            setIsListening(false);
          }
          flushPendingNow();
        },
      });

      await clientRef.current.start({
        model: "stt-rt-preview",
        languageHints: LANG_OPTIONS.map((l) => l.code),
        enableLanguageIdentification: true,
        translation: {
          type: "one_way",
          target_language: newLang,
        },
        audioFormat: "auto",
        enableEndpointDetection: true,
        onPartialResult: (result: any) => {
          // Same handler as in handleStart
          const arTokens = (result.tokens || []).filter(
            (t: any) =>
              (t.translation_status || "").toLowerCase() !== "translation"
          );
          const enTokens = (result.tokens || []).filter(
            (t: any) =>
              (t.translation_status || "").toLowerCase() === "translation"
          );

          const pickLanguage = (tokens: any[]) => {
            const counts = new Map<string, number>();
            for (const t of tokens) {
              const code = (t.language || t.source_language || "").trim();
              if (!code) continue;
              const weight = t.is_final ? 2 : 1;
              counts.set(code, (counts.get(code) || 0) + weight);
            }
            let best: string | null = null;
            let bestVal = 0;
            for (const [code, val] of counts) {
              if (val > bestVal) {
                best = code;
                bestVal = val;
              }
            }
            return best;
          };
          const lang = pickLanguage(arTokens);
          if (lang && lang !== detectedLang) {
            setDetectedLang(lang);
          }

          const appendFinal = (
            tokens: any[],
            seen: Set<string>,
            onText: (text: string) => void
          ) => {
            const finals = tokens.filter((t) => t.is_final);
            if (finals.length === 0) return;
            finals.sort((a, b) => (a.start_ms ?? 0) - (b.start_ms ?? 0));
            const newText = finals
              .filter((t, idx) => {
                const key = `${t.start_ms ?? idx}-${t.text}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              })
              .map((t) => t.text)
              .join("");
            if (newText) onText(newText);
          };

          const appendToParagraphs = (text: string) => {
            if (!text) return;
            let buffer = enCurrentRef.current + text;
            const parts = buffer.split(/([\.!\?؟؛۔])/);
            let leftover = "";
            const maxRunOnWords = 28;
            const sliceFirstWords = (
              t: string,
              n: number
            ): { head: string; tail: string } => {
              const words = t.trim().split(/\s+/);
              if (words.length <= n) return { head: t.trim(), tail: "" };
              const head = words.slice(0, n).join(" ");
              const tail = words.slice(n).join(" ");
              return { head, tail };
            };
            for (let i = 0; i < parts.length; i += 2) {
              const segment = (parts[i] || "").trim();
              const delim = parts[i + 1];
              if (!segment && !delim) continue;
              if (delim) {
                const sentence = concatReadable(segment + delim);
                if (sentence) {
                  try {
                    console.log("[transcribed]", sentence);
                  } catch {}
                  setEnParagraphs((prev) => [...prev, sentence]);
                  scheduleRefinement(sentence);
                }
              } else {
                leftover = concatReadable(segment);
              }
            }
            while (leftover && leftover.split(/\s+/).length > maxRunOnWords) {
              const { head, tail } = sliceFirstWords(leftover, maxRunOnWords);
              if (head) {
                try {
                  console.log("[transcribed/run-on-slice]", head);
                } catch {}
                scheduleRefinement(head);
              }
              leftover = tail.trim();
            }
            enCurrentRef.current = leftover;
            setEnCurrent(() => leftover);
          };

          // If detected language equals target language, use source tokens for translation display
          const sameLanguage = lang === targetLangRef.current;
          
          if (sameLanguage) {
            appendFinal(arTokens, enFinalSeen.current, appendToParagraphs);
          } else {
            appendFinal(enTokens, enFinalSeen.current, appendToParagraphs);
          }
          
          appendFinal(arTokens, arFinalSeen.current, (text) => {
            setSrcStable((prev) => concatReadable(prev, text));
            arabicAccumulatorRef.current = arabicAccumulatorRef.current
              ? concatReadable(arabicAccumulatorRef.current, text)
              : text;
            let arBuf = concatReadable(arabicSentenceBufferRef.current, text);
            const parts = arBuf.split(/([\.!\?؟؛۔])/);
            let leftover = "";
            for (let i = 0; i < parts.length; i += 2) {
              const seg = (parts[i] || "").trim();
              const delim = parts[i + 1];
              if (!seg && !delim) continue;
              if (delim) {
                const full = concatReadable(seg + delim);
                if (full) {
                  arabicThreeRef.current.push(full);
                  if (arabicThreeRef.current.length === 3) {
                    try {
                      console.log("[arabic x3]", arabicThreeRef.current);
                    } catch {}
                    arabicThreeRef.current = [];
                  }
                }
              } else {
                leftover = concatReadable(seg);
              }
            }
            arabicSentenceBufferRef.current = leftover;
          });

          const partialText = (tokens: any[]) =>
            tokens
              .filter((t) => !t.is_final)
              .map((t) => t.text)
              .join("")
              .replace(/\s+/g, " ")
              .trim();

          // For same language, also use source partials as translation partials
          if (sameLanguage) {
            setEnPartial(partialText(arTokens));
          } else {
            setEnPartial(partialText(enTokens));
          }
          setSrcPartial(partialText(arTokens));
          resetSilenceTimer();
        },
      });
      resetSilenceTimer();
      // Explicitly ensure listening state is true after language switch
      setIsListening(true);
      // Clear the language switching flag after successful restart
      // Use a longer delay to ensure old client's onFinished has definitely fired
      setTimeout(() => {
        switchingLanguageRef.current = false;
      }, 500);
    } catch (e: any) {
      switchingLanguageRef.current = false;
      setIsListening(false);
      setError(e?.message || "Failed to restart with new language");
    }
  }

  function handleStop() {
    // Set stopped flag FIRST to prevent any further state updates
    stoppedRef.current = true;

    try {
      clientRef.current?.stop();
    } catch {
    } finally {
      setIsListening(false);
      setHasStopped(true);

      // Clear all pending queues to prevent post-stop processing
      pendingQueueRef.current = [];
      displayQueueRef.current = [];
      displayDripActiveRef.current = false;

      // Clear timers
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (accFlushTimerRef.current) {
        window.clearTimeout(accFlushTimerRef.current);
        accFlushTimerRef.current = null;
      }

      // Stop live stream broadcasting
      stopLiveStreamBroadcast();

      // Release the translator lock when stopping
      if (onReleaseReciter && mosqueId && user) {
        onReleaseReciter().catch((err) => {
          console.error("Error releasing translator lock:", err);
        });
      }
    }
  }

  // Copy translation to clipboard
  const handleCopyTranslation = useCallback(async () => {
    const fullText = refinedParagraphs.join("\n\n");
    if (!fullText.trim()) {
      setToast({ message: t("share.nothingToCopy"), type: "error" });
      return;
    }
    try {
      await navigator.clipboard.writeText(fullText);
      setToast({ message: t("share.copied"), type: "success" });
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = fullText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setToast({ message: t("share.copied"), type: "success" });
    }
  }, [refinedParagraphs, t]);

  // Get translation content for email
  const getEmailContent = useCallback(() => {
    const sourceText = srcStable.trim();
    const translatedText = refinedParagraphs.join("\n\n");
    const langLabel =
      LANG_OPTIONS.find((l) => l.code === targetLang)?.label || targetLang;
    const sourceLangLabel = detectedLang
      ? LANG_OPTIONS.find((l) => l.code === detectedLang)?.label || detectedLang
      : "Unknown";

    return {
      subject: `Quran Translation - ${new Date().toLocaleDateString()}`,
      body: `
══════════════════════════════════════
       QURAN TRANSLATION RECORD
══════════════════════════════════════

📅 Date: ${new Date().toLocaleString()}
🌐 Source Language: ${sourceLangLabel}
🔄 Translation Language: ${langLabel}

──────────────────────────────────────
           ORIGINAL TEXT
──────────────────────────────────────

${sourceText || "(No source text recorded)"}

──────────────────────────────────────
          TRANSLATION
──────────────────────────────────────

${translatedText || "(No translation recorded)"}

══════════════════════════════════════
      Powered by Aqala - aqala.io
══════════════════════════════════════
`.trim(),
    };
  }, [srcStable, refinedParagraphs, targetLang, detectedLang, LANG_OPTIONS]);

  // Generate AI summary of the translation
  const handleSummarize = useCallback(async () => {
    const translatedText = refinedParagraphs.join("\n\n");
    if (!translatedText.trim()) {
      setToast({ message: t("share.nothingToCopy"), type: "error" });
      return;
    }

    setIsSummarizing(true);
    setShowSummaryModal(true);
    setSummaryText("");
    setSummaryConversation([]);
    setCurrentQuestion("");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: translatedText,
          sourceText: srcStable,
          targetLang,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to generate summary");
      }

      const data = await res.json();
      setSummaryText(data.summary || "No summary generated.");
    } catch (err: any) {
      setToast({
        message: err?.message || "Failed to generate summary",
        type: "error",
      });
      setShowSummaryModal(false);
    } finally {
      setIsSummarizing(false);
    }
  }, [refinedParagraphs, srcStable, targetLang, t]);

  // Handle asking follow-up questions about the summary
  const handleAskQuestion = useCallback(async () => {
    if (!currentQuestion.trim() || !summaryText || isAskingQuestion) return;

    const question = currentQuestion.trim();
    setCurrentQuestion("");
    setIsAskingQuestion(true);

    // Add user question to conversation immediately
    setSummaryConversation((prev) => [...prev, { role: "user", content: question }]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          summary: summaryText,
          originalText: refinedParagraphs.join("\n\n"),
          conversationHistory: summaryConversation,
          targetLang,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to get answer");
      }

      const data = await res.json();
      setSummaryConversation((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || "I couldn't generate an answer." },
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get answer";
      setToast({ message, type: "error" });
      // Remove the user question on error
      setSummaryConversation((prev) => prev.slice(0, -1));
    } finally {
      setIsAskingQuestion(false);
    }
  }, [currentQuestion, summaryText, refinedParagraphs, summaryConversation, targetLang, isAskingQuestion]);

  // Auto-scroll to show new Q&A messages
  useEffect(() => {
    if (summaryConversation.length > 0 && qaEndRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        qaEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [summaryConversation]);

  // Track whether the reader is near the bottom of the translation container; if scrolled up, disable auto-scroll.
  useEffect(() => {
    const container = translationScrollRef.current;
    if (!container) return;
    const onScroll = () => {
      const nearBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 100; // 100px threshold for "near bottom"
      setUserAtBottom(nearBottom);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    // Initialize as at bottom
    setUserAtBottom(true);
    return () => {
      container.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Auto-scroll translation container as new content streams in, so reading stays continuous.
  useEffect(() => {
    const container = translationScrollRef.current;
    if (!container) return;

    // Always scroll to bottom when content changes (unless user scrolled up)
    const shouldScroll = userAtBottom || refinedParagraphs.length <= 3;

    if (shouldScroll) {
      // Use multiple frames to ensure DOM has fully updated
      const scrollToBottom = () => {
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      };

      // Immediate scroll
      scrollToBottom();

      // And again after a short delay to catch any late renders
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(scrollToBottom);
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [refinedParagraphs.length, enCurrent, enPartial, userAtBottom]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Google Fonts */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap");
      `}</style>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {error && (
          <div className="mx-4 mt-3 rounded-xl border border-red-400/30 bg-red-950/50 p-4 text-sm text-red-200">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Language selector bar */}
        <div className="flex-shrink-0 px-5 py-3 border-b border-white/5 bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-medium text-white/40 uppercase tracking-[0.15em]">Translate to</span>
              <div className="relative">
                <select
                  value={targetLang}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="appearance-none bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#E8D5A3] rounded-full px-4 py-1.5 pr-8 text-sm font-semibold cursor-pointer hover:bg-[#D4AF37]/25 hover:border-[#D4AF37]/60 transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {LANG_OPTIONS.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-[#032117] text-white">
                      {lang.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#D4AF37]">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
            {isListening && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/10">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D4AF37]"></span>
                </span>
                <span className="text-[9px] text-[#D4AF37] font-semibold uppercase tracking-wider">
                  {t("listen.live")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Source text section */}
        <div className="flex-shrink-0 border-b border-white/5">
          <div className="relative px-5 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 rounded-full bg-[#D4AF37]/60" />
                <span className="text-[10px] font-medium text-white/40 uppercase tracking-[0.15em]">
                  {detectedLang ? labelFor(detectedLang) : t("listen.reference")}
                </span>
              </div>
            </div>
            <div
              ref={refScrollRef}
              className="max-h-[80px] overflow-y-auto source-scroll-area"
              dir="auto"
            >
              {concatReadable(srcStable, srcPartial) ? (
                <p
                  className="text-right text-[18px] leading-[1.8] text-white/90 source-text"
                  style={{ fontFamily: "'Amiri', serif" }}
                >
                  {srcStable.replace(/<end>/gi, "")}
                  {srcPartial && (
                    <span className="text-white/40">
                      {" "}
                      {srcPartial.replace(/<end>/gi, "")}
                    </span>
                  )}
                </p>
              ) : (
                <div className="flex items-center justify-center py-2">
                  <p className="text-white/35 text-xs italic">
                    {isListening ? t("listen.listening") : t("listen.waitingAudio")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Translation output */}
        <div
          ref={translationScrollRef}
          className="flex-1 min-h-0 overflow-y-auto px-5 py-4"
        >
          {/* Content wrapper */}
          <div className={`max-w-2xl mx-auto w-full ${renderList.length === 0 ? 'flex-1 flex flex-col justify-center' : 'py-4'}`}>
            {/* Finalized paragraphs */}
            {renderList.length > 0 ? (
              renderList.map((p, i) => (
                <div
                  key={`en-p-${i}`}
                  className="translation-paragraph group"
                >
                  <p
                    className="text-[20px] leading-[2.1] text-white/90 translation-text"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {p}
                  </p>
                  {verseReferences[i] && (
                    <button
                      onClick={() => {
                        const match = verseReferences[i]?.match(/(\d+:\d+(?:-\d+)?)/);
                        if (match) {
                          setSelectedVerseKey(match[1]);
                        }
                      }}
                      className="verse-reference-btn group/btn mt-3 inline-flex items-center gap-2 text-[13px] text-[#D4AF37]/70 italic transition-all cursor-pointer rounded-lg px-3 py-1.5 -ml-3 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-50 group-hover/btn:opacity-100 transition-opacity"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                      <span className="underline decoration-[#D4AF37]/20 underline-offset-4 group-hover/btn:decoration-[#D4AF37]/50">
                        {verseReferences[i]}
                      </span>
                    </button>
                  )}
                </div>
              ))
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <p className="text-white/50 text-base" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {labelFor(targetLang)} {t("listen.translationWillAppear")}
                </p>
                <p className="text-white/30 text-sm">
                  Tap the microphone to begin
                </p>
              </div>
            )}
          </div>
          <div ref={endRef} aria-hidden="true" />
        </div>

        {/* Live preview */}
        {isListening && (
          <div className="flex-shrink-0 border-t border-white/5 px-5 py-4">
            {(() => {
              const currentLiveText = concatReadable(enCurrent, enPartial);
              if (currentLiveText) {
                lastLiveTextRef.current = currentLiveText;
              }
              const displayText = currentLiveText || lastLiveTextRef.current;

              if (!displayText) {
                return (
                  <div className="flex items-center justify-center py-2 gap-3">
                    <span className="typing-dots">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </span>
                    <span className="text-xs text-white/30">Listening...</span>
                  </div>
                );
              }

              const words = displayText.split(/\s+/);

              return (
                <p
                  className="text-lg leading-relaxed text-white/70"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {words.map((word, i) => (
                    <span
                      key={`${i}-${word}`}
                      className="live-word"
                      style={{
                        animationDelay: `${Math.min(i * 0.04, 0.4)}s`,
                      }}
                    >
                      {word}{" "}
                    </span>
                  ))}
                  <span className="inline-block w-0.5 h-4 bg-[#D4AF37] animate-pulse align-middle ml-1" />
                </p>
              );
            })()}
          </div>
        )}
      </main>

      <CharityModal
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        currency="$"
        baseAmount={0}
        presetAmounts={[7, 20, 50]}
      />

      <VerseModal
        verseKey={selectedVerseKey}
        onClose={() => setSelectedVerseKey(null)}
        targetLang={targetLang}
      />

      <EmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        content={getEmailContent()}
        onSuccess={() => {
          setToast({ message: t("share.emailSent"), type: "success" });
        }}
        onError={(msg) => {
          setToast({ message: msg, type: "error" });
        }}
      />

      {/* Summary Modal - refined glassmorphic design */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md summary-backdrop-in"
            onClick={() => !isSummarizing && setShowSummaryModal(false)}
          />
          <div className="relative w-full max-w-lg max-h-[75vh] summary-modal-content flex flex-col">
            {/* Glowing border effect */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#D4AF37]/30 via-[#D4AF37]/10 to-[#D4AF37]/30 opacity-50" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 flex flex-col max-h-[75vh]" style={{ background: "linear-gradient(180deg, #0a2e1f 0%, #032117 50%, #021912 100%)" }}>
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                <h2 className="text-base font-medium text-white flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-[#D4AF37]"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  Session Summary
                </h2>
                <button
                  onClick={() => setShowSummaryModal(false)}
                  disabled={isSummarizing}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors disabled:opacity-50"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {/* Content - single continuous scrollable area */}
              <div ref={summaryScrollRef} className="flex-1 overflow-y-auto min-h-0 px-5 py-4 summary-scroll-area">
                {isSummarizing ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-5">
                    <div className="relative w-14 h-14">
                      <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/10" />
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#D4AF37] animate-spin" />
                      <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#D4AF37]/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                    </div>
                    <p className="text-white/40 text-sm" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      Generating summary...
                    </p>
                  </div>
                ) : (
                  <div style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {summaryText.split("\n").map((line, i) => {
                      // Parse verse references in format [Surah Name chapter:verse] or [Surah Name chapter:start-end]
                      const parseVerseRefs = (text: string): React.ReactNode[] => {
                        const verseRefPattern = /\[([^\]]+)\s+(\d+):(\d+)(?:-(\d+))?\]/g;
                        const parts: React.ReactNode[] = [];
                        let lastIndex = 0;
                        let match;

                        while ((match = verseRefPattern.exec(text)) !== null) {
                          // Add text before the match
                          if (match.index > lastIndex) {
                            parts.push(text.slice(lastIndex, match.index));
                          }
                          
                          const surahName = match[1];
                          const chapter = match[2];
                          const startVerse = match[3];
                          const endVerse = match[4];
                          const verseKey = endVerse ? `${chapter}:${startVerse}-${endVerse}` : `${chapter}:${startVerse}`;
                          const displayText = endVerse 
                            ? `${surahName} ${chapter}:${startVerse}-${endVerse}`
                            : `${surahName} ${chapter}:${startVerse}`;

                          parts.push(
                            <button
                              key={`verse-${match.index}`}
                              onClick={() => setSelectedVerseKey(verseKey)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 mx-0.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#E8D5A3] text-sm font-medium transition-all border border-[#D4AF37]/30 hover:border-[#D4AF37]/50 group"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70 group-hover:opacity-100">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                              </svg>
                              {displayText}
                            </button>
                          );
                          
                          lastIndex = match.index + match[0].length;
                        }

                        // Add remaining text
                        if (lastIndex < text.length) {
                          parts.push(text.slice(lastIndex));
                        }

                        return parts.length > 0 ? parts : [text];
                      };

                      const formatBold = (text: string) =>
                        text.replace(
                          /\*\*(.+?)\*\*/g,
                          '<strong class="text-[#D4AF37] font-semibold">$1</strong>'
                        );

                      // Check if line has verse references
                      const hasVerseRefs = /\[[^\]]+\s+\d+:\d+/.test(line);

                      if (!line.trim()) {
                        return <div key={i} className="h-4" />;
                      }

                      if (line.startsWith("### ")) {
                        const content = line.replace("### ", "");
                        return (
                          <h3
                            key={i}
                            className="text-[#E8D5A3] text-base font-medium mt-5 mb-2"
                            dangerouslySetInnerHTML={{ __html: formatBold(content) }}
                          />
                        );
                      }
                      if (line.startsWith("## ")) {
                        const content = line.replace("## ", "");
                        return (
                          <h2
                            key={i}
                            className="text-[#E8D5A3] text-lg font-medium mt-6 mb-3"
                            dangerouslySetInnerHTML={{ __html: formatBold(content) }}
                          />
                        );
                      }
                      if (line.startsWith("# ")) {
                        const content = line.replace("# ", "");
                        return (
                          <h1
                            key={i}
                            className="text-[#E8D5A3] text-xl font-semibold mt-6 mb-3"
                            dangerouslySetInnerHTML={{ __html: formatBold(content) }}
                          />
                        );
                      }
                      if (line.startsWith("- ") || line.startsWith("* ")) {
                        const content = line.slice(2);
                        if (hasVerseRefs) {
                          return (
                            <p
                              key={i}
                              className="text-white/80 leading-relaxed pl-5 my-1.5 relative before:content-['•'] before:absolute before:left-0 before:text-[#D4AF37]/60"
                            >
                              {parseVerseRefs(content).map((part, j) => 
                                typeof part === 'string' ? (
                                  <span key={j} dangerouslySetInnerHTML={{ __html: formatBold(part) }} />
                                ) : part
                              )}
                            </p>
                          );
                        }
                        return (
                          <p
                            key={i}
                            className="text-white/80 leading-relaxed pl-5 my-1.5 relative before:content-['•'] before:absolute before:left-0 before:text-[#D4AF37]/60"
                            dangerouslySetInnerHTML={{ __html: formatBold(content) }}
                          />
                        );
                      }
                      const numberedMatch = line.match(/^(\d+)\.\s/);
                      if (numberedMatch) {
                        if (hasVerseRefs) {
                          return (
                            <p key={i} className="text-white/80 leading-relaxed pl-5 my-1.5">
                              {parseVerseRefs(line).map((part, j) => 
                                typeof part === 'string' ? (
                                  <span key={j} dangerouslySetInnerHTML={{ __html: formatBold(part) }} />
                                ) : part
                              )}
                            </p>
                          );
                        }
                        return (
                          <p
                            key={i}
                            className="text-white/80 leading-relaxed pl-5 my-1.5"
                            dangerouslySetInnerHTML={{ __html: formatBold(line) }}
                          />
                        );
                      }
                      if (hasVerseRefs) {
                        return (
                          <p key={i} className="text-white/80 text-[17px] leading-[1.9] my-2.5">
                            {parseVerseRefs(line).map((part, j) => 
                              typeof part === 'string' ? (
                                <span key={j} dangerouslySetInnerHTML={{ __html: formatBold(part) }} />
                              ) : part
                            )}
                          </p>
                        );
                      }
                      return (
                        <p
                          key={i}
                          className="text-white/80 text-[17px] leading-[1.9] my-2.5"
                          dangerouslySetInnerHTML={{ __html: formatBold(line) }}
                        />
                      );
                    })}
                  </div>
                )}
                
                {/* Q&A Conversation - inside the same scroll area */}
                {!isSummarizing && summaryText && summaryConversation.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-white/[0.08] space-y-3">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Questions & Answers</p>
                    {summaryConversation.map((msg, i) => {
                      // Parse verse references in Q&A responses too
                      const parseQAVerseRefs = (text: string): React.ReactNode[] => {
                        const verseRefPattern = /\[([^\]]+)\s+(\d+):(\d+)(?:-(\d+))?\]/g;
                        const parts: React.ReactNode[] = [];
                        let lastIndex = 0;
                        let match;

                        while ((match = verseRefPattern.exec(text)) !== null) {
                          if (match.index > lastIndex) {
                            parts.push(text.slice(lastIndex, match.index));
                          }
                          
                          const surahName = match[1];
                          const chapter = match[2];
                          const startVerse = match[3];
                          const endVerse = match[4];
                          const verseKey = endVerse ? `${chapter}:${startVerse}-${endVerse}` : `${chapter}:${startVerse}`;
                          const displayText = endVerse 
                            ? `${surahName} ${chapter}:${startVerse}-${endVerse}`
                            : `${surahName} ${chapter}:${startVerse}`;

                          parts.push(
                            <button
                              key={`qa-verse-${i}-${match.index}`}
                              onClick={() => setSelectedVerseKey(verseKey)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#E8D5A3] text-xs font-medium transition-all border border-[#D4AF37]/30"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                              </svg>
                              {displayText}
                            </button>
                          );
                          
                          lastIndex = match.index + match[0].length;
                        }

                        if (lastIndex < text.length) {
                          parts.push(text.slice(lastIndex));
                        }

                        return parts.length > 0 ? parts : [text];
                      };

                      return (
                        <div
                          key={i}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[90%] rounded-xl px-3 py-2 ${
                              msg.role === "user"
                                ? "bg-[#D4AF37]/20 text-white/90"
                                : "bg-white/5 text-white/80"
                            }`}
                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                          >
                            {msg.role === "assistant" ? (
                              <div className="text-sm leading-relaxed">
                                {msg.content.split("\n").map((line, j) => {
                                  const formatBold = (text: string) =>
                                    text.replace(
                                      /\*\*(.+?)\*\*/g,
                                      '<strong class="text-[#D4AF37] font-semibold">$1</strong>'
                                    );
                                  const hasVerseRefs = /\[[^\]]+\s+\d+:\d+/.test(line);
                                  
                                  if (!line.trim()) return <div key={j} className="h-2" />;
                                  if (line.startsWith("- ") || line.startsWith("* ")) {
                                    const content = line.slice(2);
                                    if (hasVerseRefs) {
                                      return (
                                        <p
                                          key={j}
                                          className="pl-3 my-0.5 relative before:content-['•'] before:absolute before:left-0 before:text-[#D4AF37]/60"
                                        >
                                          {parseQAVerseRefs(content).map((part, k) => 
                                            typeof part === 'string' ? (
                                              <span key={k} dangerouslySetInnerHTML={{ __html: formatBold(part) }} />
                                            ) : part
                                          )}
                                        </p>
                                      );
                                    }
                                    return (
                                      <p
                                        key={j}
                                        className="pl-3 my-0.5 relative before:content-['•'] before:absolute before:left-0 before:text-[#D4AF37]/60"
                                        dangerouslySetInnerHTML={{ __html: formatBold(content) }}
                                      />
                                    );
                                  }
                                  if (hasVerseRefs) {
                                    return (
                                      <p key={j} className="my-0.5">
                                        {parseQAVerseRefs(line).map((part, k) => 
                                          typeof part === 'string' ? (
                                            <span key={k} dangerouslySetInnerHTML={{ __html: formatBold(part) }} />
                                          ) : part
                                        )}
                                      </p>
                                    );
                                  }
                                  return (
                                    <p
                                      key={j}
                                      className="my-0.5"
                                      dangerouslySetInnerHTML={{ __html: formatBold(line) }}
                                    />
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm">{msg.content}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {isAskingQuestion && (
                      <div className="flex justify-start">
                        <div className="bg-white/5 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-1.5 text-white/40 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" style={{ animationDelay: "0.2s" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" style={{ animationDelay: "0.4s" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Scroll anchor */}
                    <div ref={qaEndRef} />
                  </div>
                )}
              </div>
              {/* Footer with input and actions */}
              {!isSummarizing && summaryText && (
                <div className="flex-shrink-0 px-5 py-3 border-t border-white/[0.06] bg-[#021912] space-y-3">
                  {/* Question input */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={currentQuestion}
                      onChange={(e) => setCurrentQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAskQuestion();
                        }
                      }}
                      placeholder="Ask about this session..."
                      disabled={isAskingQuestion}
                      className="flex-1 bg-white/5 border border-white/[0.08] rounded-lg px-3 py-2 text-white/90 text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/50 disabled:opacity-50 transition-all"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    />
                    <button
                      onClick={handleAskQuestion}
                      disabled={isAskingQuestion || !currentQuestion.trim()}
                      className="w-9 h-9 rounded-lg bg-[#D4AF37] flex-shrink-0 flex items-center justify-center hover:bg-[#E8D5A3] disabled:opacity-40 disabled:hover:bg-[#D4AF37] transition-all"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-[#032117]"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                  {/* Action buttons */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(summaryText);
                          setToast({ message: t("share.copied"), type: "success" });
                        } catch {
                          setToast({ message: "Failed to copy", type: "error" });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/70 text-xs font-medium hover:bg-white/10 transition-all"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </button>
                    <button
                      onClick={() => setShowSummaryModal(false)}
                      className="px-4 py-1.5 rounded-lg bg-[#D4AF37] text-[#032117] text-xs font-semibold hover:bg-[#E8D5A3] transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Footer */}
      <footer className="flex-shrink-0 px-5 py-6 border-t border-white/5">
        {/* Session ended actions */}
        {hasStopped && !isListening && refinedParagraphs.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Primary actions row */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#D4AF37] text-[#032117] rounded-full hover:bg-[#E8C547] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D4AF37]/20"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                {isSummarizing ? "Summarizing..." : "Summarize"}
              </button>
              <button
                onClick={handleCopyTranslation}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white/10 text-white rounded-full hover:bg-white/15 active:scale-[0.98] transition-all border border-white/10"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {t("share.copy")}
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white/10 text-white rounded-full hover:bg-white/15 active:scale-[0.98] transition-all border border-white/10"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                {t("share.email")}
              </button>
            </div>
            
            {/* Secondary actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-full border border-white/10 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                {t("listen.returnHome")}
              </button>
              <button
                onClick={() => setIsSheetOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/15 rounded-full border border-[#D4AF37]/30 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Support Aqala
              </button>
            </div>
          </div>
        )}

        {/* Controls row - Audio share + Mic button */}
        <div className="flex items-center justify-center gap-4">
          {/* Audio share toggle - only show when connected to LiveKit */}
          {liveKitConnected && (
            <button
              onClick={toggleLiveKitAudio}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all ${
                liveKitAudioEnabled
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
              }`}
            >
              {liveKitAudioEnabled ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              )}
              <span className="text-sm font-medium">
                {liveKitAudioEnabled ? "Audio On" : "Share Audio"}
              </span>
            </button>
          )}

          {/* Mic button */}
          <button
            onClick={isListening ? handleStop : handleStart}
            aria-label={isListening ? "Stop" : "Start listening"}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isListening 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30" 
                : "text-white shadow-lg shadow-black/20"
            }`}
            style={!isListening ? { backgroundColor: accentColor.base } : undefined}
            onMouseEnter={(e) => !isListening && (e.currentTarget.style.backgroundColor = accentColor.hover)}
            onMouseLeave={(e) => !isListening && (e.currentTarget.style.backgroundColor = accentColor.base)}
          >
            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-10" style={{ animationDelay: '0.5s' }} />
              </>
            )}
            <span className="relative z-10">
              {isListening ? (
                <div className="h-5 w-5 rounded-sm bg-white" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" />
                  <path d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z" />
                </svg>
              )}
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}
