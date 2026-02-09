import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, UserProfile } from "@/lib/firebase/users";
import {
  getOrCreateConversation,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
  Message,
} from "@/lib/firebase/messages";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function ConversationScreen() {
  const { userId: otherUserId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();

  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/auth/login");
    }
  }, [currentUser, authLoading, router]);

  // Load other user and create/get conversation
  useEffect(() => {
    if (!currentUser || !otherUserId) return;

    const init = async () => {
      try {
        const profile = await getUserProfile(otherUserId);
        if (!profile) {
          router.replace("/messages");
          return;
        }
        setOtherUser(profile);

        const currentProfile = await getUserProfile(currentUser.uid);

        const convId = await getOrCreateConversation(
          currentUser.uid,
          otherUserId,
          {
            username: currentProfile?.username || null,
            displayName: currentProfile?.displayName || currentUser.displayName,
            photoURL: currentProfile?.photoURL || currentUser.photoURL,
          },
          {
            username: profile.username,
            displayName: profile.displayName,
            photoURL: profile.photoURL,
          }
        );
        setConversationId(convId);
      } catch (error) {
        console.error("Failed to initialize conversation:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [currentUser, otherUserId, router]);

  // Subscribe to messages
  useEffect(() => {
    if (!conversationId || !currentUser) return;

    const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      setTimeout(scrollToBottom, 150);
    });

    markMessagesAsRead(conversationId, currentUser.uid);

    return () => unsubscribe();
  }, [conversationId, currentUser, scrollToBottom]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId || !currentUser || sending) return;

    setSending(true);
    const text = newMessage.trim();
    setNewMessage("");

    try {
      await sendMessage(conversationId, currentUser.uid, text);
    } catch (error) {
      console.error("Failed to send message:", error);
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#032117" }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser || !otherUser) return null;

  const displayName = otherUser.displayName || otherUser.username || "User";

  const renderMessage = ({ item: message, index }: { item: Message; index: number }) => {
    const isOwn = message.senderId === currentUser.uid;
    const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.senderId !== message.senderId);

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 8,
          justifyContent: isOwn ? "flex-end" : "flex-start",
          marginBottom: 6,
          paddingHorizontal: 16,
        }}
      >
        {/* Other user avatar */}
        {!isOwn && showAvatar && (
          <View style={{ width: 28, height: 28, flexShrink: 0 }}>
            {otherUser.photoURL ? (
              <Image
                source={{ uri: otherUser.photoURL }}
                style={{ width: 28, height: 28, borderRadius: 14 }}
              />
            ) : (
              <LinearGradient
                colors={["rgba(212,175,55,0.3)", "rgba(212,175,55,0.1)"]}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#D4AF37", fontSize: 11, fontWeight: "600" }}>
                  {displayName[0].toUpperCase()}
                </Text>
              </LinearGradient>
            )}
          </View>
        )}
        {!isOwn && !showAvatar && <View style={{ width: 28 }} />}

        {/* Message bubble */}
        <View
          style={{
            maxWidth: "75%",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
            ...(isOwn
              ? {
                  backgroundColor: "#D4AF37",
                  borderBottomRightRadius: 6,
                }
              : {
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderBottomLeftRadius: 6,
                }),
          }}
        >
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: isOwn ? "#021a12" : "white",
            }}
          >
            {message.text}
          </Text>
        </View>
      </View>
    );
  };

  const EmptyConversation = () => (
    <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 16 }}>
      {/* Avatar */}
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        {otherUser.photoURL ? (
          <Image
            source={{ uri: otherUser.photoURL }}
            style={{ width: 80, height: 80, borderRadius: 40 }}
          />
        ) : (
          <LinearGradient
            colors={["rgba(212,175,55,0.3)", "rgba(212,175,55,0.1)"]}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "700", color: "#D4AF37" }}>
              {displayName[0].toUpperCase()}
            </Text>
          </LinearGradient>
        )}
      </View>
      <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>{displayName}</Text>
      {otherUser.username && (
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 }}>
          @{otherUser.username}
        </Text>
      )}
      <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 8 }}>
        Start a conversation
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#032117" }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          style={{
            flexShrink: 0,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255,255,255,0.05)",
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push(`/user/${otherUserId}` as any)}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}
            activeOpacity={0.7}
          >
            {otherUser.photoURL ? (
              <Image
                source={{ uri: otherUser.photoURL }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            ) : (
              <LinearGradient
                colors={["rgba(212,175,55,0.3)", "rgba(212,175,55,0.1)"]}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#D4AF37", fontWeight: "600", fontSize: 14 }}>
                  {displayName[0].toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontWeight: "600", fontSize: 14, color: "white" }} numberOfLines={1}>
                {displayName}
              </Text>
              {otherUser.username && (
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }} numberOfLines={1}>
                  @{otherUser.username}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{ padding: 8 }}>
            <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
          ListEmptyComponent={EmptyConversation}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />

        {/* Input */}
        <View
          style={{
            flexShrink: 0,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.05)",
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        >
          <TextInput
            ref={inputRef}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Message..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              borderRadius: 24,
              paddingHorizontal: 16,
              paddingVertical: 10,
              color: "white",
              fontSize: 14,
            }}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#D4AF37",
              alignItems: "center",
              justifyContent: "center",
              opacity: !newMessage.trim() || sending ? 0.5 : 1,
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#021a12" />
            ) : (
              <Ionicons name="send" size={18} color="#021a12" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
