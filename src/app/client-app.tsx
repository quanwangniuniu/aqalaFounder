"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CharityModal from "./charity-modal";
import {
  saveTranslation,
  subscribeTranslations,
  TranslationEntry,
  updateLiveStream,
  clearLiveStream,
} from "@/lib/firebase/translationHistory";
import { useRooms } from "@/contexts/RoomsContext";
import { useAuth } from "@/contexts/AuthContext";

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
  const clientRef = useRef<any | null>(null);
  const startedRef = useRef<boolean>(false);
  const enFinalSeen = useRef<Set<string>>(new Set());
  const arFinalSeen = useRef<Set<string>>(new Set());
  const [isListening, setIsListening] = useState(false);
  const [hasStopped, setHasStopped] = useState(false);
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
  const [targetLang, setTargetLang] = useState("en");
  const labelFor = (code: string) =>
    LANG_OPTIONS.find((l) => l.code === code)?.label ?? code;
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [enParagraphs, setEnParagraphs] = useState<string[]>([]);
  const [refinedParagraphs, setRefinedParagraphs] = useState<string[]>([]);
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
      if (isListening) {
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
        targetLang: targetLang,
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
        // Filter to only show translations matching current target language
        const matchingLang = incoming.filter(
          (entry) => entry.targetLang === targetLang
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
  ): Promise<string | null> {
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          context: buildContextSnippet(),
          arabicText: arabic ?? buildArabicSnippet(),
          fast: !!fast,
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
        return null;
      }
      const data = await res.json();
      return (data?.result as string) || null;
    } catch (e: any) {
      setError(`Refine request failed: ${e?.message ?? String(e)}`);
      return null;
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
    const refined = await refineSegment(next.en, next.ar, !!next.fast);
    if (refined && refined.trim().length > 0) {
      const pieces = splitRefinedIntoParas(refined, 420, 2);
      // Reset live text ref since we're finalizing a paragraph
      lastLiveTextRef.current = "";
      if (pieces.length <= 1) {
        const newPara = pieces[0];
        setRefinedParagraphs((prev) => [...prev, newPara]);
        // Also store in translationMapRef for current targetLang
        const langKey = targetLang;
        const existing = translationMapRef.current.get(langKey) || [];
        translationMapRef.current.set(langKey, [...existing, newPara]);
      } else {
        // Append first piece immediately; drip the rest one-by-one to avoid "all at once"
        const firstPiece = pieces[0];
        setRefinedParagraphs((prev) => [...prev, firstPiece]);
        // Store first piece in translationMapRef
        const langKey = targetLang;
        const existing = translationMapRef.current.get(langKey) || [];
        translationMapRef.current.set(langKey, [...existing, firstPiece]);
        // Note: Remaining pieces will be added via dripNextPiece, which should also update translationMapRef
        enqueueDisplayPieces(pieces.slice(1));
      }
      // Save translation to history if mosqueId and translatorId are provided
      if (mosqueId && translatorId && next.ar.trim() && refined.trim()) {
        try {
          await saveTranslation(mosqueId, {
            sourceText: next.ar.trim(),
            translatedText: refined.trim(),
            sourceLang: detectedLang || "unknown",
            targetLang: targetLang,
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
    if (pendingQueueRef.current.length > 0) {
      // process the next sentence quickly to keep flow
      setTimeout(triggerRefine, 200);
    }
  }

  // Drip-append queue for extra pieces produced by a single refine call
  const displayQueueRef = useRef<string[]>([]);
  const displayDripActiveRef = useRef<boolean>(false);
  function dripNextPiece() {
    if (displayQueueRef.current.length === 0) {
      displayDripActiveRef.current = false;
      return;
    }
    const next = displayQueueRef.current.shift();
    if (next && next.trim().length > 0) {
      setRefinedParagraphs((prev) => [...prev, next]);
      // Also store in translationMapRef for current targetLang
      const langKey = targetLang;
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
    // Generate new session ID for this translation session
    sessionIdRef.current = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    enFinalSeen.current = new Set();
    setDetectedLang(null);
    setEnParagraphs([]);
    // Don't clear refinedParagraphs - preserve historical translations
    // The Firestore subscription will maintain history
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
          setIsListening(false);
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

  function handleStop() {
    try {
      clientRef.current?.stop();
    } catch {
    } finally {
      setIsListening(false);
      setHasStopped(true);
      // Force-flush any remaining buffered text as we are explicitly stopping
      flushPendingNow();
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
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
              {detectedLang ? labelFor(detectedLang) : "Reference"}
            </span>
            {isListening && (
              <span className="flex items-center gap-2 text-xs text-[#2E7D32] font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D32] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E7D32]"></span>
                </span>
                Live
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
                {isListening ? "Listening..." : "Waiting for audio…"}
              </p>
            )}
          </div>
        </div>

        {/* Language selector */}
        <div className="flex-shrink-0 px-6 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Translate to</span>
            <div className="relative inline-flex items-center">
              <select
                id="translation-language"
                className="appearance-none bg-gray-50 text-gray-700 text-sm px-3 py-1.5 pr-8 rounded-lg border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                disabled={isListening}
                style={{ pointerEvents: isListening ? "none" : "auto" }}
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

        {/* Translation output (scrollable) */}
        <div
          ref={translationScrollRef}
          className="flex-1 min-h-0 overflow-y-auto px-6 py-4 bg-white"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#d1d5db transparent",
          }}
        >
          <div className="space-y-0">
            {/* Finalized paragraphs */}
            {renderList.map((p, i) => (
              <div key={`en-p-${i}`} className="py-4 border-b border-gray-100">
                <p
                  className="text-xl leading-[2] text-gray-800"
                  style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}
                >
                  {p}
                </p>
              </div>
            ))}

            {/* Live streaming translation (shows as you speak) */}
            {isListening &&
              (() => {
                // Build current live text, keeping last known text if briefly empty
                const currentLiveText = concatReadable(enCurrent, enPartial);
                if (currentLiveText) {
                  lastLiveTextRef.current = currentLiveText;
                }
                const displayText = currentLiveText || lastLiveTextRef.current;
                const hasEverHadContent = displayText.length > 0;

                return (
                  <div className="py-4">
                    <p
                      className="text-xl leading-[2] text-gray-800"
                      style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}
                    >
                      {hasEverHadContent ? (
                        <>
                          {displayText}
                          <span className="inline-block w-0.5 h-5 bg-[#2E7D32] ml-1 animate-pulse align-middle" />
                        </>
                      ) : (
                        <span className="text-gray-400 italic">
                          Listening...
                        </span>
                      )}
                    </p>
                  </div>
                );
              })()}

            {/* Empty state when not listening and no content */}
            {!isListening && renderList.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <span className="text-gray-400 text-lg">
                  {labelFor(targetLang)} translation will appear here…
                </span>
              </div>
            )}
          </div>
          <div ref={endRef} aria-hidden="true" />
        </div>
      </main>

      <CharityModal
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        currency="$"
        baseAmount={0}
        presetAmounts={[7, 20, 50]}
      />

      {/* Footer with controls */}
      <footer className="flex-shrink-0 border-t border-gray-100 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            {hasStopped && !isListening && (
              <>
                <button
                  onClick={() => router.push("/")}
                  className="inline-flex items-center justify-center rounded-full border border-[#2E7D32] text-[#2E7D32] font-medium text-sm px-5 py-2 transition-colors hover:bg-[#2E7D32]/5"
                  aria-label="Return home"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Return home
                </button>
                <button
                  onClick={() => setIsSheetOpen(true)}
                  className="inline-flex items-center justify-center rounded-full border border-[#2E7D32] text-[#2E7D32] font-medium text-sm px-5 py-2 transition-colors hover:bg-[#2E7D32]/5"
                  aria-label="Go to donation"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Donate
                </button>
              </>
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
