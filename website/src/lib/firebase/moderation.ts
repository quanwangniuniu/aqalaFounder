import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config";

function ensureDb() {
  if (!db) {
    throw new Error("Firestore is not initialized on the server side.");
  }
  return db;
}

// --- Report Types ---

export type ReportReason =
  | "harassment"
  | "hate_speech"
  | "spam"
  | "misinformation"
  | "inappropriate_content"
  | "impersonation"
  | "other";

export type ReportTargetType = "user" | "message" | "room";

export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  targetUserId: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  resolution: string | null;
}

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_speech", label: "Hate speech or discrimination" },
  { value: "spam", label: "Spam or scam" },
  { value: "misinformation", label: "Misinformation" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "impersonation", label: "Impersonation" },
  { value: "other", label: "Other" },
];

// --- Report Functions ---

export async function submitReport(params: {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  targetUserId: string;
  reason: ReportReason;
  description: string;
}): Promise<string> {
  const firestore = ensureDb();
  const reportsRef = collection(firestore, "reports");

  // Check for duplicate active reports from same user on same target
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

export async function getReports(
  status?: ReportStatus,
  limitCount: number = 50
): Promise<Report[]> {
  const firestore = ensureDb();
  const reportsRef = collection(firestore, "reports");

  const constraints: any[] = [orderBy("createdAt", "desc"), limit(limitCount)];
  if (status) {
    constraints.unshift(where("status", "==", status));
  }

  const q = query(reportsRef, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      reporterId: data.reporterId,
      targetType: data.targetType,
      targetId: data.targetId,
      targetUserId: data.targetUserId,
      reason: data.reason,
      description: data.description,
      status: data.status,
      createdAt: data.createdAt?.toDate() || new Date(),
      reviewedAt: data.reviewedAt?.toDate() || null,
      reviewedBy: data.reviewedBy || null,
      resolution: data.resolution || null,
    };
  });
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  reviewerId: string,
  resolution?: string
): Promise<void> {
  const firestore = ensureDb();
  const reportRef = doc(firestore, "reports", reportId);
  await updateDoc(reportRef, {
    status,
    reviewedAt: serverTimestamp(),
    reviewedBy: reviewerId,
    resolution: resolution || null,
  });
}

// --- Block Functions ---

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  if (blockerId === blockedId) {
    throw new Error("You cannot block yourself.");
  }

  const firestore = ensureDb();
  const blockRef = doc(firestore, "users", blockerId, "blockedUsers", blockedId);
  await setDoc(blockRef, {
    blockedId,
    blockedAt: serverTimestamp(),
  });

  // Sever follow relationship both ways so blocked user doesn't still "follow" you
  const { unfollowUser, isFollowing } = await import("@/lib/firebase/follows");
  if (await isFollowing(blockerId, blockedId)) await unfollowUser(blockerId, blockedId);
  if (await isFollowing(blockedId, blockerId)) await unfollowUser(blockedId, blockerId);
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const firestore = ensureDb();
  const blockRef = doc(firestore, "users", blockerId, "blockedUsers", blockedId);
  await deleteDoc(blockRef);
}

export async function isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const firestore = ensureDb();
  const blockRef = doc(firestore, "users", blockerId, "blockedUsers", blockedId);
  const blockDoc = await getDoc(blockRef);
  return blockDoc.exists();
}

export interface BlockedUser {
  id: string;
  blockedAt: Date;
}

export async function getBlockedUsers(userId: string): Promise<BlockedUser[]> {
  const firestore = ensureDb();
  const blockedRef = collection(firestore, "users", userId, "blockedUsers");
  const q = query(blockedRef, orderBy("blockedAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      blockedAt: data.blockedAt?.toDate() || new Date(),
    };
  });
}
