import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToConversations, Conversation } from "@/lib/firebase/messages";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } else if (days > 0) {
    return `${days}d`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return "now";
  }
}

export default function MessagesScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [user, authLoading, router]);

  // Subscribe to conversations
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToConversations(user.uid, (convos) => {
      setConversations(convos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (authLoading || loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#032117" }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#032117" }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.05)",
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>Messages</Text>
        <TouchableOpacity>
          <Ionicons name="create-outline" size={24} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {/* Conversations List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
        {conversations.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 80, paddingHorizontal: 16 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "rgba(255,255,255,0.05)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="chatbubbles-outline" size={40} color="rgba(255,255,255,0.3)" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "white", marginBottom: 8 }}>
              No messages yet
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, textAlign: "center" }}>
              When you message someone, it'll show up here.
            </Text>
          </View>
        ) : (
          conversations.map((conversation) => {
            const otherUserId = conversation.participants.find((p) => p !== user.uid);
            const otherUser = otherUserId ? conversation.participantInfo[otherUserId] : null;
            const unread = conversation.unreadCount[user.uid] || 0;
            const isLastSender = conversation.lastSenderId === user.uid;
            const displayName = otherUser?.displayName || otherUser?.username || "User";

            return (
              <TouchableOpacity
                key={conversation.id}
                onPress={() => router.push(`/messages/${otherUserId}` as any)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(255,255,255,0.03)",
                }}
                activeOpacity={0.7}
              >
                {/* Avatar */}
                {otherUser?.photoURL ? (
                  <Image
                    source={{ uri: otherUser.photoURL }}
                    style={{ width: 52, height: 52, borderRadius: 26 }}
                  />
                ) : (
                  <LinearGradient
                    colors={["rgba(212,175,55,0.3)", "rgba(212,175,55,0.1)"]}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#D4AF37", fontWeight: "600", fontSize: 18 }}>
                      {displayName[0].toUpperCase()}
                    </Text>
                  </LinearGradient>
                )}

                {/* Content */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <Text
                      style={{
                        fontWeight: unread > 0 ? "600" : "500",
                        fontSize: 14,
                        color: unread > 0 ? "white" : "rgba(255,255,255,0.9)",
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>
                    <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
                      {formatTime(conversation.lastMessageAt)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: unread > 0 ? "white" : "rgba(255,255,255,0.5)",
                      fontWeight: unread > 0 ? "500" : "400",
                    }}
                    numberOfLines={1}
                  >
                    {isLastSender && "You: "}
                    {conversation.lastMessage || "Start a conversation"}
                  </Text>
                </View>

                {/* Unread badge */}
                {unread > 0 && (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: "#D4AF37",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "600", color: "#021a12" }}>
                      {unread > 99 ? "99+" : unread}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
