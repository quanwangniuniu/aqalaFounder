import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface VerseHighlight {
  startWord: number;
  endWord: number;
  verseKey: string;
  verseReference: string;
}

interface MergedGroup {
  startWord: number;
  endWord: number;
  verseKey: string;
  label: string;
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
  let current = {
    chapter: parseChapter(sorted[0].verseKey),
    startWord: sorted[0].startWord,
    endWord: Math.min(sorted[0].endWord, maxWord),
    verseKeys: [sorted[0].verseKey],
    references: [sorted[0].verseReference],
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
    } else {
      groups.push(finalizeGroup(current));
      current = {
        chapter: hlChapter,
        startWord: hl.startWord,
        endWord: hlEnd,
        verseKeys: [hl.verseKey],
        references: [hl.verseReference],
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
}): MergedGroup {
  if (g.verseKeys.length === 1) {
    return {
      startWord: g.startWord,
      endWord: g.endWord,
      verseKey: g.verseKeys[0],
      label: g.references[0],
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
  };
}

// ── Animated wrapper for verse blocks ────────────────────────────────

function AnimatedVerseBlock({
  group,
  words,
  accentColor,
  onPress,
  animate,
}: {
  group: MergedGroup;
  words: string[];
  accentColor: string;
  onPress: () => void;
  animate: boolean;
}) {
  // Gentle reveal: the block background + border fades in around text that's
  // already on screen. No vertical movement — just a quiet materialisation.
  const bgOpacity = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const labelOpacity = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.sequence([
      // Background fades in first
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Then the surah label slides in after a beat
      Animated.timing(labelOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [animate, bgOpacity, labelOpacity]);

  return (
    <Animated.View
      style={{ opacity: bgOpacity }}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={{
          backgroundColor: `${accentColor}18`,
          borderLeftWidth: 3,
          borderLeftColor: accentColor,
          borderRadius: 8,
          paddingHorizontal: 14,
          paddingVertical: 10,
          marginVertical: 8,
        }}
      >
        <Animated.View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 6,
            opacity: labelOpacity,
          }}
        >
          <Ionicons name="book-outline" size={13} color={accentColor} />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: accentColor,
              marginLeft: 5,
              letterSpacing: 0.3,
            }}
          >
            {group.label}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={12}
            color={`${accentColor}80`}
            style={{ marginLeft: 4 }}
          />
        </Animated.View>
        <Text style={{ fontSize: 17, lineHeight: 28, color: "rgba(255,255,255,0.95)" }}>
          {words.join(" ")}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main component ───────────────────────────────────────────────────

interface Props {
  words: string[];
  highlights: VerseHighlight[];
  accentColor: string;
  onVersePress: (verseKey: string) => void;
  maxWord?: number;
}

export default function VerseHighlightedText({
  words,
  highlights,
  accentColor,
  onVersePress,
  maxWord,
}: Props) {
  const limit = maxWord ?? words.length;
  const visibleWords = words.slice(0, limit);

  // Track which groups have already been rendered so we only animate new ones
  const seenGroupsRef = useRef<Set<string>>(new Set());

  if (highlights.length === 0 || visibleWords.length === 0) {
    return (
      <Text style={{ fontSize: 17, lineHeight: 28, color: "rgba(255,255,255,0.9)" }}>
        {visibleWords.join(" ")}
      </Text>
    );
  }

  const groups = mergeHighlights(highlights, limit);

  if (groups.length === 0) {
    return (
      <Text style={{ fontSize: 17, lineHeight: 28, color: "rgba(255,255,255,0.9)" }}>
        {visibleWords.join(" ")}
      </Text>
    );
  }

  const blocks: React.ReactNode[] = [];
  let cursor = 0;

  for (const group of groups) {
    const start = group.startWord;
    const end = Math.min(group.endWord, limit);
    const groupId = `${group.verseKey}-${group.startWord}`;
    const isNew = !seenGroupsRef.current.has(groupId);

    if (start > cursor) {
      blocks.push(
        <Text
          key={`plain-${cursor}`}
          style={{ fontSize: 17, lineHeight: 28, color: "rgba(255,255,255,0.9)" }}
        >
          {visibleWords.slice(cursor, start).join(" ")}
        </Text>,
      );
    }

    blocks.push(
      <AnimatedVerseBlock
        key={`verse-${group.startWord}`}
        group={group}
        words={visibleWords.slice(start, end)}
        accentColor={accentColor}
        onPress={() => onVersePress(group.verseKey)}
        animate={isNew}
      />,
    );

    // Mark as seen after first render
    if (isNew) seenGroupsRef.current.add(groupId);

    cursor = end;
  }

  if (cursor < limit) {
    blocks.push(
      <Text
        key={`plain-${cursor}`}
        style={{ fontSize: 17, lineHeight: 28, color: "rgba(255,255,255,0.9)" }}
      >
        {visibleWords.slice(cursor).join(" ")}
      </Text>,
    );
  }

  return <>{blocks}</>;
}
