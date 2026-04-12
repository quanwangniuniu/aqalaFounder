import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface VerseHighlight {
  startWord: number;
  endWord: number;
  verseKey: string;
  verseReference: string;
  /** When set, the Quran card shows this text instead of the live transcript slice. */
  canonicalTranslation?: string;
  /** If true, the card shows the live STT translation slice (order preserved). */
  useLiveTranscript?: boolean;
}

interface MergedGroup {
  startWord: number;
  endWord: number;
  verseKey: string;
  label: string;
  canonicalTranslation?: string;
}

function parseChapter(verseKey: string): number {
  return parseInt(verseKey.split(":")[0], 10) || 0;
}

function mergeHighlights(
  highlights: VerseHighlight[],
  maxWord: number,
  gapThreshold = 12,
): MergedGroup[] {
  if (highlights.length === 0) return [];

  const sorted = [...highlights]
    .filter((h) => h.startWord < maxWord)
    .sort((a, b) => a.startWord - b.startWord);

  if (sorted.length === 0) return [];

  const groups: MergedGroup[] = [];
  const firstCanon = sorted[0].canonicalTranslation?.trim();
  let current = {
    chapter: parseChapter(sorted[0].verseKey),
    startWord: sorted[0].startWord,
    endWord: Math.min(sorted[0].endWord, maxWord),
    verseKeys: [sorted[0].verseKey],
    references: [sorted[0].verseReference],
    canonicalParts: firstCanon ? [firstCanon] : ([] as string[]),
  };

  for (let i = 1; i < sorted.length; i++) {
    const hl = sorted[i];
    const hlChapter = parseChapter(hl.verseKey);
    const hlEnd = Math.min(hl.endWord, maxWord);
    const gap = hl.startWord - current.endWord;

    if (hlChapter === current.chapter && gap <= gapThreshold) {
      current.endWord = Math.max(current.endWord, hlEnd);
      if (!current.verseKeys.includes(hl.verseKey)) {
        current.verseKeys.push(hl.verseKey);
        current.references.push(hl.verseReference);
      }
      const c = hl.canonicalTranslation?.trim();
      if (
        c &&
        current.canonicalParts[current.canonicalParts.length - 1] !== c
      ) {
        current.canonicalParts.push(c);
      }
    } else {
      groups.push(finalizeGroup(current));
      const canon = hl.canonicalTranslation?.trim();
      current = {
        chapter: hlChapter,
        startWord: hl.startWord,
        endWord: hlEnd,
        verseKeys: [hl.verseKey],
        references: [hl.verseReference],
        canonicalParts: canon ? [canon] : [],
      };
    }
  }
  groups.push(finalizeGroup(current));
  return groups;
}

function finalizeGroup(g: {
  chapter: number;
  startWord: number;
  endWord: number;
  verseKeys: string[];
  references: string[];
  canonicalParts: string[];
}): MergedGroup {
  const canonicalTranslation =
    g.canonicalParts.length > 0 ? g.canonicalParts.join(" ") : undefined;

  if (g.verseKeys.length === 1) {
    return {
      startWord: g.startWord,
      endWord: g.endWord,
      verseKey: g.verseKeys[0],
      label: g.references[0],
      canonicalTranslation,
    };
  }

  const verses = g.verseKeys
    .map((vk) => {
      const parts = vk.split(":");
      return { chapter: parseInt(parts[0], 10), verse: parts[1] };
    })
    .sort((a, b) => {
      const aStart = parseInt(a.verse.split("-")[0], 10);
      const bStart = parseInt(b.verse.split("-")[0], 10);
      return aStart - bStart;
    });

  let minVerse = Infinity;
  let maxVerse = 0;
  for (const v of verses) {
    const range = v.verse.split("-");
    const s = parseInt(range[0], 10);
    const e = parseInt(range[range.length - 1], 10);
    if (s < minVerse) minVerse = s;
    if (e > maxVerse) maxVerse = e;
  }

  const chapterPart = g.references[0].split(/\s\d/)[0];
  const rangeLabel =
    minVerse === maxVerse
      ? `${chapterPart} ${g.chapter}:${minVerse}`
      : `${chapterPart} ${g.chapter}:${minVerse}-${maxVerse}`;

  const combinedKey =
    minVerse === maxVerse
      ? `${g.chapter}:${minVerse}`
      : `${g.chapter}:${minVerse}-${maxVerse}`;

  return {
    startWord: g.startWord,
    endWord: g.endWord,
    verseKey: combinedKey,
    label: rangeLabel,
    canonicalTranslation,
  };
}

const BODY = {
  fontSize: 17,
  lineHeight: 28,
  color: "rgba(255,255,255,0.92)",
  /** Lets long lines wrap inside flex parents instead of overflowing past the screen edge. */
  flexShrink: 1,
} as const;

type Segment =
  | { type: "plain"; text: string; key: string }
  | {
      type: "verse";
      key: string;
      text: string;
      verseKey: string;
      label: string;
    };

interface Props {
  words: string[];
  highlights: VerseHighlight[];
  accentColor: string;
  onVersePress: (verseKey: string) => void;
  maxWord?: number;
  /** Use streamed translation words in Quran cards (live listen) instead of canonical text. */
  preferLiveTranscript?: boolean;
  /** When the target translation is Arabic (or other RTL script), mirror verse cards and text. */
  writingDirection?: "ltr" | "rtl";
}

function buildSegments(
  visibleWords: string[],
  groups: MergedGroup[],
  limit: number,
  preferLiveTranscript: boolean,
): Segment[] {
  const out: Segment[] = [];
  const L = limit;
  let emitFrom = 0;

  const pushPlain = (from: number, to: number) => {
    if (from >= to) return;
    const t = visibleWords.slice(from, to).join(" ").trimEnd();
    if (t.length > 0) {
      out.push({ type: "plain", text: t, key: `p-${from}-${to}` });
    }
  };

  for (const group of groups) {
    const S = group.startWord;
    const E = group.endWord;

    if (emitFrom < Math.min(S, L)) {
      pushPlain(emitFrom, Math.min(S, L));
      emitFrom = Math.min(S, L);
    }

    if (L > S) {
      const slice = visibleWords.slice(S, Math.min(E, L)).join(" ").trim();
      const verseText = preferLiveTranscript
        ? slice
        : group.canonicalTranslation?.trim() || slice;
      if (verseText.length > 0) {
        out.push({
          type: "verse",
          key: `v-${group.startWord}-${group.verseKey}`,
          text: verseText,
          verseKey: group.verseKey,
          label: group.label,
        });
      }
      // Advance past the verse in transcript space so typewriter can show [E, L).
      emitFrom = Math.max(emitFrom, E);
    }
  }

  if (emitFrom < L) {
    pushPlain(emitFrom, L);
  }

  return out;
}

export default function VerseHighlightedText({
  words,
  highlights,
  accentColor,
  onVersePress,
  maxWord,
  preferLiveTranscript = false,
  writingDirection = "ltr",
}: Props) {
  const isRtl = writingDirection === "rtl";
  const textDirStyle = isRtl
    ? ({ writingDirection: "rtl" as const, textAlign: "right" as const })
    : ({ writingDirection: "ltr" as const, textAlign: "left" as const });

  /** How many words to show (typewriter). Highlight geometry uses full `words.length`. */
  const displayLimit = maxWord ?? words.length;
  const visibleWords = words.slice(0, displayLimit);
  const segments = useMemo(() => {
    if (highlights.length === 0 || displayLimit === 0) {
      return null as Segment[] | null;
    }
    const slice = words.slice(0, displayLimit);
    if (slice.length === 0) return null;
    // Merge against full transcript so highlights aren't dropped when
    // startWord > revealedWordCount (e.g. English before Arabic in translation).
    const groups = mergeHighlights(highlights, words.length);
    if (groups.length === 0) return null;
    return buildSegments(
      slice,
      groups,
      displayLimit,
      preferLiveTranscript,
    );
  }, [highlights, words, displayLimit, preferLiveTranscript]);

  if (!segments) {
    return (
      <View style={styles.column}>
        <Text style={[BODY, textDirStyle]}>
          {visibleWords.length > 0 ? visibleWords.join(" ") : ""}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.column}>
      {segments.map((seg, index) => {
        if (seg.type === "plain") {
          return (
            <Text
              key={seg.key}
              style={[BODY, textDirStyle, index > 0 ? styles.afterBlock : null]}
            >
              {seg.text}
            </Text>
          );
        }

        const showDivider = index > 0;

        return (
          <Pressable
            key={seg.key}
            onPress={() => onVersePress(seg.verseKey)}
            accessibilityRole="button"
            accessibilityLabel={`Quran: ${seg.label}. Tap to open full surah.`}
            android_ripple={{
              color: `${accentColor}33`,
              borderless: false,
            }}
            style={({ pressed }) => [
              styles.verseWrap,
              showDivider && styles.verseDivider,
              pressed && styles.versePressed,
            ]}
          >
            <View
              style={[
                styles.verseRow,
                isRtl ? styles.verseRowRtl : null,
              ]}
            >
              <View style={[styles.rail, { backgroundColor: accentColor }]} />
              <View
                style={[
                  styles.verseBody,
                  isRtl ? styles.verseBodyRtl : null,
                ]}
              >
                <View
                  style={[
                    styles.detectedRow,
                    isRtl ? styles.detectedRowRtl : null,
                  ]}
                >
                  <View
                    style={[styles.detectDot, { backgroundColor: accentColor }]}
                  />
                  <Text
                    style={[
                      styles.detectedLabel,
                      textDirStyle,
                      { color: accentColor },
                    ]}
                  >
                    Quran detected
                  </Text>
                </View>
                <Text style={[styles.verseText, textDirStyle]}>{seg.text}</Text>
                <View
                  style={[
                    styles.metaRow,
                    isRtl ? styles.metaRowRtl : null,
                  ]}
                >
                  <Ionicons
                    name="book-outline"
                    size={14}
                    color="rgba(255,255,255,0.45)"
                  />
                  <Text
                    style={[styles.refText, textDirStyle]}
                    numberOfLines={1}
                  >
                    {seg.label}
                  </Text>
                  <Text style={[styles.tapHint, textDirStyle]}>
                    · tap to open full surah
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flexDirection: "column",
    alignItems: "stretch",
    flexShrink: 1,
    width: "100%",
    maxWidth: "100%",
    /** Critical: default minWidth:auto blocks wrapping in flex layouts (text clips on the right). */
    minWidth: 0,
  },
  afterBlock: {
    marginTop: 10,
  },
  verseWrap: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
  },
  verseDivider: {
    marginTop: 14,
  },
  versePressed: {
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  verseRow: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
  },
  verseRowRtl: {
    flexDirection: "row-reverse",
  },
  rail: {
    width: 3,
    opacity: 0.95,
  },
  verseBody: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    paddingRight: 14,
    paddingLeft: 12,
  },
  verseBodyRtl: {
    paddingRight: 12,
    paddingLeft: 14,
  },
  detectedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  detectedRowRtl: {
    flexDirection: "row-reverse",
  },
  detectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.9,
  },
  detectedLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  verseText: {
    ...BODY,
    color: "rgba(255,255,255,0.94)",
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
    flexWrap: "wrap",
  },
  metaRowRtl: {
    flexDirection: "row-reverse",
  },
  refText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.72)",
  },
  tapHint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.38)",
  },
});
