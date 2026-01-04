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
  updateLiveStream,
  clearLiveStream,
} from "@/lib/firebase/translationHistory";
import { useRooms } from "@/contexts/RoomsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

// NOTE: For MVP simplicity per user request, the API key is inlined.
// In production, move this to a server-side temporary key generator.
const SONIOX_API_KEY =
  "2711b6efddec284139c51a123c3281d52525a5b6382cc622a0a4b58f2b1a9120";

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
  const [enParagraphs, setEnParagraphs] = useState<string[]>([]);
  const [refinedParagraphs, setRefinedParagraphs] = useState<string[]>([]);
  // Verse references corresponding to each refined paragraph (e.g., "Al-Fatiha 1:2")
  const [verseReferences, setVerseReferences] = useState<(string | null)[]>([]);
  // Currently selected verse key for the modal (e.g., "18:38" or "18:38-42")
  const [selectedVerseKey, setSelectedVerseKey] = useState<string | null>(null);
  const [enPartial, setEnPartial] = useState("");
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
  const [srcPartial, setSrcPartial] = useState("");
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

  // Start live stream broadcasting for real-time translation (<1 second latency)
  function startLiveStreamBroadcast() {
    if (!mosqueId || !translatorId) return;

    // Clear any existing interval
    if (liveStreamIntervalRef.current) {
      window.clearInterval(liveStreamIntervalRef.current);
    }

    // Reset accumulated text
    liveAccumulatedRef.current = "";

    // Broadcast every 300ms for near real-time updates
    liveStreamIntervalRef.current = window.setInterval(() => {
      // Combine all finalized refined paragraphs + current accumulator + partial
      const refinedText = refinedParagraphs.join("\n\n");
      const currentRaw = concatReadable(enCurrentRef.current, enPartial);
      const fullText = concatReadable(refinedText, currentRaw);

      updateLiveStream(mosqueId!, {
        currentText: fullText,
        partialText: enPartial,
        sourceText: srcStable,
        sourcePartial: srcPartial,
        sourceLang: detectedLang || "unknown",
        targetLang: targetLangRef.current,
        translatorId: translatorId!,
        sessionId: sessionIdRef.current,
        isActive: true,
      }).catch((err) => {
        // Silently fail - don't interrupt translation flow
        console.error("Failed to update live stream:", err);
      });
    }, 300);
  }

  // Stop live stream broadcasting
  function stopLiveStreamBroadcast() {
    if (liveStreamIntervalRef.current) {
      window.clearInterval(liveStreamIntervalRef.current);
      liveStreamIntervalRef.current = null;
    }

    // Clear the live stream
    if (mosqueId) {
      clearLiveStream(mosqueId).catch((err) => {
        console.error("Failed to clear live stream:", err);
      });
    }
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
      if (mosqueId) {
        clearLiveStream(mosqueId).catch(() => {});
      }
    };
  }, [mosqueId]);

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

          appendFinal(enTokens, enFinalSeen.current, appendToParagraphs);
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

          setEnPartial(partialText(enTokens));
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

          appendFinal(enTokens, enFinalSeen.current, appendToParagraphs);
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

          setEnPartial(partialText(enTokens));
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
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      {/* Google Fonts for Arabic (Amiri) and Translation (Crimson Pro) */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Crimson+Pro:wght@400;500&display=swap");
      `}</style>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {error && (
          <div className="mx-4 mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Reference/Source text section (Arabic) */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {detectedLang ? labelFor(detectedLang) : t("listen.reference")}
            </span>
            {isListening && (
              <span className="flex items-center gap-2 text-xs text-[#2E7D32] font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D32] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E7D32]"></span>
                </span>
                {t("listen.live")}
              </span>
            )}
          </div>
          <div
            ref={refScrollRef}
            className="max-h-[120px] overflow-y-auto pr-2"
            dir="auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#d1d5db transparent",
            }}
          >
            {concatReadable(srcStable, srcPartial) ? (
              <p
                className="text-right text-xl leading-[2] text-[#1B5E20]"
                style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
              >
                {srcStable.replace(/<end>/gi, "")}
                {srcPartial && (
                  <span className="text-[#2E7D32]/50">
                    {" "}
                    {srcPartial.replace(/<end>/gi, "")}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-gray-400 text-center py-2">
                {isListening ? t("listen.listening") : t("listen.waitingAudio")}
              </p>
            )}
          </div>
        </div>

        {/* Language selector */}
        <div className="flex-shrink-0 px-6 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {t("listen.translateTo")}
            </span>
            <div className="relative inline-flex items-center">
              <select
                id="translation-language"
                className="appearance-none bg-gray-50 text-gray-700 text-sm px-3 py-1.5 pr-8 rounded-lg border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
                value={targetLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                {LANG_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="pointer-events-none absolute right-2 h-4 w-4 text-gray-400"
              >
                <path d="M6 8l4 4 4-4" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>

        {/* Translation output (scrollable) - STABLE ZONE: only finalized paragraphs */}
        <div
          ref={translationScrollRef}
          className="flex-1 min-h-0 overflow-y-auto px-6 py-4 bg-white"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#d1d5db transparent",
          }}
        >
          <div className="space-y-0">
            {/* Finalized paragraphs - these never change once displayed */}
            {renderList.map((p, i) => (
              <div
                key={`en-p-${i}`}
                className="py-4 border-b border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <p
                  className="text-xl leading-[2] text-gray-800"
                  style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}
                >
                  {p}
                </p>
                {verseReferences[i] && (
                  <button
                    onClick={() => {
                      // Extract verse key from reference (e.g., "Al-Kahf 18:38-42" → "18:38-42")
                      const match =
                        verseReferences[i]?.match(/(\d+:\d+(?:-\d+)?)/);
                      if (match) {
                        setSelectedVerseKey(match[1]);
                      }
                    }}
                    className="group mt-2 inline-flex items-center gap-1.5 text-sm text-[#2E7D32]/80 italic hover:text-[#2E7D32] active:text-[#1B5E20] transition-all cursor-pointer rounded-md px-2 py-1 -ml-2 hover:bg-[#2E7D32]/5 active:bg-[#2E7D32]/10"
                    style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    <span className="underline decoration-[#2E7D32]/30 underline-offset-2 group-hover:decoration-[#2E7D32]/60">
                      {verseReferences[i]}
                    </span>
                  </button>
                )}
              </div>
            ))}

            {/* Empty state when not listening and no content */}
            {!isListening && renderList.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <span className="text-gray-400 text-lg">
                  {labelFor(targetLang)} {t("listen.translationWillAppear")}
                </span>
              </div>
            )}
          </div>
          <div ref={endRef} aria-hidden="true" />
        </div>

        {/* LIVE PREVIEW: Shows incoming words with blur effect */}
        {isListening && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
            <div className="px-6 py-4">
              {(() => {
                const currentLiveText = concatReadable(enCurrent, enPartial);
                if (currentLiveText) {
                  lastLiveTextRef.current = currentLiveText;
                }
                const displayText = currentLiveText || lastLiveTextRef.current;

                if (!displayText) {
                  // Show subtle typing indicator when no text yet
                  return (
                    <div className="flex items-center justify-center py-2">
                      <span className="typing-dots">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </span>
                    </div>
                  );
                }

                // Split text into words for staggered animation
                const words = displayText.split(/\s+/);

                return (
                  <p
                    className="text-xl leading-[2] text-gray-800"
                    style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}
                  >
                    {words.map((word, i) => (
                      <span
                        key={`${i}-${word}`}
                        className="live-word"
                        style={{
                          animationDelay: `${Math.min(i * 0.05, 0.5)}s`,
                        }}
                      >
                        {word}{" "}
                      </span>
                    ))}
                    <span className="inline-block w-0.5 h-5 bg-[#2E7D32] animate-pulse align-middle" />
                  </p>
                );
              })()}
            </div>
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

      {/* Verse Modal - shows Quran verse details when clicked */}
      <VerseModal
        verseKey={selectedVerseKey}
        onClose={() => setSelectedVerseKey(null)}
        targetLang={targetLang}
      />

      {/* Email Modal - send translation via email */}
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

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Footer with controls */}
      <footer className="flex-shrink-0 border-t border-gray-100 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            {hasStopped && !isListening && (
              <div className="flex flex-col items-center gap-3 w-full">
                {/* Quick actions row - Copy & Email */}
                {refinedParagraphs.length > 0 && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <button
                      onClick={handleCopyTranslation}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2E7D32] text-white font-medium text-sm px-5 py-2.5 transition-all hover:bg-[#1B5E20] hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#2E7D32]/20"
                      aria-label={t("share.copy")}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      {t("share.copy")}
                    </button>
                    <button
                      onClick={() => setShowEmailModal(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2E7D32] text-white font-medium text-sm px-5 py-2.5 transition-all hover:bg-[#1B5E20] hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#2E7D32]/20"
                      aria-label={t("share.email")}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      {t("share.email")}
                    </button>
                  </div>
                )}

                {/* Secondary actions row */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push("/")}
                    className="inline-flex items-center justify-center rounded-full border border-gray-300 text-gray-600 font-medium text-sm px-4 py-2 transition-colors hover:bg-gray-50 hover:border-gray-400"
                    aria-label={t("listen.returnHome")}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={isRTL ? "ml-1.5" : "mr-1.5"}
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    {t("listen.returnHome")}
                  </button>
                  <button
                    onClick={() => setIsSheetOpen(true)}
                    className="inline-flex items-center justify-center rounded-full border border-gray-300 text-gray-600 font-medium text-sm px-4 py-2 transition-colors hover:bg-gray-50 hover:border-gray-400"
                    aria-label={t("footer.donate")}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={isRTL ? "ml-1.5" : "mr-1.5"}
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {t("footer.donate")}
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={isListening ? handleStop : handleStart}
              aria-label={isListening ? "Stop" : "Start listening"}
              className={`relative h-14 w-14 rounded-full flex items-center justify-center transition-all outline-none focus:outline-none ring-0 focus:ring-0 no-tap-highlight ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25"
                  : "bg-[#2E7D32] hover:bg-[#1B5E20] hover:scale-105 shadow-lg shadow-[#2E7D32]/30"
              }`}
            >
              {isListening ? (
                <>
                  <div className="h-5 w-5 rounded-sm bg-white" />
                  <span
                    className="pulse-ring"
                    style={{ borderColor: "#ef4444" }}
                  />
                </>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z"
                    fill="white"
                  />
                  <path
                    d="M5 11a1 1 0 1 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H10a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11Z"
                    fill="white"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
