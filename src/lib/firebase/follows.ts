import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface FollowUser {
  id: string;
  username: string | null;
  displayName: string | null;
  photoURL: string | null;
  followedAt?: Date;
}

function ensureDb() {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
  return db;
}

/**
 * Follow a user
 */
export async function followUser(
  followerId: string,
  followingId: string,
  followerData: { username: string | null; displayName: string | null; photoURL: string | null },
  followingData: { username: string | null; displayName: string | null; photoURL: string | null }
): Promise<void> {
  const firestore = ensureDb();
  
  // Create follow relationship in both directions for efficient querying
  const followingRef = doc(firestore, "users", followerId, "following", followingId);
  const followersRef = doc(firestore, "users", followingId, "followers", followerId);
  
  const now = serverTimestamp();
  
  // Add to follower's "following" subcollection
  await setDoc(followingRef, {
    userId: followingId,
    username: followingData.username,
    displayName: followingData.displayName,
    photoURL: followingData.photoURL,
    followedAt: now,
  });
  
  // Add to target's "followers" subcollection
  await setDoc(followersRef, {
    userId: followerId,
    username: followerData.username,
    displayName: followerData.displayName,
    photoURL: followerData.photoURL,
    followedAt: now,
  });
  
  // Update counts
  await updateDoc(doc(firestore, "users", followerId), {
    followingCount: increment(1),
  });
  await updateDoc(doc(firestore, "users", followingId), {
    followerCount: increment(1),
  });
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const firestore = ensureDb();
  
  const followingRef = doc(firestore, "users", followerId, "following", followingId);
  const followersRef = doc(firestore, "users", followingId, "followers", followerId);
  
  // Remove from both subcollections
  await deleteDoc(followingRef);
  await deleteDoc(followersRef);
  
  // Update counts
  await updateDoc(doc(firestore, "users", followerId), {
    followingCount: increment(-1),
  });
  await updateDoc(doc(firestore, "users", followingId), {
    followerCount: increment(-1),
  });
}

/**
 * Check if user A is following user B
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const firestore = ensureDb();
  const followingRef = doc(firestore, "users", followerId, "following", followingId);
  const snap = await getDoc(followingRef);
  return snap.exists();
}

/**
 * Subscribe to follow status changes
 */
export function subscribeToFollowStatus(
  followerId: string,
  followingId: string,
  callback: (isFollowing: boolean) => void
): () => void {
  const firestore = ensureDb();
  const followingRef = doc(firestore, "users", followerId, "following", followingId);
  
  return onSnapshot(followingRef, (snap) => {
    callback(snap.exists());
  });
}

/**
 * Subscribe to follower/following count changes
 */
export function subscribeToUserCounts(
  userId: string,
  callback: (counts: { followerCount: number; followingCount: number }) => void
): () => void {
  const firestore = ensureDb();
  const userRef = doc(firestore, "users", userId);
  
  return onSnapshot(userRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback({
        followerCount: data.followerCount || 0,
        followingCount: data.followingCount || 0,
      });
    }
  });
}

/**
 * Get user's followers
 */
export async function getFollowers(userId: string, limitCount: number = 50): Promise<FollowUser[]> {
  const firestore = ensureDb();
  const followersRef = collection(firestore, "users", userId, "followers");
  const q = query(followersRef, orderBy("followedAt", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      username: data.username,
      displayName: data.displayName,
      photoURL: data.photoURL,
      followedAt: data.followedAt?.toDate(),
    };
  });
}

/**
 * Get users that a user is following
 */
export async function getFollowing(userId: string, limitCount: number = 50): Promise<FollowUser[]> {
  const firestore = ensureDb();
  const followingRef = collection(firestore, "users", userId, "following");
  const q = query(followingRef, orderBy("followedAt", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      username: data.username,
      displayName: data.displayName,
      photoURL: data.photoURL,
      followedAt: data.followedAt?.toDate(),
    };
  });
}

/**
 * Get mutual followers (people who follow both user A and user B)
 */
export async function getMutualFollowers(
  userIdA: string,
  userIdB: string,
  limitCount: number = 20
): Promise<FollowUser[]> {
  const followersA = await getFollowers(userIdA, 200);
  const followersB = await getFollowers(userIdB, 200);
  
  const bIds = new Set(followersB.map((f) => f.id));
  return followersA.filter((f) => bIds.has(f.id)).slice(0, limitCount);
}

/**
 * Get suggested users (people followed by users you follow)
 */
export async function getSuggestedUsers(
  userId: string,
  limitCount: number = 10
): Promise<FollowUser[]> {
  const following = await getFollowing(userId, 50);
  const suggestions: Map<string, FollowUser & { score: number }> = new Map();
  
  // Get who your follows are following
  for (const user of following.slice(0, 10)) {
    const theirFollowing = await getFollowing(user.id, 20);
    for (const suggested of theirFollowing) {
      // Skip yourself and people you already follow
      if (suggested.id === userId || following.some((f) => f.id === suggested.id)) {
        continue;
      }
      
      const existing = suggestions.get(suggested.id);
      if (existing) {
        existing.score += 1;
      } else {
        suggestions.set(suggested.id, { ...suggested, score: 1 });
      }
    }
  }
  
  // Sort by score and return top suggestions
  return Array.from(suggestions.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limitCount)
    .map(({ score, ...user }) => user);
}
