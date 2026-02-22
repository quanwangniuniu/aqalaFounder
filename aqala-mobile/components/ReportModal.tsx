import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  submitReport,
  REPORT_REASONS,
  ReportReason,
  ReportTargetType,
} from "@/lib/firebase/moderation";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  targetUserId: string;
  targetLabel?: string;
}

export default function ReportModal({
  visible,
  onClose,
  reporterId,
  targetType,
  targetId,
  targetUserId,
  targetLabel,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason) {
      setError("Please select a reason.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitReport({
        reporterId,
        targetType,
        targetId,
        targetUserId,
        reason,
        description: description.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason(null);
    setDescription("");
    setSubmitted(false);
    setError(null);
    onClose();
  };

  const typeLabel =
    targetType === "user" ? "User" : targetType === "message" ? "Message" : "Room";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={handleClose}
          />

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
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingTop: 20,
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
                  backgroundColor: "rgba(248,113,113,0.1)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="flag" size={20} color="#f87171" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>
                  Report {typeLabel}
                </Text>
                {targetLabel && (
                  <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                    {targetLabel}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={handleClose}
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

            {submitted ? (
              <View style={{ paddingHorizontal: 20, paddingVertical: 40, alignItems: "center" }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "rgba(34,197,94,0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={36} color="#22c55e" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: "600", color: "white", marginBottom: 8 }}>
                  Report Submitted
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.6)",
                    textAlign: "center",
                    lineHeight: 20,
                    marginBottom: 24,
                  }}
                >
                  Thank you for helping keep Aqala safe. Our team will review your report and take
                  appropriate action.
                </Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={{
                    width: "100%",
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ScrollView
                  style={{ maxHeight: 350 }}
                  contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 8 }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 8,
                    }}
                  >
                    Why are you reporting this?
                  </Text>

                  {REPORT_REASONS.map((r) => (
                    <TouchableOpacity
                      key={r.value}
                      onPress={() => {
                        setReason(r.value);
                        setError(null);
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor:
                          reason === r.value
                            ? "rgba(248,113,113,0.1)"
                            : "rgba(255,255,255,0.05)",
                        borderWidth: 1,
                        borderColor:
                          reason === r.value
                            ? "rgba(248,113,113,0.3)"
                            : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: reason === r.value ? "white" : "rgba(255,255,255,0.7)",
                        }}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {reason && (
                    <View style={{ marginTop: 8 }}>
                      <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Add any additional details (optional)..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        multiline
                        maxLength={500}
                        style={{
                          backgroundColor: "rgba(255,255,255,0.05)",
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.1)",
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          color: "white",
                          fontSize: 14,
                          minHeight: 80,
                          textAlignVertical: "top",
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.3)",
                          textAlign: "right",
                          marginTop: 4,
                        }}
                      >
                        {description.length}/500
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {error && (
                  <View style={{ paddingHorizontal: 20 }}>
                    <View
                      style={{
                        backgroundColor: "rgba(248,113,113,0.1)",
                        borderWidth: 1,
                        borderColor: "rgba(248,113,113,0.2)",
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                      }}
                    >
                      <Text style={{ fontSize: 13, color: "#f87171" }}>{error}</Text>
                    </View>
                  </View>
                )}

                <View
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderTopWidth: 1,
                    borderTopColor: "rgba(255,255,255,0.05)",
                    paddingBottom: Platform.OS === "ios" ? 34 : 16,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={submitting || !reason}
                    style={{
                      width: "100%",
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: reason ? "rgba(248,113,113,0.8)" : "rgba(248,113,113,0.3)",
                      alignItems: "center",
                      opacity: submitting ? 0.6 : 1,
                    }}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
                        Submit Report
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
