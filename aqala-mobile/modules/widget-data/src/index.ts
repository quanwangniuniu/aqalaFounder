import { requireNativeModule, Platform } from "expo-modules-core";

// Only load on iOS — widgets are iOS-only for now
const WidgetData =
  Platform.OS === "ios" ? requireNativeModule("WidgetData") : null;

// ── Types ────────────────────────────────────────────────────

export interface PrayerTimesPayload {
  fajr: string; // ISO 8601 date string
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface LocationPayload {
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface DailyVersePayload {
  arabic: string;
  translation: string;
  reference: string;
}

export interface PrayerSettingsPayload {
  method: number;
  school: number;
}

export interface WidgetSyncData {
  prayerTimes: PrayerTimesPayload;
  location: LocationPayload;
  hijriDate: string;
  hijriMonth: string;
  isRamadan: boolean;
  ramadanDay: number;
  ramadanTotal: number;
  dailyVerse?: DailyVersePayload;
  settings?: PrayerSettingsPayload;
  lastUpdated: string;
}

// ── Public API ────────────────────────────────────────────────

/**
 * Sync prayer data to the native widget shared container.
 * Automatically triggers a widget timeline reload.
 */
export async function syncPrayerData(data: WidgetSyncData): Promise<void> {
  if (!WidgetData) return;
  return WidgetData.syncPrayerData(data);
}

/**
 * Force-reload all widget timelines without syncing new data.
 */
export function reloadWidgets(): void {
  if (!WidgetData) return;
  WidgetData.reloadWidgets();
}

/**
 * Clear all widget data from the shared container.
 */
export function clearWidgetData(): void {
  if (!WidgetData) return;
  WidgetData.clearWidgetData();
}
