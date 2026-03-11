import { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TafsirModalProps {
  visible: boolean;
  onClose: () => void;
  verseReference: string;
  tafsirText: string | null;
  resourceName: string | null;
  loading: boolean;
  error: string | null;
  title?: string;
  loadingText?: string;
}

interface ContentBlock {
  type: "heading" | "paragraph";
  text: string;
}

function parseTafsirHtml(html: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  const cleaned = html
    .replace(/\r\n/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  const headingRegex = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;

  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(cleaned);

  if (!hasHtmlTags) {
    const paragraphs = cleaned
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (paragraphs.length <= 1) {
      const sentences = cleaned.split(/(?<=[.!?])\s+/);
      const chunkSize = Math.ceil(sentences.length / Math.ceil(sentences.length / 4));
      for (let i = 0; i < sentences.length; i += chunkSize) {
        const chunk = sentences.slice(i, i + chunkSize).join(" ").trim();
        if (chunk) blocks.push({ type: "paragraph", text: chunk });
      }
    } else {
      paragraphs.forEach((p) => blocks.push({ type: "paragraph", text: p }));
    }

    return blocks;
  }

  const allTags: Array<{ index: number; type: "heading" | "paragraph"; text: string }> = [];

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(cleaned)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, "").trim();
    if (text) allTags.push({ index: match.index, type: "heading", text });
  }
  while ((match = pRegex.exec(cleaned)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, "").trim();
    if (text) allTags.push({ index: match.index, type: "paragraph", text });
  }

  allTags.sort((a, b) => a.index - b.index);

  if (allTags.length === 0) {
    const stripped = cleaned.replace(/<[^>]*>/g, "").trim();
    if (stripped) blocks.push({ type: "paragraph", text: stripped });
    return blocks;
  }

  allTags.forEach((tag) => blocks.push({ type: tag.type, text: tag.text }));
  return blocks;
}

export default function TafsirModal({
  visible,
  onClose,
  verseReference,
  tafsirText,
  resourceName,
  loading,
  error,
  title = "1-minute explanation",
  loadingText = "Loading explanation...",
}: TafsirModalProps) {
  const contentBlocks = useMemo(
    () => (tafsirText ? parseTafsirHtml(tafsirText) : []),
    [tafsirText]
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <View
          style={{
            backgroundColor: "#0a1a14",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
            maxHeight: "85%",
          }}
        >
          {/* Drag handle */}
          <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 4 }}>
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
                backgroundColor: "rgba(212,175,55,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="book" size={20} color="#D4AF37" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>
                {title}
              </Text>
              <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                {verseReference}
                {resourceName ? ` · ${resourceName}` : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
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

          {/* Content */}
          {loading ? (
            <View style={{ paddingVertical: 56, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#D4AF37" />
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 16 }}>
                {loadingText}
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
          ) : contentBlocks.length > 0 ? (
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: Platform.OS === "ios" ? 40 : 24,
              }}
              showsVerticalScrollIndicator={false}
            >
              {contentBlocks.map((block, i) =>
                block.type === "heading" ? (
                  <Text
                    key={i}
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#D4AF37",
                      marginTop: i === 0 ? 0 : 24,
                      marginBottom: 10,
                      lineHeight: 22,
                    }}
                  >
                    {block.text}
                  </Text>
                ) : (
                  <Text
                    key={i}
                    style={{
                      fontSize: 15,
                      lineHeight: 24,
                      color: "rgba(255,255,255,0.85)",
                      marginBottom: 16,
                    }}
                  >
                    {block.text}
                  </Text>
                )
              )}
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
