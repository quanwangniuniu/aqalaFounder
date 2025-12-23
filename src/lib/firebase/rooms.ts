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

export type Room = {
  id: string;
  name: string;
  ownerId: string;
  activeTranslatorId: string | null;
  createdAt: Date | null;
  memberCount: number;
  isActive: boolean;
};

export type RoomMemberRole = "translator" | "listener";

export type RoomMember = {
  userId: string;
  role: RoomMemberRole;
  joinedAt: Date | null;
};

function ensureDb() {
  if (!db) {
    throw new Error("Firestore is not initialized on the server side.");
  }
  return db;
}

export async function createRoom(name: string, ownerId: string): Promise<Room> {
  const firestore = ensureDb();
  const roomRef = await addDoc(collection(firestore, COLLECTION), {
    name: name.trim() || "Untitled Room",
    ownerId,
    activeTranslatorId: null,
    createdAt: serverTimestamp(),
    memberCount: 1,
    isActive: true,
  });

  // Add owner as listener member (not translator by default)
  await setDoc(doc(firestore, COLLECTION, roomRef.id, "members", ownerId), {
    userId: ownerId,
    role: "listener",
    joinedAt: serverTimestamp(),
  });

  return {
    id: roomRef.id,
    name,
    ownerId,
    activeTranslatorId: null,
    createdAt: new Date(),
    memberCount: 1,
    isActive: true,
  };
}

export async function deleteRoom(roomId: string, requesterId: string): Promise<void> {
  const firestore = ensureDb();
  const roomDoc = await getDoc(doc(firestore, COLLECTION, roomId));
  if (!roomDoc.exists()) {
    throw new Error("Room not found");
  }
  const data = roomDoc.data() as any;
  if (data.ownerId !== requesterId) {
    throw new Error("Only the room owner can delete this room");
  }
  await deleteDoc(doc(firestore, COLLECTION, roomId));
}

export function subscribeRooms(onRooms: (rooms: Room[]) => void, onError?: (err: any) => void) {
  const firestore = ensureDb();
  const roomsQuery = query(collection(firestore, COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(
    roomsQuery,
    (snapshot) => {
      const rooms: Room[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data.name,
          ownerId: data.ownerId,
          activeTranslatorId: data.activeTranslatorId || null,
          createdAt: data.createdAt?.toDate?.() ?? null,
          memberCount: data.memberCount ?? 0,
          isActive: data.isActive ?? true,
        };
      });
      onRooms(rooms);
    },
    (err) => onError?.(err)
  );
}

export async function joinRoom(roomId: string, userId: string, asTranslator = false): Promise<void> {
  const firestore = ensureDb();
  
  // First, check if user is already a member (outside transaction to avoid conflicts)
  const memberRef = doc(firestore, COLLECTION, roomId, "members", userId);
  const memberSnap = await getDoc(memberRef);
  const alreadyMember = memberSnap.exists();
  
  // If already a member and not trying to change role, just return success
  if (alreadyMember && !asTranslator) {
    return; // Already a member, no need to do anything
  }
  
  await runTransaction(firestore, async (tx) => {
    const roomRef = doc(firestore, COLLECTION, roomId);
    const roomSnap = await tx.get(roomRef);
    if (!roomSnap.exists()) {
      throw new Error("Room not found");
    }
    const roomData = roomSnap.data() as any;
    if (!roomData.isActive) {
      throw new Error("Room is inactive");
    }

    const memberRefInTx = doc(firestore, COLLECTION, roomId, "members", userId);
    const memberSnapInTx = await tx.get(memberRefInTx);
    const alreadyMemberInTx = memberSnapInTx.exists();

    // Only increment member count if not already a member
    const nextMemberCount = alreadyMemberInTx ? roomData.memberCount ?? 1 : (roomData.memberCount ?? 0) + 1;

    let nextActiveTranslator = roomData.activeTranslatorId || null;
    if (asTranslator) {
      if (roomData.activeTranslatorId && roomData.activeTranslatorId !== userId) {
        throw new Error("Translator already active in this room");
      }
      nextActiveTranslator = userId;
    }

    // Use merge: true to handle both create and update cases
    tx.set(
      memberRefInTx,
      {
        userId,
        role: asTranslator ? "translator" : "listener",
        joinedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Only update room if member count changed or translator status changed
    const memberCountChanged = !alreadyMemberInTx;
    const translatorChanged = nextActiveTranslator !== roomData.activeTranslatorId;
    
    if (memberCountChanged || translatorChanged) {
      tx.update(roomRef, {
        memberCount: nextMemberCount,
        activeTranslatorId: nextActiveTranslator,
      });
    }
  }).catch((error: any) => {
    // If error is "already-exists" or conflict, treat as success (user is already member)
    if (error?.code === 'already-exists' || error?.code === 409 || error?.message?.includes('already-exists')) {
      return; // Already a member, treat as success
    }
    // Re-throw other errors
    throw error;
  });
}

export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  const firestore = ensureDb();
  
  // First, check if user is the active translator BEFORE deleting member doc
  const roomRef = doc(firestore, COLLECTION, roomId);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) {
    throw new Error("Room not found");
  }
  const roomData = roomSnap.data() as any;
  const wasActiveTranslator = roomData.activeTranslatorId === userId;

  // Always allow the user to remove their member document; update room doc best-effort.
  const memberRef = doc(firestore, COLLECTION, roomId, "members", userId);
  await deleteDoc(memberRef).catch(() => {
    // If delete fails due to permissions, bubble up to show the message to the user.
    throw new Error("Unable to leave room (permission denied)");
  });

  // Best-effort room updates; if permissions block, silently ignore to avoid blocking leave.
  try {
    await runTransaction(firestore, async (tx) => {
      const roomRef = doc(firestore, COLLECTION, roomId);
      const roomSnap = await tx.get(roomRef);
      if (!roomSnap.exists()) return;
      const roomData = roomSnap.data() as any;

      const nextMemberCount = Math.max(0, (roomData.memberCount ?? 1) - 1);
      // Always clear activeTranslatorId if leaving user was the translator
      const nextActiveTranslator = wasActiveTranslator ? null : roomData.activeTranslatorId || null;

      tx.update(roomRef, {
        memberCount: nextMemberCount,
        activeTranslatorId: nextActiveTranslator,
      });
    });
  } catch {
    // ignore permissions errors; the user has already been removed from members
  }
}

export async function setTranslator(roomId: string, userId: string): Promise<void> {
  const firestore = ensureDb();
  await runTransaction(firestore, async (tx) => {
    const roomRef = doc(firestore, COLLECTION, roomId);
    const roomSnap = await tx.get(roomRef);
    if (!roomSnap.exists()) throw new Error("Room not found");
    const roomData = roomSnap.data() as any;
    if (roomData.activeTranslatorId && roomData.activeTranslatorId !== userId) {
      throw new Error("Another translator is active");
    }
    tx.update(roomRef, { activeTranslatorId: userId });
    tx.set(
      doc(firestore, COLLECTION, roomId, "members", userId),
      {
        userId,
        role: "translator",
        joinedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });
}

export async function clearTranslator(roomId: string, userId: string): Promise<void> {
  const firestore = ensureDb();
  await runTransaction(firestore, async (tx) => {
    const roomRef = doc(firestore, COLLECTION, roomId);
    const roomSnap = await tx.get(roomRef);
    if (!roomSnap.exists()) return;
    const roomData = roomSnap.data() as any;
    if (roomData.activeTranslatorId !== userId) return;
    tx.update(roomRef, { activeTranslatorId: null });
    tx.set(
      doc(firestore, COLLECTION, roomId, "members", userId),
      {
        role: "listener",
      },
      { merge: true }
    );
  });
}

export function subscribeRoomMembers(
  roomId: string,
  onMembers: (members: RoomMember[]) => void,
  onError?: (err: any) => void
) {
  const firestore = ensureDb();
  const membersQuery = query(collection(firestore, COLLECTION, roomId, "members"));
  return onSnapshot(
    membersQuery,
    (snapshot) => {
      const members: RoomMember[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        return {
          userId: data.userId || d.id,
          role: data.role || "listener",
          joinedAt: data.joinedAt?.toDate?.() ?? null,
        };
      });
      onMembers(members);
    },
    (err) => onError?.(err)
  );
}

/**
 * Validate that activeTranslatorId corresponds to an actual current member
 * If not, clear it to null
 * Returns true if cleaned, false if valid
 */
export async function validateAndCleanTranslator(roomId: string): Promise<boolean> {
  const firestore = ensureDb();
  try {
    const roomRef = doc(firestore, COLLECTION, roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return false;
    
    const roomData = roomSnap.data() as any;
    const activeTranslatorId = roomData.activeTranslatorId;
    
    if (!activeTranslatorId) return false; // No translator set, nothing to validate
    
    // Check if translator is still a member
    const memberRef = doc(firestore, COLLECTION, roomId, "members", activeTranslatorId);
    const memberSnap = await getDoc(memberRef);
    
    if (!memberSnap.exists()) {
      // Translator is not a member anymore, clear it
      await runTransaction(firestore, async (tx) => {
        const roomSnap = await tx.get(roomRef);
        if (!roomSnap.exists()) return;
        const data = roomSnap.data() as any;
        // Double-check it's still the same translator (might have changed)
        if (data.activeTranslatorId === activeTranslatorId) {
          tx.update(roomRef, { activeTranslatorId: null });
        }
      });
      return true; // Was cleaned
    }
    
    return false; // Valid translator
  } catch (err) {
    console.error("Error validating translator:", err);
    return false;
  }
}

/**
 * Claim the lead reciter role for a user
 * Validates no valid active translator exists before claiming
 */
export async function claimLeadReciter(roomId: string, userId: string): Promise<void> {
  const firestore = ensureDb();
  await runTransaction(firestore, async (tx) => {
    const roomRef = doc(firestore, COLLECTION, roomId);
    const roomSnap = await tx.get(roomRef);
    if (!roomSnap.exists()) {
      throw new Error("Room not found");
    }
    
    const roomData = roomSnap.data() as any;
    const currentTranslatorId = roomData.activeTranslatorId;
    
    // Validate current translator if one exists
    if (currentTranslatorId) {
      const currentTranslatorRef = doc(firestore, COLLECTION, roomId, "members", currentTranslatorId);
      const currentTranslatorSnap = await tx.get(currentTranslatorRef);
      
      // If current translator is still a valid member, don't allow claim
      if (currentTranslatorSnap.exists() && currentTranslatorId !== userId) {
        throw new Error("Another lead reciter is already active");
      }
      // If current translator is not a member, we'll clear it and allow claim
    }
    
    // Verify user is a member
    const memberRef = doc(firestore, COLLECTION, roomId, "members", userId);
    const memberSnap = await tx.get(memberRef);
    if (!memberSnap.exists()) {
      throw new Error("You must be a member of the mosque to become lead reciter");
    }
    
    // Set user as active translator
    tx.update(roomRef, { activeTranslatorId: userId });
    tx.set(
      memberRef,
      {
        userId,
        role: "translator",
        joinedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });
}

