import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const COLLECTION = "users";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username: string | null;
  bio: string | null;
  provider: string | null; // 'google', 'apple', 'email'
  createdAt: Date | null;
  updatedAt: Date | null;
  lastLoginAt: Date | null;
  // Admin field for site admins
  admin: boolean;
  // Partner fields for mosque admins
  partner: boolean;
  partnerMosqueName: string | null;
  partnerMosqueId: string | null;
  // Social features
  followerCount: number;
  followingCount: number;
  // Privacy settings
  privateHistory: boolean; // Hide room history from others
  privateFollowers: boolean; // Hide followers list from others
  // Subscription status (public)
  isPremium: boolean;
  // Listener gamification
  totalListeningMinutes: number;
  xp: number;
  level: number;
  listenerTitle: string;
}

function ensureDb() {
  if (!db) {
    throw new Error("Firestore is not initialized on the server side.");
  }
  return db;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const firestore = ensureDb();
  const userDoc = await getDoc(doc(firestore, COLLECTION, uid));
  
  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
  return {
    uid: data.uid,
    email: data.email || null,
    displayName: data.displayName || null,
    photoURL: data.photoURL || null,
    username: data.username || null,
    bio: data.bio || null,
    provider: data.provider || null,
    createdAt: data.createdAt?.toDate() || null,
    updatedAt: data.updatedAt?.toDate() || null,
    lastLoginAt: data.lastLoginAt?.toDate() || null,
    admin: data.admin || false,
    partner: data.partner || false,
    partnerMosqueName: data.partnerMosqueName || null,
    partnerMosqueId: data.partnerMosqueId || null,
    followerCount: data.followerCount || 0,
    followingCount: data.followingCount || 0,
    privateHistory: data.privateHistory || false,
    privateFollowers: data.privateFollowers || false,
    isPremium: data.isPremium || false,
    totalListeningMinutes:
      (data.totalListeningSeconds ?? (data.totalListeningMinutes ?? 0) * 60) /
      60,
    xp: data.xp ?? 0,
    level: data.level ?? 1,
    listenerTitle: data.listenerTitle ?? "",
  };
}

/**
 * Check if a user is a partner (mosque admin)
 */
export async function isUserPartner(uid: string): Promise<boolean> {
  const profile = await getUserProfile(uid);
  return profile?.partner === true;
}

/**
 * Get partner details for a user
 */
export async function getPartnerDetails(uid: string): Promise<{
  isPartner: boolean;
  mosqueName: string | null;
  mosqueId: string | null;
}> {
  const profile = await getUserProfile(uid);
  return {
    isPartner: profile?.partner === true,
    mosqueName: profile?.partnerMosqueName || null,
    mosqueId: profile?.partnerMosqueId || null,
  };
}

export async function createOrUpdateUserProfile(
  uid: string,
  userData: {
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    username?: string | null;
    provider?: string | null;
  }
): Promise<void> {
  const firestore = ensureDb();
  const userRef = doc(firestore, COLLECTION, uid);
  
  const existingDoc = await getDoc(userRef);
  const now = serverTimestamp();

  if (existingDoc.exists()) {
    const existingData = existingDoc.data();
    
    // Update existing user - update lastLoginAt
    const updateData: Record<string, any> = {
      email: userData.email,
      lastLoginAt: now,
      updatedAt: now,
    };
    
    // Only update displayName if user doesn't have a custom username
    if (!existingData.username && userData.displayName) {
      updateData.displayName = userData.displayName;
    }
    
    // IMPORTANT: Don't overwrite photoURL if user has a custom one (e.g., from Cloudinary)
    // Only set photoURL if:
    // 1. User has no existing photo, OR
    // 2. The new photo is from a social provider AND user doesn't have a custom Cloudinary photo
    const hasCustomPhoto = existingData.photoURL && 
      (existingData.photoURL.includes('cloudinary.com') || 
       existingData.photoURL.includes('res.cloudinary.com'));
    
    if (!hasCustomPhoto && !existingData.photoURL && userData.photoURL) {
      // Only set if user has no photo at all
      updateData.photoURL = userData.photoURL;
    }
    
    // Only update username if explicitly provided
    if (userData.username !== undefined) {
      updateData.username = userData.username;
    }
    
    await updateDoc(userRef, updateData);
  } else {
    // Create new user
    await setDoc(userRef, {
      uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      username: userData.username || null,
      bio: null,
      provider: userData.provider || null,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      followerCount: 0,
      followingCount: 0,
      privateHistory: false,
      privateFollowers: false,
      totalListeningSeconds: 0,
      totalListeningMinutes: 0,
      xp: 0,
      level: 1,
      listenerTitle: "",
    });
  }
}

/**
 * Update specific user profile fields
 */
export async function updateUserProfileFields(
  uid: string,
  fields: {
    username?: string;
    photoURL?: string;
    displayName?: string;
    bio?: string;
    privateHistory?: boolean;
    privateFollowers?: boolean;
  }
): Promise<void> {
  const firestore = ensureDb();
  const userRef = doc(firestore, COLLECTION, uid);
  
  await updateDoc(userRef, {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Check if a username is available
 */
export async function isUsernameAvailable(username: string, excludeUid?: string): Promise<boolean> {
  const firestore = ensureDb();
  const { query, collection, where, getDocs } = await import("firebase/firestore");
  
  const q = query(
    collection(firestore, COLLECTION),
    where("username", "==", username.toLowerCase())
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return true;
  
  // If excludeUid is provided, check if the only match is the current user
  if (excludeUid && snapshot.size === 1) {
    return snapshot.docs[0].id === excludeUid;
  }
  
  return false;
}

/**
 * Room history entry
 */
export interface RoomHistoryEntry {
  roomId: string;
  roomName: string;
  joinedAt: Date;
  leftAt: Date | null;
  role: "viewer" | "broadcaster";
}

/**
 * Add room visit to user history
 */
export async function addRoomToHistory(
  uid: string,
  roomId: string,
  roomName: string,
  role: "viewer" | "broadcaster"
): Promise<void> {
  const firestore = ensureDb();
  const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
  
  const historyRef = collection(firestore, COLLECTION, uid, "roomHistory");
  await addDoc(historyRef, {
    roomId,
    roomName,
    role,
    joinedAt: serverTimestamp(),
    leftAt: null,
  });
}

/**
 * Get user's room history
 */
export async function getUserRoomHistory(uid: string, limit: number = 20): Promise<RoomHistoryEntry[]> {
  const firestore = ensureDb();
  const { collection, query, orderBy, limit: limitQuery, getDocs } = await import("firebase/firestore");
  
  const historyRef = collection(firestore, COLLECTION, uid, "roomHistory");
  const q = query(historyRef, orderBy("joinedAt", "desc"), limitQuery(limit));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      roomId: data.roomId,
      roomName: data.roomName,
      joinedAt: data.joinedAt?.toDate() || new Date(),
      leftAt: data.leftAt?.toDate() || null,
      role: data.role,
    };
  });
}

/**
 * Searched user type
 */
export interface SearchedUser {
  uid: string;
  username: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio: string | null;
  admin: boolean;
  partner: boolean;
  isPremium?: boolean;
}

/**
 * Search users by username or display name
 */
export async function searchUsers(searchQuery: string, limitCount: number = 20): Promise<SearchedUser[]> {
  const firestore = ensureDb();
  const { collection, query, where, orderBy, limit, getDocs, or } = await import("firebase/firestore");
  
  const searchLower = searchQuery.toLowerCase();
  const usersRef = collection(firestore, COLLECTION);
  
  // Search by username (prefix match)
  const usernameQuery = query(
    usersRef,
    where("username", ">=", searchLower),
    where("username", "<=", searchLower + "\uf8ff"),
    limit(limitCount)
  );
  
  const usernameSnapshot = await getDocs(usernameQuery);
  const usernameResults = new Map<string, SearchedUser>();
  
  usernameSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    usernameResults.set(doc.id, {
      uid: doc.id,
      username: data.username || null,
      displayName: data.displayName || null,
      photoURL: data.photoURL || null,
      bio: data.bio || null,
      admin: data.admin || false,
      partner: data.partner || false,
    });
  });
  
  // Also search by displayName if we have room for more results
  if (usernameResults.size < limitCount) {
    const displayNameQuery = query(
      usersRef,
      where("displayName", ">=", searchQuery),
      where("displayName", "<=", searchQuery + "\uf8ff"),
      limit(limitCount - usernameResults.size)
    );
    
    const displayNameSnapshot = await getDocs(displayNameQuery);
    displayNameSnapshot.docs.forEach((doc) => {
      if (!usernameResults.has(doc.id)) {
        const data = doc.data();
        usernameResults.set(doc.id, {
          uid: doc.id,
          username: data.username || null,
          displayName: data.displayName || null,
          photoURL: data.photoURL || null,
          bio: data.bio || null,
          admin: data.admin || false,
          partner: data.partner || false,
        });
      }
    });
  }
  
  return Array.from(usernameResults.values());
}
