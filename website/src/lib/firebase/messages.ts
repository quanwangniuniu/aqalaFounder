import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: Date;
  lastSenderId: string;
  unreadCount: { [userId: string]: number };
  participantInfo: {
    [userId: string]: {
      username: string | null;
      displayName: string | null;
      photoURL: string | null;
    };
  };
}

function ensureDb() {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
  return db;
}

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(
  userId1: string,
  userId2: string,
  user1Info: { username: string | null; displayName: string | null; photoURL: string | null },
  user2Info: { username: string | null; displayName: string | null; photoURL: string | null }
): Promise<string> {
  const firestore = ensureDb();
  const conversationsRef = collection(firestore, "conversations");
  
  // Check for existing conversation
  const q = query(
    conversationsRef,
    where("participants", "array-contains", userId1)
  );
  
  const snapshot = await getDocs(q);
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.participants.includes(userId2)) {
      return doc.id;
    }
  }
  
  // Create new conversation
  const newConversation = await addDoc(conversationsRef, {
    participants: [userId1, userId2],
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    lastSenderId: "",
    unreadCount: { [userId1]: 0, [userId2]: 0 },
    participantInfo: {
      [userId1]: user1Info,
      [userId2]: user2Info,
    },
  });
  
  return newConversation.id;
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<void> {
  const { filterProfanity } = await import("@/utils/profanityFilter");
  const firestore = ensureDb();
  
  const filteredText = filterProfanity(text);
  
  // Add message to messages subcollection
  const messagesRef = collection(firestore, "conversations", conversationId, "messages");
  await addDoc(messagesRef, {
    senderId,
    text: filteredText,
    createdAt: serverTimestamp(),
    read: false,
  });
  
  // Update conversation with last message
  const conversationRef = doc(firestore, "conversations", conversationId);
  const conversationSnap = await getDoc(conversationRef);
  
  if (conversationSnap.exists()) {
    const data = conversationSnap.data();
    const otherUserId = data.participants.find((p: string) => p !== senderId);
    
    await updateDoc(conversationRef, {
      lastMessage: filteredText,
      lastMessageAt: serverTimestamp(),
      lastSenderId: senderId,
      [`unreadCount.${otherUserId}`]: (data.unreadCount?.[otherUserId] || 0) + 1,
    });
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  const firestore = ensureDb();
  const conversationRef = doc(firestore, "conversations", conversationId);
  
  await updateDoc(conversationRef, {
    [`unreadCount.${userId}`]: 0,
  });
}

/**
 * Subscribe to messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const firestore = ensureDb();
  const messagesRef = collection(firestore, "conversations", conversationId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"), limit(100));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        conversationId,
        senderId: data.senderId,
        text: data.text,
        createdAt: data.createdAt?.toDate() || new Date(),
        read: data.read,
      };
    });
    callback(messages);
  });
}

/**
 * Subscribe to user's conversations
 */
export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const firestore = ensureDb();
  const conversationsRef = collection(firestore, "conversations");
  const q = query(
    conversationsRef,
    where("participants", "array-contains", userId),
    orderBy("lastMessageAt", "desc"),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        participants: data.participants,
        lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
        lastSenderId: data.lastSenderId,
        unreadCount: data.unreadCount || {},
        participantInfo: data.participantInfo || {},
      };
    });
    callback(conversations);
  });
}

/**
 * Get total unread message count for a user
 */
export function subscribeToUnreadCount(
  userId: string,
  callback: (count: number) => void
): () => void {
  const firestore = ensureDb();
  const conversationsRef = collection(firestore, "conversations");
  const q = query(conversationsRef, where("participants", "array-contains", userId));
  
  return onSnapshot(q, (snapshot) => {
    let total = 0;
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      total += data.unreadCount?.[userId] || 0;
    });
    callback(total);
  });
}
