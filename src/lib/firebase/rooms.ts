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
  email?: string | null;
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
      // Note: email not available at room creation, will be updated when user joins
      await setDoc(doc(firestore, COLLECTION, roomRef.id, "members", ownerId), {
        userId: ownerId,
        role: "listener",
        joinedAt: serverTimestamp(),
        email: null,
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

export async function getRoom(roomId: string): Promise<Room | null> {
  const firestore = ensureDb();
  const roomDoc = await getDoc(doc(firestore, COLLECTION, roomId));
  if (!roomDoc.exists()) {
    return null;
  }
  const data = roomDoc.data() as any;
  return {
    id: roomDoc.id,
    name: data.name,
    ownerId: data.ownerId,
    activeTranslatorId: data.activeTranslatorId || null,
    createdAt: data.createdAt?.toDate?.() ?? null,
    memberCount: data.memberCount ?? 0,
    isActive: data.isActive ?? true,
  };
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

export async function joinRoom(roomId: string, userId: string, asTranslator = false, email?: string | null): Promise<void> {
  console.log(`[JOIN MOSQUE] Starting join process - roomId: ${roomId}, userId: ${userId}, asTranslator: ${asTranslator}`);
  const firestore = ensureDb();
  
  // First, check if user is already a member (outside transaction to avoid conflicts)
  const memberRef = doc(firestore, COLLECTION, roomId, "members", userId);
  const memberSnap = await getDoc(memberRef);
  const alreadyMember = memberSnap.exists();
  console.log(`[JOIN MOSQUE] Member check - roomId: ${roomId}, userId: ${userId}, alreadyMember: ${alreadyMember}`);
  
  // If already a member and not trying to change role, just return success
  if (alreadyMember && !asTranslator) {
    console.log(`[JOIN MOSQUE] User already a member - roomId: ${roomId}, userId: ${userId}, skipping join`);
    return; // Already a member, no need to do anything
  }
  
  try {
    await runTransaction(firestore, async (tx) => {
      console.log(`[JOIN MOSQUE] Starting transaction - roomId: ${roomId}, userId: ${userId}`);
      const roomRef = doc(firestore, COLLECTION, roomId);
      const roomSnap = await tx.get(roomRef);
      if (!roomSnap.exists()) {
        console.error(`[JOIN MOSQUE] Room not found - roomId: ${roomId}, userId: ${userId}`);
        throw new Error("Room not found");
      }
      const roomData = roomSnap.data() as any;
      if (!roomData.isActive) {
        console.error(`[JOIN MOSQUE] Room is inactive - roomId: ${roomId}, userId: ${userId}`);
        throw new Error("Room is inactive");
      }

      const memberRefInTx = doc(firestore, COLLECTION, roomId, "members", userId);
      const memberSnapInTx = await tx.get(memberRefInTx);
      const alreadyMemberInTx = memberSnapInTx.exists();
      console.log(`[JOIN MOSQUE] Transaction member check - roomId: ${roomId}, userId: ${userId}, alreadyMemberInTx: ${alreadyMemberInTx}`);

      // Only increment member count if not already a member
      const nextMemberCount = alreadyMemberInTx ? roomData.memberCount ?? 1 : (roomData.memberCount ?? 0) + 1;
      console.log(`[JOIN MOSQUE] Member count update - roomId: ${roomId}, currentCount: ${roomData.memberCount ?? 0}, nextCount: ${nextMemberCount}`);

      let nextActiveTranslator = roomData.activeTranslatorId || null;
      if (asTranslator) {
        if (roomData.activeTranslatorId && roomData.activeTranslatorId !== userId) {
          console.error(`[JOIN MOSQUE] Translator already active - roomId: ${roomId}, userId: ${userId}, activeTranslatorId: ${roomData.activeTranslatorId}`);
          throw new Error("Translator already active in this room");
        }
        nextActiveTranslator = userId;
        console.log(`[JOIN MOSQUE] Setting as translator - roomId: ${roomId}, userId: ${userId}`);
      }

      // Handle member document creation/update
      // Note: In transactions, we need to check existence first to avoid conflicts
      if (alreadyMemberInTx) {
        // Just update the role if changing to translator, and update email if provided
        if (asTranslator) {
          const updateData: any = { role: "translator" };
          if (email !== undefined) {
            updateData.email = email;
          }
          tx.update(memberRefInTx, updateData);
          console.log(`[JOIN MOSQUE] Member role updated to translator - roomId: ${roomId}, userId: ${userId}`);
        } else if (email !== undefined) {
          // Update email even if not changing role
          tx.update(memberRefInTx, { email });
          console.log(`[JOIN MOSQUE] Member email updated - roomId: ${roomId}, userId: ${userId}`);
        } else {
          console.log(`[JOIN MOSQUE] Member already exists, no update needed - roomId: ${roomId}, userId: ${userId}`);
        }
      } else {
        // Create new member document
        // Use set() which will create the document
        // If another concurrent transaction already created it, this transaction will fail
        // and we'll handle it in the catch block
        tx.set(memberRefInTx, {
          userId,
          role: asTranslator ? "translator" : "listener",
          joinedAt: serverTimestamp(),
          email: email || null,
        });
        console.log(`[JOIN MOSQUE] Member document will be created - roomId: ${roomId}, userId: ${userId}, role: ${asTranslator ? "translator" : "listener"}`);
      }

      // Only update room if member count changed or translator status changed
      // Note: If alreadyMemberInTx is true, memberCountChanged will be false, so we won't update
      const memberCountChanged = !alreadyMemberInTx;
      const translatorChanged = nextActiveTranslator !== roomData.activeTranslatorId;
      
      if (memberCountChanged || translatorChanged) {
        tx.update(roomRef, {
          memberCount: nextMemberCount,
          activeTranslatorId: nextActiveTranslator,
        });
        console.log(`[JOIN MOSQUE] Room updated - roomId: ${roomId}, memberCountChanged: ${memberCountChanged}, translatorChanged: ${translatorChanged}, newMemberCount: ${nextMemberCount}, newTranslatorId: ${nextActiveTranslator}`);
      }
    }).catch((error: any) => {
      // Catch errors during transaction execution/commit
      console.error(`[JOIN MOSQUE] Transaction promise rejected - roomId: ${roomId}, userId: ${userId}, errorCode: ${error?.code}, errorName: ${error?.name}, error:`, error);
      throw error; // Re-throw to be caught by outer catch
    });
    console.log(`[JOIN MOSQUE] Successfully joined - roomId: ${roomId}, userId: ${userId}, asTranslator: ${asTranslator}`);
  } catch (error: any) {
    console.error(`[JOIN MOSQUE] Transaction error - roomId: ${roomId}, userId: ${userId}, errorCode: ${error?.code}, errorName: ${error?.name}, error:`, error);
    
    // Check if user is actually a member now (another transaction may have succeeded)
    const memberRef = doc(firestore, COLLECTION, roomId, "members", userId);
    const memberSnap = await getDoc(memberRef);
    const isNowMember = memberSnap.exists();
    console.log(`[JOIN MOSQUE] Post-error member check - roomId: ${roomId}, userId: ${userId}, isNowMember: ${isNowMember}`);
    
    if (isNowMember) {
      // User is a member (another transaction succeeded), treat as success
      console.log(`[JOIN MOSQUE] User is a member after error (treated as success) - roomId: ${roomId}, userId: ${userId}, originalErrorCode: ${error?.code}`);
      return;
    }
    
    // If error is "already-exists" or conflict, but user is not a member, something went wrong
    if (error?.code === 'already-exists' || error?.code === 409 || error?.message?.includes('already-exists')) {
      console.error(`[JOIN MOSQUE] Already-exists error but user not a member - roomId: ${roomId}, userId: ${userId}`);
      throw new Error("Failed to join mosque due to concurrent modification. Please try again.");
    }
    
    // Handle failed-precondition (transaction conflict)
    if (error?.code === 'failed-precondition' || error?.code === 9 || error?.code === 'ABORTED') {
      console.error(`[JOIN MOSQUE] Transaction conflict and user not a member - roomId: ${roomId}, userId: ${userId}`);
      throw new Error("Failed to join mosque due to concurrent modification. Please try again.");
    }
    
    console.error(`[JOIN MOSQUE] Error joining - roomId: ${roomId}, userId: ${userId}, errorCode: ${error?.code}, error:`, error);
    // Re-throw other errors
    throw error;
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
          email: data.email || null,
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

