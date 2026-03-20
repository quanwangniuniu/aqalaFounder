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

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || "https://aqala.io";

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

  // Fetch summary when modal opens
  useEffect(() => {
    if (!visible || !refinedText.trim()) return;
    if (summary) return; // already loaded

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`${WEB_URL}/api/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: refinedText,
            sourceText,
            targetLang,
          }),
        });
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        if (!cancelled) setSummary(data.summary || "No summary available.");
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to generate summary");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, refinedText, sourceText, targetLang, summary]);

  const handleAsk = useCallback(async () => {
    const q = question.trim();
    if (!q || !summary || asking) return;

    Keyboard.dismiss();
    setQuestion("");
    setAsking(true);

    const newConvo = [...conversation, { role: "user" as const, content: q }];
    setConversation(newConvo);

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
    setSummary(null);
    setConversation([]);
    setQuestion("");
    setError(null);
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
              <Text
                style={{ fontSize: 18, fontWeight: "600", color: "white" }}
              >
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
              <Ionicons
                name="close"
                size={18}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>
          </View>

          {/* Body */}
          {loading ? (
            <View
              style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
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
            <View style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
              <View
                style={{
                  backgroundColor: "rgba(248,113,113,0.1)",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <Text style={{ fontSize: 14, color: "#f87171" }}>{error}</Text>
              </View>
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
                  <Text
                    style={{
                      fontSize: 15,
                      lineHeight: 24,
                      color: "rgba(255,255,255,0.85)",
                      marginBottom: 20,
                    }}
                  >
                    {summary}
                  </Text>
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
                      <Text
                        style={{
                          fontSize: 14,
                          lineHeight: 22,
                          color:
                            msg.role === "user"
                              ? accent.base
                              : "rgba(255,255,255,0.8)",
                        }}
                      >
                        {msg.content}
                      </Text>
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
