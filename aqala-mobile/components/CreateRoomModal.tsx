import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Switch,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { createRoom, CreateRoomOptions } from "@/lib/firebase/rooms";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface CreateRoomModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateRoomModal({ visible, onClose }: CreateRoomModalProps) {
  const { user, partnerInfo } = useAuth();
  const { getDarkestColor } = usePreferences();
  const darkBg = getDarkestColor();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [chatEnabled, setChatEnabled] = useState(true);
  const [donationsEnabled, setDonationsEnabled] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const isPartner = partnerInfo?.isPartner ?? false;

  const handleCreate = useCallback(async () => {
    if (!user) return;
    if (!name.trim()) {
      setError("Please enter a room name");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const options: CreateRoomOptions = {
        name: name.trim(),
        description: description.trim() || undefined,
        ownerId: user.uid,
        ownerName: user.displayName || user.email || "Anonymous",
        ownerPhoto: user.photoURL || undefined,
        isPartner,
        chatEnabled,
        donationsEnabled,
      };

      const room = await createRoom(options);
      handleClose();
      router.push(`/room/${room.id}` as any);
    } catch (err: any) {
      console.error("Failed to create room:", err);
      setError(err.message || "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  }, [user, name, description, isPartner, chatEnabled, donationsEnabled, router]);

  const handleClose = useCallback(() => {
    if (!isCreating) {
      setName("");
      setDescription("");
      setError("");
      onClose();
    }
  }, [isCreating, onClose]);

  const accentColor = isPartner ? "#D4AF37" : "#10b981";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      {/* Backdrop */}
      <Pressable
        onPress={handleClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.8)",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%", maxWidth: 400 }}
        >
          {/* Modal content — stop propagation so tapping inside doesn't close */}
          <Pressable onPress={() => {}}>
            <View
              style={{
                backgroundColor: darkBg,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 24,
                elevation: 20,
              }}
            >
              {/* Gold accent line */}
              <LinearGradient
                colors={isPartner ? ["#D4AF37", "#F0D78C", "#D4AF37"] : ["#10b981", "#34d399", "#10b981"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 3 }}
              />

              <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
                {/* Header */}
                <View style={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 }}>
                  {/* Close button */}
                  <TouchableOpacity
                    onPress={handleClose}
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "rgba(255,255,255,0.05)",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                    }}
                  >
                    <Ionicons name="close" size={18} color="rgba(255,255,255,0.4)" />
                  </TouchableOpacity>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: isPartner
                          ? "rgba(212,175,55,0.1)"
                          : "rgba(16,185,129,0.1)",
                        borderWidth: 1,
                        borderColor: isPartner
                          ? "rgba(212,175,55,0.2)"
                          : "rgba(16,185,129,0.2)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name={isPartner ? "business" : "people"}
                        size={28}
                        color={accentColor}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 20, fontWeight: "600", color: "white" }}>
                        {isPartner ? "Create Official Room" : "Create Community Room"}
                      </Text>
                      <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                        {isPartner ? "Partner broadcast room" : "Start a translation session"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Form */}
                <View style={{ paddingHorizontal: 24, paddingBottom: 24, gap: 20 }}>
                  {/* Room Name */}
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                      Room Name <Text style={{ color: "#ef4444" }}>*</Text>
                    </Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder={isPartner ? "e.g., Friday Khutbah" : "e.g., Study Circle"}
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      maxLength={50}
                      autoFocus
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        color: "white",
                        fontSize: 14,
                      }}
                    />
                  </View>

                  {/* Description */}
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                      Description{" "}
                      <Text style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</Text>
                    </Text>
                    <TextInput
                      value={description}
                      onChangeText={setDescription}
                      placeholder="What's this session about?"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      maxLength={200}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        color: "white",
                        fontSize: 14,
                        minHeight: 80,
                      }}
                    />
                  </View>

                  {/* Settings */}
                  <View style={{ gap: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>
                      Room Settings
                    </Text>

                    {/* Chat toggle */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 12,
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: 12,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            backgroundColor: "rgba(255,255,255,0.1)",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="chatbubble-outline" size={18} color="rgba(255,255,255,0.6)" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: "500", color: "white" }}>Live Chat</Text>
                          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                            Viewers can chat with each other
                          </Text>
                        </View>
                      </View>
                      <Switch
                        value={chatEnabled}
                        onValueChange={setChatEnabled}
                        trackColor={{ false: "rgba(255,255,255,0.2)", true: accentColor }}
                        thumbColor="white"
                      />
                    </View>

                    {/* Donations toggle */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 12,
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: 12,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            backgroundColor: "rgba(255,255,255,0.1)",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="heart-outline" size={18} color="rgba(255,255,255,0.6)" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: "500", color: "white" }}>Donations</Text>
                          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                            Allow viewers to support you
                          </Text>
                        </View>
                      </View>
                      <Switch
                        value={donationsEnabled}
                        onValueChange={setDonationsEnabled}
                        trackColor={{ false: "rgba(255,255,255,0.2)", true: accentColor }}
                        thumbColor="white"
                      />
                    </View>
                  </View>

                  {/* Error */}
                  {error !== "" && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        padding: 12,
                        backgroundColor: "rgba(239,68,68,0.1)",
                        borderWidth: 1,
                        borderColor: "rgba(239,68,68,0.2)",
                        borderRadius: 12,
                      }}
                    >
                      <Ionicons name="alert-circle" size={18} color="#ef4444" />
                      <Text style={{ fontSize: 14, color: "#f87171", flex: 1 }}>{error}</Text>
                    </View>
                  )}

                  {/* Actions */}
                  <View style={{ flexDirection: "row", gap: 12, paddingTop: 8 }}>
                    <TouchableOpacity
                      onPress={handleClose}
                      disabled={isCreating}
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: 12,
                        alignItems: "center",
                        opacity: isCreating ? 0.5 : 1,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "500", fontSize: 14 }}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleCreate}
                      disabled={isCreating || !name.trim()}
                      style={{ flex: 1, borderRadius: 12, overflow: "hidden", opacity: isCreating || !name.trim() ? 0.5 : 1 }}
                    >
                      <LinearGradient
                        colors={isPartner ? ["#D4AF37", "#C49B30"] : ["#10b981", "#059669"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          paddingVertical: 14,
                          paddingHorizontal: 16,
                        }}
                      >
                        {isCreating ? (
                          <>
                            <ActivityIndicator size="small" color={isPartner ? darkBg : "white"} />
                            <Text
                              style={{
                                fontWeight: "500",
                                fontSize: 14,
                                color: isPartner ? darkBg : "white",
                              }}
                            >
                              Creating...
                            </Text>
                          </>
                        ) : (
                          <>
                            <Ionicons name="add" size={18} color={isPartner ? darkBg : "white"} />
                            <Text
                              style={{
                                fontWeight: "500",
                                fontSize: 14,
                                color: isPartner ? darkBg : "white",
                              }}
                            >
                              Create Room
                            </Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
