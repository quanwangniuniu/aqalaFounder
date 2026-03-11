import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export type ReportReason =
  | "harassment"
  | "hate_speech"
  | "spam"
  | "misinformation"
  | "inappropriate_content"
  | "impersonation"
  | "other";

export type ReportTargetType = "user" | "message" | "room";

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_speech", label: "Hate speech or discrimination" },
  { value: "spam", label: "Spam or scam" },
  { value: "misinformation", label: "Misinformation" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "impersonation", label: "Impersonation" },
  { value: "other", label: "Other" },
];

export async function submitReport(params: {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  targetUserId: string;
  reason: ReportReason;
  description: string;
}): Promise<string> {
  const reportsRef = collection(db, "reports");

  const existingQuery = query(
    reportsRef,
    where("reporterId", "==", params.reporterId),
    where("targetId", "==", params.targetId),
    where("status", "==", "pending")
  );
  const existing = await getDocs(existingQuery);
  if (!existing.empty) {
    throw new Error("You have already reported this content.");
  }

  const reportRef = doc(reportsRef);
  await setDoc(reportRef, {
    ...params,
    status: "pending",
    createdAt: serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
    resolution: null,
  });

  return reportRef.id;
}

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  if (blockerId === blockedId) throw new Error("You cannot block yourself.");
  const blockRef = doc(db, "users", blockerId, "blockedUsers", blockedId);
  await setDoc(blockRef, { blockedId, blockedAt: serverTimestamp() });

  // Sever follow relationship both ways so blocked user doesn't still "follow" you
  const { unfollowUser, isFollowing } = await import("./follows");
  if (await isFollowing(blockerId, blockedId)) await unfollowUser(blockerId, blockedId);
  if (await isFollowing(blockedId, blockerId)) await unfollowUser(blockedId, blockerId);
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const blockRef = doc(db, "users", blockerId, "blockedUsers", blockedId);
  await deleteDoc(blockRef);
}

export async function isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const blockRef = doc(db, "users", blockerId, "blockedUsers", blockedId);
  const blockDoc = await getDoc(blockRef);
  return blockDoc.exists();
}

export async function getBlockedUserIds(blockerId: string): Promise<string[]> {
  const blockedRef = collection(db, "users", blockerId, "blockedUsers");
  const snapshot = await getDocs(blockedRef);
  return snapshot.docs.map((d) => d.id);
}
