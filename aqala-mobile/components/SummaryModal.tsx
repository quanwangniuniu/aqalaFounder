import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Platform,
  Keyboard,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { usePreferences } from "@/contexts/PreferencesContext";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || "https://www.aqala.org";

// ── Lightweight markdown renderer ─────────────────────────────────────

function renderInline(text: string, baseColor: string, accentColor: string) {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\[([^\]]+)\s+(\d+:\d+(?:-\d+)?)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(
        <Text
          key={match.index}
          style={{ fontWeight: "700", color: "rgba(255,255,255,0.95)" }}
        >
          {match[1]}
        </Text>,
      );
    } else if (match[2] && match[3]) {
      parts.push(
        <Text
          key={match.index}
          style={{ fontWeight: "600", color: accentColor }}
        >
          {match[2]} {match[3]}
        </Text>,
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

function MarkdownText({
  content,
  accentColor,
}: {
  content: string;
  accentColor: string;
}) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  const baseColor = "rgba(255,255,255,0.85)";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<View key={`sp-${i}`} style={{ height: 10 }} />);
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const sizes = [22, 19, 17, 15];
      elements.push(
        <Text
          key={`h-${i}`}
          style={{
            fontSize: sizes[level - 1] ?? 15,
            fontWeight: "700",
            color: "white",
            marginTop: level <= 2 ? 16 : 10,
            marginBottom: 6,
          }}
        >
          {renderInline(headingMatch[2], baseColor, accentColor)}
        </Text>,
      );
      continue;
    }

    // Numbered list
    const listMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (listMatch) {
      elements.push(
        <View
          key={`li-${i}`}
          style={{ flexDirection: "row", marginBottom: 8, paddingLeft: 4 }}
        >
          <Text
            style={{
              fontSize: 15,
              lineHeight: 24,
              color: accentColor,
              fontWeight: "600",
              width: 24,
            }}
          >
            {listMatch[1]}.
          </Text>
          <Text
            style={{ flex: 1, fontSize: 15, lineHeight: 24, color: baseColor }}
          >
            {renderInline(listMatch[2], baseColor, accentColor)}
          </Text>
        </View>,
      );
      continue;
    }

    // Bullet list
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      elements.push(
        <View
          key={`bl-${i}`}
          style={{ flexDirection: "row", marginBottom: 8, paddingLeft: 4 }}
        >
          <Text
            style={{
              fontSize: 15,
              lineHeight: 24,
              color: accentColor,
              width: 20,
            }}
          >
            •
          </Text>
          <Text
            style={{ flex: 1, fontSize: 15, lineHeight: 24, color: baseColor }}
          >
            {renderInline(bulletMatch[1], baseColor, accentColor)}
          </Text>
        </View>,
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <Text
        key={`p-${i}`}
        style={{
          fontSize: 15,
          lineHeight: 24,
          color: baseColor,
          marginBottom: 4,
        }}
      >
        {renderInline(trimmed, baseColor, accentColor)}
      </Text>,
    );
  }

  return <View>{elements}</View>;
}

// ── Modal ──────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SummaryModalProps {
  visible: boolean;
  onClose: () => void;
  refinedText: string;
  sourceText: string;
  targetLang: string;
}

export default function SummaryModal({
  visible,
  onClose,
  refinedText,
  sourceText,
  targetLang,
}: SummaryModalProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [conversation, setConversation] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const { getGradientColors, getAccentColor } = usePreferences();
  const gradientColors = getGradientColors() as [string, string, ...string[]];
  const accent = getAccentColor();

  const fetchSummary = useCallback(
    async (signal: AbortSignal) => {
      const url = `${WEB_URL}/api/summarize`;
      console.log("[SummaryModal] fetchSummary called");
      console.log("[SummaryModal] URL:", url);
      console.log("[SummaryModal] refinedText length:", refinedText.length);
      console.log(
        "[SummaryModal] refinedText preview:",
        refinedText.slice(0, 200),
      );
      console.log("[SummaryModal] sourceText length:", sourceText.length);
      console.log("[SummaryModal] targetLang:", targetLang);

      setLoading(true);
      setError(null);

      try {
        const body = JSON.stringify({
          text: refinedText,
          sourceText,
          targetLang,
        });
        console.log("[SummaryModal] Sending POST, body length:", body.length);

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          signal,
        });

        console.log("[SummaryModal] Response status:", res.status);
        console.log("[SummaryModal] Response ok:", res.ok);

        if (!res.ok) {
          const respBody = await res.text().catch(() => "");
          console.log("[SummaryModal] Error response body:", respBody);
          throw new Error(
            `Server error ${res.status}${respBody ? `: ${respBody}` : ""}`,
          );
        }
        const data = await res.json();
        console.log("[SummaryModal] Response data keys:", Object.keys(data));
        console.log(
          "[SummaryModal] Summary length:",
          data.summary?.length ?? 0,
        );
        if (!signal.aborted)
          setSummary(data.summary || "No summary available.");
      } catch (e: any) {
        console.log("[SummaryModal] Fetch error:", e?.name, e?.message);
        if (signal.aborted) {
          console.log("[SummaryModal] Request was aborted, ignoring");
          return;
        }
        if (e?.name === "AbortError") {
          setError("Request timed out. Tap to retry.");
        } else {
          setError(e?.message ?? "Failed to generate summary");
        }
      } finally {
        if (!signal.aborted) setLoading(false);
        console.log(
          "[SummaryModal] fetchSummary done, aborted:",
          signal.aborted,
        );
      }
    },
    [refinedText, sourceText, targetLang],
  );

  // Fetch summary when modal opens
  useEffect(() => {
    console.log(
      "[SummaryModal] Effect fired — visible:",
      visible,
      "summary:",
      !!summary,
      "refinedText length:",
      refinedText.length,
    );

    if (!visible) return;
    if (summary) {
      console.log("[SummaryModal] Already have summary, skipping");
      return;
    }

    if (!refinedText.trim()) {
      console.log("[SummaryModal] refinedText is empty, setting error");
      setError("No translation text available to summarize.");
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      console.log("[SummaryModal] 30s timeout reached, aborting");
      controller.abort();
    }, 30000);

    console.log("[SummaryModal] Starting fetchSummary");
    fetchSummary(controller.signal);

    return () => {
      console.log("[SummaryModal] Effect cleanup — aborting controller");
      clearTimeout(timer);
      controller.abort();
    };
  }, [visible, refinedText, summary, fetchSummary]);

  const handleRetry = useCallback(() => {
    setSummary(null);
    setError(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    fetchSummary(controller.signal).finally(() => clearTimeout(timer));
  }, [fetchSummary]);

  const handleAsk = useCallback(async () => {
    const q = question.trim();
    if (!q || !summary || asking) return;

    Keyboard.dismiss();
    setQuestion("");
    setAsking(true);

    const newConvo = [...conversation, { role: "user" as const, content: q }];
    setConversation(newConvo);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const res = await fetch(`${WEB_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          summary,
          originalText: refinedText.slice(0, 4000),
          conversationHistory: newConvo,
          targetLang,
        }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || "No answer." },
      ]);
    } catch {
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to get an answer. Try again." },
      ]);
    } finally {
      setAsking(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [question, summary, conversation, asking, refinedText, targetLang]);

  const handleCopySummary = useCallback(async () => {
    if (!summary) return;
    try {
      await Share.share({ message: summary });
    } catch {}
  }, [summary]);

  const handleClose = useCallback(() => {
    setQuestion("");
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        <TouchableOpacity
          style={{ flex: 0.05 }}
          activeOpacity={1}
          onPress={handleClose}
        />

        <LinearGradient
          colors={gradientColors}
          style={{
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
            flex: 1,
            maxHeight: "95%",
          }}
        >
          {/* Drag handle */}
          <View
            style={{ alignItems: "center", paddingTop: 10, paddingBottom: 4 }}
          >
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
            />
          </View>

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.05)",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: `${accent.base}26`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="sparkles" size={20} color={accent.base} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>
                Summary & Q&A
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 2,
                }}
              >
                AI-generated from your session
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCopySummary}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.08)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
              }}
            >
              <Ionicons
                name="copy-outline"
                size={16}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.08)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color={accent.base} />
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 16,
                }}
              >
                Generating summary...
              </Text>
            </View>
          ) : error ? (
            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 24,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(248,113,113,0.1)",
                  borderRadius: 12,
                  padding: 16,
                  width: "100%",
                }}
              >
                <Text style={{ fontSize: 14, color: "#f87171" }}>{error}</Text>
              </View>
              <TouchableOpacity
                onPress={handleRetry}
                style={{
                  marginTop: 16,
                  backgroundColor: accent.base,
                  paddingHorizontal: 24,
                  paddingVertical: 10,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#000" }}
                >
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView
                ref={scrollRef}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingTop: 16,
                  paddingBottom: 12,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Summary */}
                {summary && (
                  <View style={{ marginBottom: 20 }}>
                    <MarkdownText content={summary} accentColor={accent.base} />
                  </View>
                )}

                {/* Q&A conversation */}
                {conversation.map((msg, i) => (
                  <View
                    key={i}
                    style={{
                      marginBottom: 12,
                      alignItems:
                        msg.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <View
                      style={{
                        maxWidth: "85%",
                        backgroundColor:
                          msg.role === "user"
                            ? `${accent.base}33`
                            : "rgba(255,255,255,0.06)",
                        borderRadius: 16,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                      }}
                    >
                      {msg.role === "assistant" ? (
                        <MarkdownText
                          content={msg.content}
                          accentColor={accent.base}
                        />
                      ) : (
                        <Text
                          style={{
                            fontSize: 14,
                            lineHeight: 22,
                            color: accent.base,
                          }}
                        >
                          {msg.content}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}

                {asking && (
                  <View style={{ marginBottom: 12, alignItems: "flex-start" }}>
                    <ActivityIndicator size="small" color={accent.base} />
                  </View>
                )}
              </ScrollView>

              {/* Q&A Input */}
              {summary && (
                <View
                  style={{
                    flexDirection: "row",
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: Platform.OS === "ios" ? 36 : 16,
                    borderTopWidth: 1,
                    borderTopColor: "rgba(255,255,255,0.05)",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <TextInput
                    value={question}
                    onChangeText={setQuestion}
                    placeholder="Ask a question..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderRadius: 20,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      fontSize: 14,
                      color: "white",
                    }}
                    returnKeyType="send"
                    onSubmitEditing={handleAsk}
                    editable={!asking}
                  />
                  <TouchableOpacity
                    onPress={handleAsk}
                    disabled={asking || !question.trim()}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor:
                        question.trim() && !asking
                          ? accent.base
                          : "rgba(255,255,255,0.06)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="send"
                      size={18}
                      color={
                        question.trim() && !asking
                          ? "#000"
                          : "rgba(255,255,255,0.3)"
                      }
                    />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
}
