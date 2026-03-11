import {
  doc,
  collection,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const USERS_COLLECTION = "users";

/** XP per minute listened */
const XP_PER_MINUTE = 1;

/** Level thresholds: XP required to reach each level */
const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 8000, 10000,
];

/** Title for each level (index = level - 1) */
const LEVEL_TITLES = [
  "Mubtadi",
  "Mustami'",
  "Murid",
  "Talib",
  "Talib al-'Ilm",
  "Mujtahid",
  "Hafiz",
  "'Alim",
  "Faqih",
  "Shaykh",
  "Imam",
];

function ensureDb() {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
  return db;
}

/**
 * Get level from XP (1-based).
 */
export function getLevelFromXp(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Get title for a given level.
 */
export function getTitleFromLevel(level: number): string {
  const idx = Math.min(level - 1, LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[Math.max(0, idx)];
}

/**
 * Get XP progress within current level for progress bar.
 */
export function getXpProgress(xp: number): {
  current: number;
  needed: number;
  percent: number;
  isMaxLevel: boolean;
} {
  const level = getLevelFromXp(xp);
  const isMaxLevel = level >= LEVEL_THRESHOLDS.length;
  const xpForCurrentLevel = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const xpForNextLevel = isMaxLevel
    ? xpForCurrentLevel + 1000
    : (LEVEL_THRESHOLDS[level] ?? xpForCurrentLevel + 1000);
  const progressInLevel = xp - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  const percent = isMaxLevel ? 100 : Math.min(100, (progressInLevel / xpNeededForNext) * 100);
  return {
    current: progressInLevel,
    needed: xpNeededForNext,
    percent,
    isMaxLevel,
  };
}

/**
 * Format total listening minutes as human-readable string.
 */
export function formatListeningTime(totalMinutes: number): string {
  if (totalMinutes < 60) return `${Math.floor(totalMinutes)} min`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.floor(totalMinutes % 60);
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) return `${days}d`;
  return `${days}d ${remainingHours}h`;
}

/**
 * Returns the timestamp for "now" when a listening session starts.
 * Client should pass (now - startedAt) / 1000 as durationSeconds on leave.
 */
export function startListeningSession(): number {
  return Date.now();
}

/**
 * Record a completed listening session: add XP, update aggregates, recalc level/title.
 * Duration is counted in seconds for accuracy; XP and display still use whole minutes.
 * Client must pass pre-computed durationSeconds (from session start to now).
 */
export async function recordListeningSession(
  uid: string,
  roomId: string,
  roomName: string,
  durationSeconds: number
): Promise<void> {
  const firestore = ensureDb();

  // Clamp to prevent abuse (max 24h per session). Count in seconds for exact timing.
  const clampedSeconds = Math.min(
    Math.max(0, Math.floor(durationSeconds)),
    24 * 60 * 60
  );

  if (clampedSeconds === 0) return;

  // XP and rank stay in minutes: 1 XP per full minute (e.g. 90 sec = 1 XP, 120 sec = 2 XP).
  const minutesForXp = Math.floor(clampedSeconds / 60);
  const xpGained = minutesForXp * XP_PER_MINUTE;

  const userRef = doc(firestore, USERS_COLLECTION, uid);

  await runTransaction(firestore, async (tx) => {
    const userSnap = await tx.get(userRef);
    const data = userSnap.exists() ? userSnap.data() : null;

    // Prefer totalListeningSeconds; fall back to legacy totalListeningMinutes * 60.
    const currentTotalSeconds =
      data?.totalListeningSeconds ??
      ((data?.totalListeningMinutes ?? 0) * 60);

    const currentXp = data?.xp ?? 0;

    const newTotalSeconds = currentTotalSeconds + clampedSeconds;
    const newXp = currentXp + xpGained;
    const newLevel = getLevelFromXp(newXp);
    const newTitle = getTitleFromLevel(newLevel);

    // Store seconds as source of truth; keep totalListeningMinutes for display/backward compat.
    const newTotalMinutes = Math.round(newTotalSeconds / 60);

    const updateData: Record<string, unknown> = {
      totalListeningSeconds: newTotalSeconds,
      totalListeningMinutes: newTotalMinutes,
      xp: newXp,
      level: newLevel,
      listenerTitle: newTitle,
      updatedAt: serverTimestamp(),
    };

    if (userSnap.exists()) {
      tx.update(userRef, updateData);
    } else {
      tx.set(userRef, {
        uid,
        totalListeningSeconds: newTotalSeconds,
        totalListeningMinutes: newTotalMinutes,
        xp: newXp,
        level: newLevel,
        listenerTitle: newTitle,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  });
}
