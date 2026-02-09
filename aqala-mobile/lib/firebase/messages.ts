import {
  collection, doc, addDoc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot, serverTimestamp, updateDoc,
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
    [userId: string]: { username: string | null; displayName: string | null; photoURL: string | null };
  };
}

export async function getOrCreateConversation(
  userId1: string, userId2: string,
  user1Info: { username: string | null; displayName: string | null; photoURL: string | null },
  user2Info: { username: string | null; displayName: string | null; photoURL: string | null }
): Promise<string> {
  const conversationsRef = collection(db, "conversations");
  const q = query(conversationsRef, where("participants", "array-contains", userId1));
  const snapshot = await getDocs(q);

  for (const d of snapshot.docs) {
    const data = d.data();
    if (data.participants.includes(userId2)) return d.id;
  }

  const newConversation = await addDoc(conversationsRef, {
    participants: [userId1, userId2], lastMessage: "", lastMessageAt: serverTimestamp(),
    lastSenderId: "", unreadCount: { [userId1]: 0, [userId2]: 0 },
    participantInfo: { [userId1]: user1Info, [userId2]: user2Info },
  });
  return newConversation.id;
}

export async function sendMessage(conversationId: string, senderId: string, text: string): Promise<void> {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  await addDoc(messagesRef, { senderId, text, createdAt: serverTimestamp(), read: false });

  const conversationRef = doc(db, "conversations", conversationId);
  const conversationSnap = await getDoc(conversationRef);

  if (conversationSnap.exists()) {
    const data = conversationSnap.data();
    const otherUserId = data.participants.find((p: string) => p !== senderId);
    await updateDoc(conversationRef, {
      lastMessage: text, lastMessageAt: serverTimestamp(), lastSenderId: senderId,
      [`unreadCount.${otherUserId}`]: (data.unreadCount?.[otherUserId] || 0) + 1,
    });
  }
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, "conversations", conversationId), { [`unreadCount.${userId}`]: 0 });
}

export function subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): () => void {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"), limit(100));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => {
      const data = d.data();
      return { id: d.id, conversationId, senderId: data.senderId, text: data.text, createdAt: data.createdAt?.toDate() || new Date(), read: data.read };
    });
    callback(messages);
  });
}

export function subscribeToConversations(userId: string, callback: (conversations: Conversation[]) => void): () => void {
  const conversationsRef = collection(db, "conversations");
  const q = query(conversationsRef, where("participants", "array-contains", userId), orderBy("lastMessageAt", "desc"), limit(50));
  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id, participants: data.participants, lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt?.toDate() || new Date(), lastSenderId: data.lastSenderId,
        unreadCount: data.unreadCount || {}, participantInfo: data.participantInfo || {},
      };
    });
    callback(conversations);
  });
}

export function subscribeToUnreadCount(userId: string, callback: (count: number) => void): () => void {
  const q = query(collection(db, "conversations"), where("participants", "array-contains", userId));
  return onSnapshot(q, (snapshot) => {
    let total = 0;
    snapshot.docs.forEach((d) => { total += d.data().unreadCount?.[userId] || 0; });
    callback(total);
  });
}
