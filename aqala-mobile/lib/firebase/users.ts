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
  provider: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  lastLoginAt: Date | null;
  admin: boolean;
  partner: boolean;
  partnerMosqueName: string | null;
  partnerMosqueId: string | null;
  followerCount: number;
  followingCount: number;
  privateHistory: boolean;
  privateFollowers: boolean;
  isPremium: boolean;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, COLLECTION, uid));

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
  };
}

export async function isUserPartner(uid: string): Promise<boolean> {
  const profile = await getUserProfile(uid);
  return profile?.partner === true;
}

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
  const userRef = doc(db, COLLECTION, uid);
  const existingDoc = await getDoc(userRef);
  const now = serverTimestamp();

  if (existingDoc.exists()) {
    const existingData = existingDoc.data();
    const updateData: Record<string, any> = {
      email: userData.email,
      lastLoginAt: now,
      updatedAt: now,
    };

    if (!existingData.username && userData.displayName) {
      updateData.displayName = userData.displayName;
    }

    const hasCustomPhoto = existingData.photoURL &&
      (existingData.photoURL.includes("cloudinary.com") ||
        existingData.photoURL.includes("res.cloudinary.com"));

    if (!hasCustomPhoto && !existingData.photoURL && userData.photoURL) {
      updateData.photoURL = userData.photoURL;
    }

    if (userData.username !== undefined) {
      updateData.username = userData.username;
    }

    await updateDoc(userRef, updateData);
  } else {
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
    });
  }
}

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
  const userRef = doc(db, COLLECTION, uid);
  await updateDoc(userRef, {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

export async function isUsernameAvailable(username: string, excludeUid?: string): Promise<boolean> {
  const { query, collection, where, getDocs } = await import("firebase/firestore");
  const q = query(
    collection(db, COLLECTION),
    where("username", "==", username.toLowerCase())
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return true;
  if (excludeUid && snapshot.size === 1) {
    return snapshot.docs[0].id === excludeUid;
  }
  return false;
}

export interface RoomHistoryEntry {
  roomId: string;
  roomName: string;
  joinedAt: Date;
  leftAt: Date | null;
  role: "viewer" | "broadcaster";
}

export async function addRoomToHistory(
  uid: string,
  roomId: string,
  roomName: string,
  role: "viewer" | "broadcaster"
): Promise<void> {
  const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
  const historyRef = collection(db, COLLECTION, uid, "roomHistory");
  await addDoc(historyRef, {
    roomId,
    roomName,
    role,
    joinedAt: serverTimestamp(),
    leftAt: null,
  });
}

export async function getUserRoomHistory(uid: string, limit: number = 20): Promise<RoomHistoryEntry[]> {
  const { collection, query, orderBy, limit: limitQuery, getDocs } = await import("firebase/firestore");
  const historyRef = collection(db, COLLECTION, uid, "roomHistory");
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

export async function searchUsers(searchQuery: string, limitCount: number = 20): Promise<SearchedUser[]> {
  const { collection, query, where, limit, getDocs } = await import("firebase/firestore");
  const searchLower = searchQuery.toLowerCase();
  const usersRef = collection(db, COLLECTION);

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
