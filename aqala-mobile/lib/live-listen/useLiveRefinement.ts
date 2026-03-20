import { useCallback, useRef, useState } from "react";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || "https://aqala.io";

// ── Text helpers ──────────────────────────────────────────────────────

function concatReadable(...parts: string[]) {
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitIntoSentences(text: string): string[] {
  const cleaned = (text || "").trim();
  if (!cleaned) return [];

  const matchArr = cleaned.match(/[^.!?؟؛۔]+[.!?؟؛۔]["'"')\]]*/g);
  let parts: string[];
  if (matchArr && matchArr.length > 0) {
    parts = Array.from(matchArr)
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    parts = cleaned
      .split(/[،,;؛—–]+/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }

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

function splitRefinedIntoParas(
  text: string,
  maxLen = 420,
  maxSentencesPerChunk = 2,
): string[] {
  const cleaned = (text || "").trim();
  if (cleaned.length === 0) return [];

  const paraParts = cleaned
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paraParts.length > 1) {
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

// ── API call ──────────────────────────────────────────────────────────

interface RefineResult {
  result: string | null;
  verseReference: string | null;
}

async function refineSegment(
  text: string,
  arabicText: string,
  targetLang: string,
  context: string,
): Promise<RefineResult> {
  try {
    const res = await fetch(`${WEB_URL}/api/refine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, arabicText, targetLang, context }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error(`Refine error (${res.status}): ${detail}`);
      return { result: null, verseReference: null };
    }
    const data = await res.json();
    return {
      result: (data?.result as string) || null,
      verseReference: (data?.verseReference as string) || null,
    };
  } catch (e: any) {
    console.error("Refine request failed:", e?.message ?? String(e));
    return { result: null, verseReference: null };
  }
}

// ── Queue item ────────────────────────────────────────────────────────

interface QueueItem {
  en: string;
  ar: string;
  fast?: boolean;
}

// ── Hook ──────────────────────────────────────────────────────────────

export interface UseLiveRefinementReturn {
  refinedParagraphs: string[];
  verseReferences: (string | null)[];
  sourceStable: string;
  error: string | null;

  /** Feed a completed translation sentence/chunk (from Soniox finalText delta). */
  feedTranslation: (chunk: string) => void;
  /** Feed source/original text (accumulates for Arabic context). */
  feedSource: (text: string) => void;
  /** Force-flush any buffered text (e.g. on stop or silence). */
  flush: () => void;
  /** Reset all state for a new session. */
  reset: () => void;
  /** Current target language ref (mutable). */
  setTargetLang: (lang: string) => void;
}

export function useLiveRefinement(
  initialTargetLang: string,
): UseLiveRefinementReturn {
  const [refinedParagraphs, setRefinedParagraphs] = useState<string[]>([]);
  const [verseReferences, setVerseReferences] = useState<(string | null)[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [sourceStable, setSourceStable] = useState("");

  const targetLangRef = useRef(initialTargetLang);

  // Accumulator batches small chunks before enqueuing for refine
  const accumulatorRef = useRef("");
  const arabicAccumulatorRef = useRef("");
  const accFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Silence timer: 3 s with no new text → flush
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sequential refine queue
  const pendingQueueRef = useRef<QueueItem[]>([]);
  const refiningRef = useRef(false);
  const stoppedRef = useRef(false);

  const refinedParagraphsRef = useRef<string[]>([]);

  const buildContext = useCallback(
    () =>
      refinedParagraphsRef.current.join("\n").slice(-3000),
    [],
  );

  // ── triggerRefine ─────────────────────────────────────────────────

  const triggerRefine = useCallback(async () => {
    if (refiningRef.current) return;
    const next = pendingQueueRef.current.shift();
    if (!next) return;

    refiningRef.current = true;
    const { result: refined, verseReference } = await refineSegment(
      next.en,
      next.ar,
      targetLangRef.current,
      buildContext(),
    );

    if (stoppedRef.current) {
      refiningRef.current = false;
      return;
    }

    if (refined && refined.trim().length > 0) {
      const pieces = splitRefinedIntoParas(refined, 420, 2);

      setRefinedParagraphs((prev) => {
        const updated = [...prev, ...pieces];
        refinedParagraphsRef.current = updated;
        return updated;
      });

      setVerseReferences((prev) => [
        ...prev,
        verseReference,
        ...Array(pieces.length - 1).fill(null),
      ]);
    }

    refiningRef.current = false;

    if (!stoppedRef.current && pendingQueueRef.current.length > 0) {
      setTimeout(() => triggerRefine(), 200);
    }
  }, [buildContext]);

  // ── scheduleRefinement ────────────────────────────────────────────

  const scheduleRefinement = useCallback(
    (chunk: string) => {
      if (stoppedRef.current) return;
      const add = chunk.trim();
      if (add.length === 0) return;

      accumulatorRef.current = accumulatorRef.current
        ? `${accumulatorRef.current} ${add}`
        : add;

      const sentencesNow = splitIntoSentences(accumulatorRef.current);

      // 3-sentence flush
      if (sentencesNow.length >= 3) {
        const firstThree = sentencesNow.slice(0, 3).join(" ").trim();
        const remainder = sentencesNow.slice(3).join(" ").trim();
        const isFirst =
          refinedParagraphsRef.current.length === 0 &&
          pendingQueueRef.current.length === 0 &&
          !refiningRef.current;

        pendingQueueRef.current.push({
          en: firstThree,
          ar: arabicAccumulatorRef.current,
          fast: isFirst,
        });
        accumulatorRef.current = remainder;
        arabicAccumulatorRef.current = "";
        if (accFlushTimerRef.current) {
          clearTimeout(accFlushTimerRef.current);
          accFlushTimerRef.current = null;
        }
        if (!refiningRef.current) triggerRefine();
        return;
      }

      // Sentence-end + min length flush
      const endsSentence =
        /([.!?؟؛۔])(?:["'"')\]]+)?$/.test(add) || /\n\n/.test(add);
      if (endsSentence && accumulatorRef.current.length >= 100) {
        const isFirst =
          refinedParagraphsRef.current.length === 0 &&
          pendingQueueRef.current.length === 0 &&
          !refiningRef.current;

        pendingQueueRef.current.push({
          en: accumulatorRef.current,
          ar: arabicAccumulatorRef.current,
          fast: isFirst,
        });
        accumulatorRef.current = "";
        arabicAccumulatorRef.current = "";
        if (accFlushTimerRef.current) {
          clearTimeout(accFlushTimerRef.current);
          accFlushTimerRef.current = null;
        }
        if (!refiningRef.current) triggerRefine();
        return;
      }

      // Hard cap
      if (accumulatorRef.current.length >= 550) {
        pendingQueueRef.current.push({
          en: accumulatorRef.current,
          ar: arabicAccumulatorRef.current,
        });
        accumulatorRef.current = "";
        arabicAccumulatorRef.current = "";
        if (accFlushTimerRef.current) {
          clearTimeout(accFlushTimerRef.current);
          accFlushTimerRef.current = null;
        }
        if (!refiningRef.current) triggerRefine();
        return;
      }

      // Soft 800 ms idle timer
      if (accFlushTimerRef.current) {
        clearTimeout(accFlushTimerRef.current);
      }
      accFlushTimerRef.current = setTimeout(() => {
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
    },
    [triggerRefine],
  );

  // ── Silence timer ─────────────────────────────────────────────────

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    silenceTimerRef.current = setTimeout(() => {
      if (!stoppedRef.current) {
        flushInternal();
      }
    }, 3000);
  }, []);

  // ── Sentence splitting from Soniox finalText deltas ───────────────
  const prevFinalTextRef = useRef("");
  const enCurrentRef = useRef("");

  const feedTranslation = useCallback(
    (newFinalText: string) => {
      const prev = prevFinalTextRef.current;
      if (newFinalText.length <= prev.length) return;
      const delta = newFinalText.slice(prev.length);
      prevFinalTextRef.current = newFinalText;

      let buffer = enCurrentRef.current + delta;
      const parts = buffer.split(/([.!?؟؛۔])/);
      const maxRunOnWords = 28;

      let leftover = "";
      for (let i = 0; i < parts.length; i += 2) {
        const segment = (parts[i] || "").trim();
        const delim = parts[i + 1];
        if (!segment && !delim) continue;
        if (delim) {
          const sentence = concatReadable(segment + delim);
          if (sentence) {
            scheduleRefinement(sentence);
          }
        } else {
          leftover = concatReadable(segment);
        }
      }

      while (leftover && leftover.split(/\s+/).length > maxRunOnWords) {
        const words = leftover.trim().split(/\s+/);
        const head = words.slice(0, maxRunOnWords).join(" ");
        leftover = words.slice(maxRunOnWords).join(" ");
        if (head) scheduleRefinement(head);
      }

      enCurrentRef.current = leftover;
      resetSilenceTimer();
    },
    [scheduleRefinement, resetSilenceTimer],
  );

  // ── Source text accumulator ───────────────────────────────────────
  const prevSourceFinalRef = useRef("");

  const feedSource = useCallback((newFinalText: string) => {
    const prev = prevSourceFinalRef.current;
    if (newFinalText.length <= prev.length) return;
    const delta = newFinalText.slice(prev.length);
    prevSourceFinalRef.current = newFinalText;

    arabicAccumulatorRef.current = concatReadable(
      arabicAccumulatorRef.current,
      delta,
    );
    setSourceStable((s) => concatReadable(s, delta));
  }, []);

  // ── Flush ─────────────────────────────────────────────────────────

  const flushInternal = useCallback(() => {
    const leftover = (enCurrentRef.current || "").trim();
    if (leftover.length > 0) {
      pendingQueueRef.current.push({
        en: leftover,
        ar: arabicAccumulatorRef.current,
      });
      enCurrentRef.current = "";
    }
    if (accFlushTimerRef.current) {
      clearTimeout(accFlushTimerRef.current);
      accFlushTimerRef.current = null;
    }
    if (accumulatorRef.current.trim().length > 0) {
      pendingQueueRef.current.push({
        en: accumulatorRef.current.trim(),
        ar: arabicAccumulatorRef.current,
      });
      accumulatorRef.current = "";
      arabicAccumulatorRef.current = "";
    }
    if (!refiningRef.current) {
      triggerRefine();
    }
  }, [triggerRefine]);

  const flush = useCallback(() => {
    flushInternal();
  }, [flushInternal]);

  // ── Reset ─────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    stoppedRef.current = false;
    accumulatorRef.current = "";
    arabicAccumulatorRef.current = "";
    enCurrentRef.current = "";
    prevFinalTextRef.current = "";
    prevSourceFinalRef.current = "";
    pendingQueueRef.current = [];
    refiningRef.current = false;
    refinedParagraphsRef.current = [];
    if (accFlushTimerRef.current) {
      clearTimeout(accFlushTimerRef.current);
      accFlushTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setRefinedParagraphs([]);
    setVerseReferences([]);
    setSourceStable("");
    setError(null);
  }, []);

  const setTargetLang = useCallback((lang: string) => {
    targetLangRef.current = lang;
  }, []);

  return {
    refinedParagraphs,
    verseReferences,
    sourceStable,
    error,
    feedTranslation,
    feedSource,
    flush,
    reset,
    setTargetLang,
  };
}
