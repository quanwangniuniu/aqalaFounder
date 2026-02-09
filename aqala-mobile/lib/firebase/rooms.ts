import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config";

const COLLECTION = "mosques";

export type RoomType = "partner" | "community";

export type Room = {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName?: string;
  ownerPhoto?: string;
  activeTranslatorId: string | null;
  createdAt: Date | null;
  memberCount: number;
  viewerCount?: number;
  isActive: boolean;
  roomType: RoomType;
  isBroadcast: boolean;
  partnerId: string | null;
  partnerName: string | null;
  broadcastStartedAt: Date | null;
  lastBroadcastAt: Date | null;
  chatEnabled?: boolean;
  donationsEnabled?: boolean;
};

export type ChatMessage = {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  isAdmin?: boolean;
  isPartner?: boolean;
  isPremium?: boolean;
  isDonation?: boolean;
  donationAmount?: number;
  createdAt: Date | null;
};

export type RoomMemberRole = "translator" | "listener";

export type RoomMember = {
  userId: string;
  role: RoomMemberRole;
  joinedAt: Date | null;
  email?: string | null;
};

export interface CreateRoomOptions {
  name: string;
  description?: string;
  ownerId: string;
  ownerName?: string;
  ownerPhoto?: string;
  isPartner?: boolean;
  chatEnabled?: boolean;
  donationsEnabled?: boolean;
}

function mapRoomData(id: string, data: any): Room {
  return {
    id,
    name: data.name,
    description: data.description || undefined,
    ownerId: data.ownerId,
    ownerName: data.ownerName || undefined,
    ownerPhoto: data.ownerPhoto || undefined,
    activeTranslatorId: data.activeTranslatorId || null,
    createdAt: data.createdAt?.toDate?.() ?? null,
    memberCount: data.memberCount ?? 0,
    viewerCount: data.viewerCount ?? 0,
    isActive: data.isActive ?? true,
    roomType: data.roomType || (data.isBroadcast ? "partner" : "community"),
    isBroadcast: data.isBroadcast ?? false,
    partnerId: data.partnerId || null,
    partnerName: data.partnerName || null,
    broadcastStartedAt: data.broadcastStartedAt?.toDate?.() ?? null,
    lastBroadcastAt: data.lastBroadcastAt?.toDate?.() ?? null,
    chatEnabled: data.chatEnabled ?? true,
    donationsEnabled: data.donationsEnabled ?? true,
  };
}

export async function createRoom(options: CreateRoomOptions): Promise<Room> {
  const {
    name, description, ownerId, ownerName, ownerPhoto,
    isPartner = false, chatEnabled = true, donationsEnabled = true,
  } = options;

  const roomType: RoomType = isPartner ? "partner" : "community";
  const roomRef = await addDoc(collection(db, COLLECTION), {
    name: name.trim() || "Untitled Room",
    description: description?.trim() || null,
    ownerId, ownerName: ownerName || null, ownerPhoto: ownerPhoto || null,
    activeTranslatorId: null, createdAt: serverTimestamp(),
    memberCount: 1, viewerCount: 0, isActive: true, roomType,
    isBroadcast: isPartner, partnerId: isPartner ? ownerId : null,
    partnerName: isPartner ? (ownerName || name) : null,
    broadcastStartedAt: null, chatEnabled, donationsEnabled,
  });

  await setDoc(doc(db, COLLECTION, roomRef.id, "members", ownerId), {
    userId: ownerId, userName: ownerName || null, userPhoto: ownerPhoto || null,
    role: "listener", joinedAt: serverTimestamp(), email: null,
  });

  return {
    id: roomRef.id, name, description, ownerId, ownerName, ownerPhoto,
    activeTranslatorId: null, createdAt: new Date(), memberCount: 1,
    viewerCount: 0, isActive: true, roomType, isBroadcast: isPartner,
    partnerId: isPartner ? ownerId : null,
    partnerName: isPartner ? (ownerName || name) : null,
    broadcastStartedAt: null, lastBroadcastAt: null, chatEnabled, donationsEnabled,
  };
}

export async function deleteRoom(roomId: string, requesterId: string): Promise<void> {
  const roomDoc = await getDoc(doc(db, COLLECTION, roomId));
  if (!roomDoc.exists()) throw new Error("Room not found");
  const data = roomDoc.data() as any;
  if (data.ownerId !== requesterId) throw new Error("Only the room owner can delete this room");
  await deleteDoc(doc(db, COLLECTION, roomId));
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const roomDoc = await getDoc(doc(db, COLLECTION, roomId));
  if (!roomDoc.exists()) return null;
  return mapRoomData(roomDoc.id, roomDoc.data());
}

export function subscribeRooms(onRooms: (rooms: Room[]) => void, onError?: (err: any) => void) {
  const roomsQuery = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(
    roomsQuery,
    (snapshot) => {
      const rooms: Room[] = snapshot.docs.map((d) => mapRoomData(d.id, d.data()));
      onRooms(rooms);
    },
    (err) => onError?.(err)
  );
}

export async function joinRoom(roomId: string, userId: string, asTranslator = false, email?: string | null): Promise<void> {
  const memberRef = doc(db, COLLECTION, roomId, "members", userId);
  const memberSnap = await getDoc(memberRef);
  const alreadyMember = memberSnap.exists();

  if (alreadyMember && !asTranslator) return;

  await runTransaction(db, async (tx) => {
    const roomRef = doc(db, COLLECTION, roomId);
    const roomSnap = await tx.get(roomRef);
    if (!roomSnap.exists()) throw new Error("Room not found");
    const roomData = roomSnap.data() as any;
    if (!roomData.isActive) throw new Error("Room is inactive");

    const memberRefInTx = doc(db, COLLECTION, roomId, "members", userId);
    const memberSnapInTx = await tx.get(memberRefInTx);
    const alreadyMemberInTx = memberSnapInTx.exists();

    const nextMemberCount = alreadyMemberInTx ? roomData.memberCount ?? 1 : (roomData.memberCount ?? 0) + 1;
    let nextActiveTranslator = roomData.activeTranslatorId || null;

    if (asTranslator) {
      if (roomData.activeTranslatorId && roomData.activeTranslatorId !== userId) {
        throw new Error("Translator already active in this room");
      }
      nextActiveTranslator = userId;
    }

    if (alreadyMemberInTx) {
      if (asTranslator) {
        const updateData: any = { role: "translator" };
        if (email !== undefined) updateData.email = email;
        tx.update(memberRefInTx, updateData);
      } else if (email !== undefined) {
        tx.update(memberRefInTx, { email });
      }
    } else {
      tx.set(memberRefInTx, {
        userId, role: asTranslator ? "translator" : "listener",
        joinedAt: serverTimestamp(), email: email || null,
      });
    }

    const memberCountChanged = !alreadyMemberInTx;
    const translatorChanged = nextActiveTranslator !== roomData.activeTranslatorId;

    if (memberCountChanged || translatorChanged) {
      tx.update(roomRef, { memberCount: nextMemberCount, activeTranslatorId: nextActiveTranslator });
    }
  });
}

export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  try {
    await runTransaction(db, async (tx) => {
      const roomRef = doc(db, COLLECTION, roomId);
      const memberRef = doc(db, COLLECTION, roomId, "members", userId);
      const [roomSnap, memberSnap] = await Promise.all([tx.get(roomRef), tx.get(memberRef)]);

      if (!roomSnap.exists() || !memberSnap.exists()) return;

      const roomData = roomSnap.data() as any;
      tx.delete(memberRef);

      const updates: any = { memberCount: Math.max(0, (roomData.memberCount || 0) - 1) };
      if (roomData.activeTranslatorId === userId) updates.activeTranslatorId = null;
      tx.update(roomRef, updates);
    });
  } catch (error) {
    console.error(`[LEAVE ROOM] Error:`, error);
  }
}

export async function setTranslator(roomId: string, userId: string): Promise<void> {
  await runTransaction(db, async (tx) => {
    const roomRef = doc(db, COLLECTION, roomId);
    const roomSnap = await tx.get(roomRef);
    if (!roomSnap.exists()) throw new Error("Room not found");
    const roomData = roomSnap.data() as any;
    if (roomData.activeTranslatorId && roomData.activeTranslatorId !== userId) {
      throw new Error("Another translator is active");
    }
    tx.update(roomRef, { activeTranslatorId: userId });
    tx.set(doc(db, COLLECTION, roomId, "members", userId),
      { userId, role: "translator", joinedAt: serverTimestamp() }, { merge: true });
  });
}

export async function clearTranslator(roomId: string, userId: string): Promise<void> {
  await runTransaction(db, async (tx) => {
    const roomRef = doc(db, COLLECTION, roomId);
    const roomSnap = await tx.get(roomRef);
    if (!roomSnap.exists()) return;
    const roomData = roomSnap.data() as any;
    if (roomData.activeTranslatorId !== userId) return;
    tx.update(roomRef, { activeTranslatorId: null });
    tx.set(doc(db, COLLECTION, roomId, "members", userId), { role: "listener" }, { merge: true });
  });
}

export function subscribeRoomMembers(
  roomId: string,
  onMembers: (members: RoomMember[]) => void,
  onError?: (err: any) => void
) {
  const membersQuery = query(collection(db, COLLECTION, roomId, "members"));
  return onSnapshot(
    membersQuery,
    (snapshot) => {
      const members: RoomMember[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        return { userId: data.userId || d.id, role: data.role || "listener", joinedAt: data.joinedAt?.toDate?.() ?? null, email: data.email || null };
      });
      onMembers(members);
    },
    (err) => onError?.(err)
  );
}

export async function validateAndCleanTranslator(roomId: string): Promise<boolean> {
  try {
    const roomRef = doc(db, COLLECTION, roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return false;
    const roomData = roomSnap.data() as any;
    const activeTranslatorId = roomData.activeTranslatorId;
    if (!activeTranslatorId) return false;

    const memberRef = doc(db, COLLECTION, roomId, "members", activeTranslatorId);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      await runTransaction(db, async (tx) => {
        const rSnap = await tx.get(roomRef);
        if (!rSnap.exists()) return;
        const d = rSnap.data() as any;
        if (d.activeTranslatorId === activeTranslatorId) tx.update(roomRef, { activeTranslatorId: null });
      });
      return true;
    }
    return false;
  } catch { return false; }
}

export async function claimLeadReciter(roomId: string, userId: string): Promise<void> {
  await runTransaction(db, async (tx) => {
    const roomRef = doc(db, COLLECTION, roomId);
    const roomSnap = await tx.get(roomRef);
    if (!roomSnap.exists()) throw new Error("Room not found");
    const roomData = roomSnap.data() as any;

    if (roomData.isBroadcast && roomData.partnerId !== userId) {
      throw new Error("This is a partner broadcast room.");
    }

    if (roomData.activeTranslatorId) {
      const cRef = doc(db, COLLECTION, roomId, "members", roomData.activeTranslatorId);
      const cSnap = await tx.get(cRef);
      if (cSnap.exists() && roomData.activeTranslatorId !== userId) {
        throw new Error("Another lead reciter is already active");
      }
    }

    const memberRef = doc(db, COLLECTION, roomId, "members", userId);
    const memberSnap = await tx.get(memberRef);
    if (!memberSnap.exists()) throw new Error("You must be a member");

    tx.update(roomRef, { activeTranslatorId: userId });
    tx.set(memberRef, { userId, role: "translator", joinedAt: serverTimestamp() }, { merge: true });
  });
}

export async function getOrCreatePartnerRoom(partnerId: string, partnerName: string, mosqueId: string): Promise<Room> {
  const roomRef = doc(db, COLLECTION, mosqueId);
  const roomSnap = await getDoc(roomRef);

  if (roomSnap.exists()) return mapRoomData(roomSnap.id, roomSnap.data());

  await setDoc(roomRef, {
    name: partnerName, description: null, ownerId: partnerId, ownerName: partnerName,
    ownerPhoto: null, activeTranslatorId: null, createdAt: serverTimestamp(),
    memberCount: 0, viewerCount: 0, isActive: true, roomType: "partner" as RoomType,
    isBroadcast: true, partnerId, partnerName, broadcastStartedAt: null,
    chatEnabled: true, donationsEnabled: true,
  });

  return {
    id: mosqueId, name: partnerName, ownerId: partnerId, ownerName: partnerName,
    activeTranslatorId: null, createdAt: new Date(), memberCount: 0, viewerCount: 0,
    isActive: true, roomType: "partner", isBroadcast: true, partnerId, partnerName,
    broadcastStartedAt: null, lastBroadcastAt: null, chatEnabled: true, donationsEnabled: true,
  };
}

export async function startPartnerBroadcast(roomId: string, partnerId: string): Promise<void> {
  await runTransaction(db, async (tx) => {
    const roomRef = doc(db, COLLECTION, roomId);
    const roomSnap = await tx.get(roomRef);
    if (!roomSnap.exists()) throw new Error("Room not found");
    const roomData = roomSnap.data() as any;
    if (roomData.partnerId !== partnerId) throw new Error("Not authorized");

    tx.set(doc(db, COLLECTION, roomId, "members", partnerId),
      { userId: partnerId, role: "translator", joinedAt: serverTimestamp() }, { merge: true });
    tx.update(roomRef, { activeTranslatorId: partnerId, broadcastStartedAt: serverTimestamp(), isActive: true });
  });
}

export async function stopPartnerBroadcast(roomId: string, partnerId: string): Promise<void> {
  await runTransaction(db, async (tx) => {
    const roomRef = doc(db, COLLECTION, roomId);
    const roomSnap = await tx.get(roomRef);
    if (!roomSnap.exists()) throw new Error("Room not found");
    const roomData = roomSnap.data() as any;
    if (roomData.partnerId !== partnerId) throw new Error("Not authorized");

    tx.set(doc(db, COLLECTION, roomId, "members", partnerId), { role: "listener" }, { merge: true });
    tx.update(roomRef, { activeTranslatorId: null, broadcastStartedAt: null });
  });
}

export function subscribeRoom(roomId: string, onRoom: (room: Room | null) => void, onError?: (err: any) => void) {
  const roomRef = doc(db, COLLECTION, roomId);
  return onSnapshot(roomRef, (snapshot) => {
    if (!snapshot.exists()) { onRoom(null); return; }
    onRoom(mapRoomData(snapshot.id, snapshot.data()));
  }, (err) => onError?.(err));
}

export async function sendChatMessage(
  roomId: string, userId: string, userName: string, text: string,
  options?: { userPhoto?: string; isAdmin?: boolean; isPartner?: boolean; isPremium?: boolean; isDonation?: boolean; donationAmount?: number }
): Promise<ChatMessage> {
  const chatRef = collection(db, COLLECTION, roomId, "chat");
  const messageData = {
    text: text.trim(), userId, userName,
    userPhoto: options?.userPhoto || null, isAdmin: options?.isAdmin || false,
    isPartner: options?.isPartner || false, isPremium: options?.isPremium || false,
    isDonation: options?.isDonation || false, donationAmount: options?.donationAmount || null,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(chatRef, messageData);
  return {
    id: docRef.id, text: text.trim(), userId, userName,
    userPhoto: options?.userPhoto, isAdmin: options?.isAdmin, isPartner: options?.isPartner,
    isDonation: options?.isDonation, donationAmount: options?.donationAmount, createdAt: new Date(),
  };
}

export function subscribeChatMessages(
  roomId: string, onMessages: (messages: ChatMessage[]) => void, onError?: (err: any) => void, limit: number = 100
) {
  const chatRef = collection(db, COLLECTION, roomId, "chat");
  const chatQuery = query(chatRef, orderBy("createdAt", "asc"));
  return onSnapshot(chatQuery, (snapshot) => {
    const messages: ChatMessage[] = snapshot.docs.slice(-limit).map((d) => {
      const data = d.data() as any;
      return {
        id: d.id, text: data.text, userId: data.userId, userName: data.userName,
        userPhoto: data.userPhoto || undefined, isAdmin: data.isAdmin || false,
        isPartner: data.isPartner || false, isPremium: data.isPremium || false,
        isDonation: data.isDonation || false, donationAmount: data.donationAmount || undefined,
        createdAt: data.createdAt?.toDate?.() ?? null,
      };
    });
    onMessages(messages);
  }, (err) => onError?.(err));
}

export async function updateViewerCount(roomId: string, incrementValue: number): Promise<void> {
  try {
    const { increment } = await import("firebase/firestore");
    await updateDoc(doc(db, COLLECTION, roomId), { viewerCount: increment(incrementValue) });
  } catch { /* silent */ }
}

export async function updateBroadcastActivity(roomId: string): Promise<void> {
  try { await updateDoc(doc(db, COLLECTION, roomId), { lastBroadcastAt: serverTimestamp() }); } catch { /* silent */ }
}

export async function clearInactiveRoom(roomId: string): Promise<void> {
  try { await updateDoc(doc(db, COLLECTION, roomId), { activeTranslatorId: null, lastBroadcastAt: null }); } catch { /* silent */ }
}
