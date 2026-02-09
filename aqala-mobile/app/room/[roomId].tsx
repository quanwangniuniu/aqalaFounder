import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import WallpaperBackground from "@/components/WallpaperBackground";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useRooms } from "@/contexts/RoomsContext";
import {
  subscribeRoomMembers,
  RoomMember,
  getRoom,
  Room,
  leaveRoom,
} from "@/lib/firebase/rooms";
import {
  subscribeChatMessages,
  sendChatMessage,
  ChatMessage,
} from "@/lib/firebase/rooms";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import { auth } from "@/lib/firebase/config";

const WEB_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_WEB_URL ||
  process.env.EXPO_PUBLIC_WEB_URL ||
  "";

export default function RoomDetailScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const { user, partnerInfo } = useAuth();
  const { getDarkestColor } = usePreferences();
  const darkBg = getDarkestColor();
  const {
    rooms,
    joinRoom: contextJoinRoom,
    claimLeadReciter,
    validateAndCleanTranslator,
    releaseTranslator,
  } = useRooms();

  const roomFromContext = useMemo(
    () => rooms.find((r) => r.id === roomId),
    [rooms, roomId]
  );
  const [directRoom, setDirectRoom] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);

  const room = roomFromContext || directRoom;

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [role, setRole] = useState<"translator" | "listener" | null>(null);
  const [joined, setJoined] = useState(false);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const chatListRef = useRef<FlatList>(null);

  // Cleanup: leave room on unmount
  useEffect(() => {
    if (!roomId || !user) return;
    return () => {
      leaveRoom(roomId, user.uid);
    };
  }, [roomId, user]);

  // Reset state when roomId changes
  useEffect(() => {
    setMessage(null);
    setJoined(false);
    setRole(null);
    setMembers([]);
    setDirectRoom(null);
  }, [roomId]);

  // Fetch room directly if not in context
  useEffect(() => {
    if (!roomFromContext && roomId && !roomLoading) {
      setRoomLoading(true);
      getRoom(roomId)
        .then((fetched) => {
          setDirectRoom(fetched);
          setRoomLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching room:", err);
          setRoomLoading(false);
        });
    } else if (roomFromContext) {
      setDirectRoom(null);
      setRoomLoading(false);
    }
  }, [roomFromContext, roomId]);

  // Get auth token for WebView
  useEffect(() => {
    if (!auth.currentUser) return;
    auth.currentUser.getIdToken().then(setAuthToken).catch(console.error);
  }, [user]);

  // Check if activeTranslatorId is valid
  const validTranslatorId = useMemo(() => {
    if (!room?.activeTranslatorId) return null;
    if (!user) return room.activeTranslatorId;
    const translatorMember = members.find(
      (m) => m.userId === room.activeTranslatorId
    );
    return translatorMember ? room.activeTranslatorId : null;
  }, [room?.activeTranslatorId, members, user]);

  const isTranslator =
    user && (validTranslatorId === user.uid || role === "translator");
  const canTranslate = !!user && !!isTranslator;

  const isBroadcastRoom = room?.isBroadcast === true;
  const isPartnerRoom = room?.roomType === "partner" || isBroadcastRoom;
  const isPartnerOfRoom = user && room?.partnerId === user.uid;
  const isRoomOwner = user && room?.ownerId === user.uid;
  const canClaimReciter = isRoomOwner || isPartnerOfRoom;
  const isLive = !!validTranslatorId;

  const viewerCount = room?.memberCount || members.length || 0;

  // Subscribe to members
  useEffect(() => {
    if (!roomId) {
      setMembers([]);
      return;
    }
    const unsubscribe = subscribeRoomMembers(
      roomId,
      (incoming) => {
        setMembers(incoming);
        if (user) {
          validateAndCleanTranslator(roomId).catch(() => {});
        }
      },
      (err) => {
        if (
          err?.code === "permission-denied" ||
          err?.message?.includes("permission")
        ) {
          setMembers([]);
          return;
        }
        console.error("Error loading members:", err);
      }
    );
    return () => unsubscribe();
  }, [roomId, user, validateAndCleanTranslator]);

  // Auto-join on load
  const joinInProgressRef = useRef(false);
  useEffect(() => {
    let isMounted = true;

    const join = async () => {
      if (!user || !room || joined || joinInProgressRef.current) return;

      joinInProgressRef.current = true;
      setBusy(true);
      try {
        await contextJoinRoom(roomId, false);
        if (isMounted) {
          setRole("listener");
          setJoined(true);
        }
      } catch (err: any) {
        if (
          err?.code === "already-exists" ||
          err?.message?.includes("already-exists")
        ) {
          if (isMounted) {
            setRole("listener");
            setJoined(true);
          }
        } else if (isMounted) {
          setMessage(err?.message || "Failed to join this room.");
        }
      } finally {
        if (isMounted) setBusy(false);
        joinInProgressRef.current = false;
      }
    };

    void join();
    return () => {
      isMounted = false;
      joinInProgressRef.current = false;
    };
  }, [user, room, roomId, contextJoinRoom, joined]);

  // Subscribe to chat messages
  useEffect(() => {
    if (!roomId || !room?.chatEnabled) return;
    const unsubscribe = subscribeChatMessages(roomId, (msgs) => {
      setChatMessages(msgs);
    });
    return () => unsubscribe();
  }, [roomId, room?.chatEnabled]);

  // Handle become lead reciter
  const handleClaimReciter = useCallback(async () => {
    try {
      await claimLeadReciter(roomId);
      setRole("translator");
    } catch (err: any) {
      setMessage(err?.message || "Failed to become lead reciter");
    }
  }, [roomId, claimLeadReciter]);

  // Handle release translator
  const handleReleaseTranslator = useCallback(async () => {
    try {
      await releaseTranslator(roomId);
      setRole("listener");
    } catch (err: any) {
      setMessage(err?.message || "Failed to release translator role");
    }
  }, [roomId, releaseTranslator]);

  // Send chat
  const handleSendChat = useCallback(async () => {
    if (!chatInput.trim() || !user || chatSending) return;
    setChatSending(true);
    const text = chatInput.trim();
    setChatInput("");
    try {
      await sendChatMessage(roomId, user.uid, user.displayName || "Anonymous", text, user.photoURL || undefined);
    } catch (err) {
      console.error("Failed to send chat:", err);
      setChatInput(text);
    } finally {
      setChatSending(false);
    }
  }, [roomId, user, chatInput, chatSending]);

  // --- Loading ---
  if (roomLoading || (!room && !roomFromContext)) {
    return (
      <WallpaperBackground edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginTop: 16 }}>Loading room...</Text>
        </View>
      </WallpaperBackground>
    );
  }

  // --- Not found ---
  if (!room) {
    return (
      <WallpaperBackground edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "rgba(255,255,255,0.05)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="alert-circle-outline" size={32} color="rgba(255,255,255,0.3)" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "white", marginBottom: 8 }}>
            Room not found
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>
            This room doesn't exist or has been deleted.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 12,
            }}
          >
            <Ionicons name="arrow-back" size={16} color="white" />
            <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>Back to rooms</Text>
          </TouchableOpacity>
        </View>
      </WallpaperBackground>
    );
  }

  // --- Chat overlay ---
  if (showChat && room.chatEnabled) {
    return (
      <WallpaperBackground edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Chat Header */}
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="chatbubble-outline" size={16} color="rgba(255,255,255,0.5)" />
              <Text style={{ fontWeight: "600", color: "white", fontSize: 16 }}>Live Chat</Text>
            </View>
            <TouchableOpacity onPress={() => setShowChat(false)} style={{ padding: 8 }}>
              <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          <FlatList
            ref={chatListRef}
            data={chatMessages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            onContentSizeChange={() => chatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 48 }}>
                <Ionicons name="chatbubbles-outline" size={32} color="rgba(255,255,255,0.2)" />
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 8 }}>No messages yet</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <Text style={{ fontWeight: "600", fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                    {item.userName || "Anonymous"}
                  </Text>
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 20 }}>
                  {item.text}
                </Text>
              </View>
            )}
          />

          {/* Chat Input */}
          {user ? (
            <View
              style={{
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
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Say something..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  color: "white",
                  fontSize: 14,
                }}
                returnKeyType="send"
                onSubmitEditing={handleSendChat}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                onPress={handleSendChat}
                disabled={!chatInput.trim() || chatSending}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#D4AF37",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: !chatInput.trim() || chatSending ? 0.5 : 1,
                }}
              >
                <Ionicons name="send" size={16} color={darkBg} />
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                padding: 16,
                borderTopWidth: 1,
                borderTopColor: "rgba(255,255,255,0.05)",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                Sign in to chat
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </WallpaperBackground>
    );
  }

  // --- Main Room View ---
  return (
    <WallpaperBackground edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexShrink: 0,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.05)",
          backgroundColor: "rgba(0,0,0,0.2)",
          gap: 12,
        }}
      >
        {/* Left: Back + Room info */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: "rgba(255,255,255,0.05)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={16} color="white" />
          </TouchableOpacity>

          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontWeight: "600", color: "white", fontSize: 15 }} numberOfLines={1}>
                {room.partnerName || room.name}
              </Text>
              {isPartnerRoom && (
                <View
                  style={{
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    backgroundColor: "rgba(212,175,55,0.2)",
                    borderWidth: 1,
                    borderColor: "rgba(212,175,55,0.2)",
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: "700", color: "#D4AF37" }}>OFFICIAL</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Ionicons name="eye-outline" size={10} color="rgba(255,255,255,0.4)" />
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                {viewerCount} watching
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Status + Chat */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {isLive && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: "rgba(239,68,68,0.2)",
                borderWidth: 1,
                borderColor: "rgba(239,68,68,0.2)",
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#ef4444" }} />
              <Text style={{ fontSize: 10, fontWeight: "700", color: "#f87171" }}>LIVE</Text>
            </View>
          )}

          {room.chatEnabled && (
            <TouchableOpacity
              onPress={() => setShowChat(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <Ionicons name="chatbubble-outline" size={16} color="rgba(255,255,255,0.5)" />
              <Text style={{ fontSize: 12, fontWeight: "500", color: "rgba(255,255,255,0.5)" }}>Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {canTranslate ? (
          // Translator view — WebView to the listen/translate page
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: "rgba(16,185,129,0.05)",
                borderBottomWidth: 1,
                borderBottomColor: "rgba(16,185,129,0.2)",
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#10b981" }} />
              <Text style={{ fontSize: 13, color: "#34d399", fontWeight: "500" }}>
                Broadcasting as Lead Reciter
              </Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                onPress={handleReleaseTranslator}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: "rgba(239,68,68,0.1)",
                  borderWidth: 1,
                  borderColor: "rgba(239,68,68,0.2)",
                }}
              >
                <Text style={{ fontSize: 12, color: "#f87171", fontWeight: "500" }}>Stop</Text>
              </TouchableOpacity>
            </View>
            {WEB_URL && authToken ? (
              <WebView
                source={{
                  uri: `${WEB_URL}/listen`,
                  headers: { "Cache-Control": "no-cache" },
                }}
                injectedJavaScriptBeforePageLoaded={`
                  try {
                    window.localStorage.setItem('firebase_auth_token', '${authToken}');
                  } catch(e) {}
                  true;
                `}
                injectedJavaScript={`
                  (function() {
                    var style = document.createElement('style');
                    style.textContent = 'header, nav { display: none !important; }';
                    document.head.appendChild(style);
                  })();
                  true;
                `}
                style={{ flex: 1 }}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                mediaCapturePermissionGrantType="grant"
                mediaPlaybackRequiresUserAction={false}
              />
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="small" color="#D4AF37" />
              </View>
            )}
          </View>
        ) : isLive ? (
          // Listener view — WebView showing the live translation
          <View style={{ flex: 1 }}>
            {WEB_URL ? (
              <WebView
                source={{
                  uri: `${WEB_URL}/rooms/${roomId}`,
                  headers: { "Cache-Control": "no-cache" },
                }}
                injectedJavaScriptBeforePageLoaded={
                  authToken
                    ? `
                  try {
                    window.localStorage.setItem('firebase_auth_token', '${authToken}');
                  } catch(e) {}
                  true;
                `
                    : "true;"
                }
                injectedJavaScript={`
                  (function() {
                    var style = document.createElement('style');
                    style.textContent = 'header, nav, .room-header { display: none !important; } body { padding-top: 0 !important; }';
                    document.head.appendChild(style);
                  })();
                  true;
                `}
                style={{ flex: 1 }}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                mediaCapturePermissionGrantType="grant"
                mediaPlaybackRequiresUserAction={false}
              />
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                  Unable to load live stream
                </Text>
              </View>
            )}
          </View>
        ) : (
          // Waiting state — no active translator
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: "rgba(255,255,255,0.04)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 32,
              }}
            >
              <Ionicons name="mic-outline" size={40} color="rgba(255,255,255,0.2)" />
            </View>

            <Text style={{ fontSize: 18, fontWeight: "500", color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
              Waiting for session to start
            </Text>

            {canClaimReciter && user ? (
              <>
                <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>
                  Tap below to start translating
                </Text>
                <TouchableOpacity onPress={handleClaimReciter} style={{ borderRadius: 12, overflow: "hidden" }}>
                  <LinearGradient
                    colors={["#D4AF37", "#B8963A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      paddingHorizontal: 24,
                      paddingVertical: 14,
                    }}
                  >
                    <Ionicons name="mic" size={18} color={darkBg} />
                    <Text style={{ fontWeight: "600", fontSize: 15, color: darkBg }}>
                      Start Session
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : !user ? (
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
                Sign in to become the lead reciter
              </Text>
            ) : (
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
                The room owner will start the session
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Message banner */}
      {message && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: "rgba(245,158,11,0.1)",
            borderTopWidth: 1,
            borderTopColor: "rgba(245,158,11,0.2)",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
            <Ionicons name="alert-circle" size={14} color="#f59e0b" />
            <Text style={{ color: "#fbbf24", fontSize: 13, flex: 1 }}>{message}</Text>
          </View>
          <TouchableOpacity onPress={() => setMessage(null)} style={{ padding: 4 }}>
            <Ionicons name="close" size={14} color="#fbbf24" />
          </TouchableOpacity>
        </View>
      )}
    </WallpaperBackground>
  );
}
