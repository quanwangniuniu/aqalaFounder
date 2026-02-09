import {
  doc, getDoc, setDoc, deleteDoc, updateDoc, increment,
  collection, query, where, orderBy, limit, getDocs, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface FollowUser {
  id: string;
  username: string | null;
  displayName: string | null;
  photoURL: string | null;
  followedAt?: Date;
  mutualCount?: number;
}

export async function followUser(
  followerId: string, followingId: string,
  followerData: { username: string | null; displayName: string | null; photoURL: string | null },
  followingData: { username: string | null; displayName: string | null; photoURL: string | null }
): Promise<void> {
  const followingRef = doc(db, "users", followerId, "following", followingId);
  const followersRef = doc(db, "users", followingId, "followers", followerId);
  const now = serverTimestamp();

  await setDoc(followingRef, { userId: followingId, username: followingData.username, displayName: followingData.displayName, photoURL: followingData.photoURL, followedAt: now });
  await setDoc(followersRef, { userId: followerId, username: followerData.username, displayName: followerData.displayName, photoURL: followerData.photoURL, followedAt: now });
  await updateDoc(doc(db, "users", followerId), { followingCount: increment(1) });
  await updateDoc(doc(db, "users", followingId), { followerCount: increment(1) });
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  await deleteDoc(doc(db, "users", followerId, "following", followingId));
  await deleteDoc(doc(db, "users", followingId, "followers", followerId));
  await updateDoc(doc(db, "users", followerId), { followingCount: increment(-1) });
  await updateDoc(doc(db, "users", followingId), { followerCount: increment(-1) });
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", followerId, "following", followingId));
  return snap.exists();
}

export function subscribeToFollowStatus(followerId: string, followingId: string, callback: (isFollowing: boolean) => void): () => void {
  return onSnapshot(doc(db, "users", followerId, "following", followingId), (snap) => callback(snap.exists()));
}

export function subscribeToUserCounts(userId: string, callback: (counts: { followerCount: number; followingCount: number }) => void): () => void {
  return onSnapshot(doc(db, "users", userId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback({ followerCount: data.followerCount || 0, followingCount: data.followingCount || 0 });
    }
  });
}

export async function getFollowers(userId: string, limitCount: number = 50): Promise<FollowUser[]> {
  const q = query(collection(db, "users", userId, "followers"), orderBy("followedAt", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => { const data = d.data(); return { id: d.id, username: data.username, displayName: data.displayName, photoURL: data.photoURL, followedAt: data.followedAt?.toDate() }; });
}

export async function getFollowing(userId: string, limitCount: number = 50): Promise<FollowUser[]> {
  const q = query(collection(db, "users", userId, "following"), orderBy("followedAt", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => { const data = d.data(); return { id: d.id, username: data.username, displayName: data.displayName, photoURL: data.photoURL, followedAt: data.followedAt?.toDate() }; });
}

export async function getSuggestedUsers(userId: string, limitCount: number = 10): Promise<FollowUser[]> {
  const following = await getFollowing(userId, 50);
  const suggestions: Map<string, FollowUser & { score: number }> = new Map();

  for (const user of following.slice(0, 10)) {
    const theirFollowing = await getFollowing(user.id, 20);
    for (const suggested of theirFollowing) {
      if (suggested.id === userId || following.some((f) => f.id === suggested.id)) continue;
      const existing = suggestions.get(suggested.id);
      if (existing) existing.score += 1;
      else suggestions.set(suggested.id, { ...suggested, score: 1 });
    }
  }

  return Array.from(suggestions.values()).sort((a, b) => b.score - a.score).slice(0, limitCount).map(({ score, ...user }) => ({ ...user, mutualCount: score }));
}
