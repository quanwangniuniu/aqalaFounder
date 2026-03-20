import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useLanguage } from "@/contexts/LanguageContext";
import { apiFetch } from "@/utils/api";

interface EmailContent {
  subject: string;
  body: string;
  html?: string;
}

interface EmailModalProps {
  visible: boolean;
  onClose: () => void;
  content: EmailContent;
  userEmail?: string | null;
  accentColor?: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function EmailModal({
  visible,
  onClose,
  content,
  userEmail,
  accentColor = "#D4AF37",
  onSuccess,
  onError,
}: EmailModalProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setEmail(userEmail?.trim() || "");
      setInlineError(null);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible, userEmail]);

  const handleClose = () => {
    Keyboard.dismiss();
    setEmail("");
    setInlineError(null);
    onClose();
  };

  const handleSend = async () => {
    Keyboard.dismiss();
    setInlineError(null);

    if (!validateEmail(email)) {
      const msg = t("share.invalidEmail");
      setInlineError(msg);
      onError?.(msg);
      return;
    }

    setIsSending(true);
    try {
      const response = await apiFetch("/api/send-email", {
        method: "POST",
        body: JSON.stringify({
          to: email,
          subject: content.subject,
          body: content.body,
          html: content.html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || t("share.emailError");
        setInlineError(msg);
        onError?.(msg);
        return;
      }

      handleClose();
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.message || t("share.emailError");
      setInlineError(msg);
      onError?.(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "flex-end",
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View
              style={{
                backgroundColor: "#0a1f16",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                overflow: "hidden",
              }}
            >
              {/* Gold accent line */}
              <View
                style={{
                  height: 3,
                  backgroundColor: accentColor,
                  opacity: 0.6,
                }}
              />

              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: `${accentColor}1A`,
                      borderWidth: 1,
                      borderColor: `${accentColor}33`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="mail" size={18} color={accentColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: "600", color: "white" }}>
                      {t("share.emailTitle")}
                    </Text>
                    <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                      {t("share.emailSubtitle")}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  disabled={isSending}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={18} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                {/* Email input */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderWidth: 1,
                    borderColor: inlineError
                      ? "rgba(239,68,68,0.5)"
                      : email && validateEmail(email)
                        ? `${accentColor}50`
                        : "rgba(255,255,255,0.1)",
                    borderRadius: 14,
                    paddingHorizontal: 16,
                  }}
                >
                  <TextInput
                    ref={inputRef}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (inlineError) setInlineError(null);
                    }}
                    placeholder={t("share.emailPlaceholder")}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isSending}
                    returnKeyType="send"
                    onSubmitEditing={handleSend}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      fontSize: 15,
                      color: "white",
                    }}
                  />
                  {email && validateEmail(email) && (
                    <Ionicons name="checkmark-circle" size={20} color={accentColor} />
                  )}
                </View>

                {/* Preview hint */}
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.4)",
                    textAlign: "center",
                  }}
                >
                  {t("share.emailPreviewHint")}
                </Text>

                {/* Inline error */}
                {inlineError && (
                  <View
                    style={{
                      marginTop: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: "rgba(239,68,68,0.12)",
                      borderWidth: 1,
                      borderColor: "rgba(239,68,68,0.3)",
                    }}
                  >
                    <Ionicons name="close-circle" size={18} color="#ef4444" />
                    <Text style={{ flex: 1, fontSize: 13, color: "#fca5a5" }}>
                      {inlineError}
                    </Text>
                    <TouchableOpacity onPress={() => setInlineError(null)}>
                      <Ionicons name="close" size={16} color="#fca5a5" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Actions */}
                <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                  <TouchableOpacity
                    onPress={handleClose}
                    disabled={isSending}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isSending ? 0.5 : 1,
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>
                      {t("share.cancel")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={isSending || !email.trim()}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 14,
                      backgroundColor: accentColor,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: isSending || !email.trim() ? 0.5 : 1,
                    }}
                  >
                    {isSending ? (
                      <>
                        <ActivityIndicator size="small" color="#0a1f16" />
                        <Text style={{ fontSize: 15, fontWeight: "600", color: "#0a1f16" }}>
                          {t("share.sending")}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="send" size={16} color="#0a1f16" />
                        <Text style={{ fontSize: 15, fontWeight: "600", color: "#0a1f16" }}>
                          {t("share.send")}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}
