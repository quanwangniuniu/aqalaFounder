import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Platform, AppState, AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useAuth } from "./AuthContext";
import { subscribeToConversations, Conversation } from "@/lib/firebase/messages";

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface MessageNotificationContextType {
  unreadCount: number;
}

const MessageNotificationContext = createContext<MessageNotificationContextType>({
  unreadCount: 0,
});

export const useMessageNotifications = () => useContext(MessageNotificationContext);

interface Props {
  children: ReactNode;
}

export function MessageNotificationProvider({ children }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  // Track previous conversation state to detect new messages
  const prevConversationsRef = useRef<Map<string, { lastSenderId: string; unreadCount: number }>>(new Map());
  const initialLoadRef = useRef(true);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Request notification permissions on mount
  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus !== "granted") {
        await Notifications.requestPermissionsAsync();
      }

      // Set up notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("messages", {
          name: "Messages",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#D4AF37",
          sound: "default",
        });
      }
    })();
  }, []);

  // Handle notification tap — navigate to the conversation
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.userId) {
        router.push(`/messages/${data.userId}` as any);
      }
    });

    return () => subscription.remove();
  }, [router]);

  // Track app state for badge updates
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      appStateRef.current = nextState;
    });
    return () => subscription.remove();
  }, []);

  // Subscribe to conversations and detect new messages
  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(0);
      prevConversationsRef.current.clear();
      initialLoadRef.current = true;
      return;
    }

    const unsubscribe = subscribeToConversations(user.uid, async (conversations: Conversation[]) => {
      // Calculate total unread
      let total = 0;
      conversations.forEach((conv) => {
        total += conv.unreadCount?.[user.uid] || 0;
      });
      setUnreadCount(total);

      // Update app badge
      await Notifications.setBadgeCountAsync(total).catch(() => {});

      // Skip notification on initial load
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
        // Populate initial state
        const map = new Map<string, { lastSenderId: string; unreadCount: number }>();
        conversations.forEach((conv) => {
          map.set(conv.id, {
            lastSenderId: conv.lastSenderId,
            unreadCount: conv.unreadCount?.[user.uid] || 0,
          });
        });
        prevConversationsRef.current = map;
        return;
      }

      // Detect new incoming messages by comparing with previous state
      for (const conv of conversations) {
        const prevState = prevConversationsRef.current.get(conv.id);
        const currentUnread = conv.unreadCount?.[user.uid] || 0;

        // New message from someone else
        if (
          conv.lastSenderId &&
          conv.lastSenderId !== user.uid &&
          currentUnread > 0 &&
          (!prevState || currentUnread > prevState.unreadCount)
        ) {
          // Get sender info from participantInfo
          const senderInfo = conv.participantInfo?.[conv.lastSenderId];
          const senderName =
            senderInfo?.displayName ||
            (senderInfo?.username ? `@${senderInfo.username}` : "Someone");

          // Send local push notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Message from ${senderName}`,
              body: conv.lastMessage || "Sent you a message",
              data: { userId: conv.lastSenderId, conversationId: conv.id },
              sound: "default",
              ...(Platform.OS === "android" && { channelId: "messages" }),
            },
            trigger: null, // Immediate
          });
        }
      }

      // Update previous state
      const map = new Map<string, { lastSenderId: string; unreadCount: number }>();
      conversations.forEach((conv) => {
        map.set(conv.id, {
          lastSenderId: conv.lastSenderId,
          unreadCount: conv.unreadCount?.[user.uid] || 0,
        });
      });
      prevConversationsRef.current = map;
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return (
    <MessageNotificationContext.Provider value={{ unreadCount }}>
      {children}
    </MessageNotificationContext.Provider>
  );
}
